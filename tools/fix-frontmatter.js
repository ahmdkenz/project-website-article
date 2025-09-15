// tools/fix-frontmatter.js
// Usage: node tools/fix-frontmatter.js
// WARNING: modifies files in-place. Commit or backup first.

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

function normTagsBlock(tagsStr) {
  // try parse something like:
  // [\n  tag1,\n  tag2,\n ]
  // into array of strings
  const t = tagsStr.replace(/\n/g, " ").replace(/\[/g, " ").replace(/\]/g, " ");
  return t.split(",").map(s => s.trim()).filter(Boolean);
}

const files = glob.sync("content/articles/**/*.mdx");
console.log(`Found ${files.length} mdx files. Scanning...`);

files.forEach((f) => {
  let raw = fs.readFileSync(f, "utf8");

  // quick skip if no frontmatter delimiters
  if (!raw.startsWith("---")) return;

  // try parse; if parse fails, attempt gentle fixes then reparse
  try {
    matter(raw);
    return; // already valid frontmatter
  } catch (e) {
    console.log(`\nParsing error in ${f}: ${e.message}`);
    // we'll try to auto-fix a few common problems
  }

  // Extract until second '---'
  const parts = raw.split("---");
  if (parts.length < 3) {
    console.warn(` - Unexpected frontmatter format in ${f}, skipping.`);
    return;
  }
  const fmRaw = parts[1];
  const rest = parts.slice(2).join("---"); // content after frontmatter

  let fixed = fmRaw;

  // 1) fix mode="..." -> mode: "..."
  fixed = fixed.replace(/^\s*mode\s*=\s*"(.*)"\s*$/gim, 'mode: "$1"');
  fixed = fixed.replace(/^\s*mode\s*=\s*'(.*)'\s*$/gim, "mode: '$1'");

  // 2) If tags block looks like: tags:\n  [\n   a,\n   b,\n  ]
  // convert to YAML array
  const tagsBracketPattern = /tags:\s*\n\s*\[\s*\n([\s\S]*?)\n\s*\]\s*/m;
  if (tagsBracketPattern.test(fixed)) {
    fixed = fixed.replace(tagsBracketPattern, (m, inner) => {
      const items = inner.split(/[,\\n]/).map(s => s.replace(/["']/g, "").trim()).filter(Boolean);
      const yamlArr = items.map(it => `  - ${it}`).join("\n");
      return `tags:\n${yamlArr}\n`;
    });
  }

  // 3) If excerpt contains an unescaped newline inside the value (likely unquoted),
  // we will wrap excerpt as folded block '>'
  // Detect excerpt: excerpt: "some..."\n nextline starts with letter (i.e. broken)
  const excerptLinePattern = /excerpt:\s*"(.*)"\s*$/m;
  if (excerptLinePattern.test(fixed)) {
    // already quoted on single line -> ok
  } else {
    // try to detect excerpt: <some line> then following line not a key
    const lines = fixed.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*excerpt\s*:\s*(.*)$/.test(lines[i]) && !/:\s*$/.test(lines[i])) {
        // likely broken; gather until a line that looks like "key:" or end
        let content = lines[i].replace(/^\s*excerpt\s*:\s*/, "").trim();
        let j = i + 1;
        while (j < lines.length && !/^\s*[a-zA-Z0-9_-]+\s*:/.test(lines[j])) {
          content += " " + lines[j].trim();
          lines[j] = ""; // will be removed
          j++;
        }
        // replace block from i..j-1 with folded block
        lines[i] = `excerpt: >\n  ${content.trim()}`;
        for (let k = i + 1; k < j; k++) lines[k] = "";
        fixed = lines.filter(Boolean).join("\n");
      }
    }
  }

  // Reconstruct raw
  const newRaw = `---\n${fixed.trim()}\n---\n${rest.trimStart()}`;

  // final parse check
  try {
    matter(newRaw);
    fs.writeFileSync(f, newRaw, "utf8");
    console.log(` - Fixed ${f}`);
  } catch (err2) {
    console.warn(` - Could not auto-fix ${f}: ${err2.message}`);
  }
});

console.log("\nDone. Review changes (git diff) and commit if OK.");

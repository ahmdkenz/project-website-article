// scripts/fix-mdx-comments.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "glob";
import path from "node:path";

/**
 * - Ganti semua komentar HTML di MDX: <!-- ... -->  ->  {/* ... *\/}
 * - Opsional: ubah tags: [a, b, c] -> YAML multiline (lebih aman untuk beberapa parser)
 */

const files = globSync("content/articles/**/index.mdx", { nodir: true });

const htmlCommentRE = /<!--([\s\S]*?)-->/g;

// frontmatter tags inline: tags: [a, b, c]
const tagsInlineRE = /^tags:\s*\[([^\]]*?)\]\s*$/m;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  let out = src;

  // 1) convert HTML comments to JSX comments
  out = out.replace(htmlCommentRE, (_m, inner) => `{/*${inner}*/}`);

  // 2) convert inline tags array to multiline YAML (optional, safer)
  if (tagsInlineRE.test(out)) {
    out = out.replace(tagsInlineRE, (_m, inner) => {
      const items = inner
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.replace(/^['"]|['"]$/g, "")); // strip quotes

      const yaml = ["tags:"]
        .concat(items.map(x => `  - ${x}`))
        .join("\n");

      return yaml;
    });
  }

  writeFileSync(file, out, "utf8");
  console.log("✔ Fixed:", path.relative(process.cwd(), file));
}

console.log(`\nDone. Processed ${files.length} file(s).`);

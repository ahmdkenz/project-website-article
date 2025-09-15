// tools/check-modes.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

const files = glob.sync("content/articles/**/index.mdx");
const missing = [];
const bad = [];

files.forEach((f) => {
  const raw = fs.readFileSync(f, "utf8");
  const fm = matter(raw).data || {};
  if (!fm.mode) missing.push(f);
  else {
    const v = String(fm.mode).toLowerCase().trim();
    if (!["friendly", "moderate", "both"].includes(v)) bad.push({ f, mode: fm.mode });
  }
});

if (missing.length || bad.length) {
  console.log("MDX mode validation results:");
  if (missing.length) {
    console.log("\nFiles missing mode frontmatter:");
    missing.forEach((m) => console.log(" -", m));
  }
  if (bad.length) {
    console.log("\nFiles with invalid mode value:");
    bad.forEach((x) => console.log(" -", x.f, "=>", x.mode));
  }
  process.exitCode = 1;
} else {
  console.log("All MDX articles have valid mode frontmatter ✅");
}

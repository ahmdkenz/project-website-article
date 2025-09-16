const fs = require('fs');
const path = require('path');
const data = require('../data/terms.json');

const outDir = path.join(__dirname, '../data/terms');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Object.entries(data).forEach(([category, terms]) => {
  terms.forEach(term => {
    const filename = (term.term || term.id || 'untitled')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '') + '.mdx';
    const content = `---
term: "${term.term || ''}"
category: "${category}"
---

<Only mode="friendly">
${term.definitionFriendly || ''}
</Only>
<Only mode="moderate">
${term.definitionModerate || ''}
</Only>
`;
    fs.writeFileSync(path.join(outDir, filename), content, 'utf8');
  });
});
console.log('Migrasi terms selesai!');
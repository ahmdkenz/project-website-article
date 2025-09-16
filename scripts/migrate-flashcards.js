const fs = require('fs');
const path = require('path');
const data = require('../data/flashcards.json');

const outDir = path.join(__dirname, '../data/flashcards');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

data.forEach(card => {
  const filename = (card.term || card.id || 'untitled')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '') + '.mdx';
  const content = `---
term: "${card.term || ''}"
category: "${card.category || ''}"
---

<Only mode="friendly">
${card.definitionFriendly || ''}
</Only>
<Only mode="moderate">
${card.definitionModerate || ''}
</Only>
`;
  fs.writeFileSync(path.join(outDir, filename), content, 'utf8');
});
console.log('Migrasi flashcards selesai!');
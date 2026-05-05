const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (f === 'node_modules' || f === '.next' || f === 'fix-rounded.js') continue;
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) files = files.concat(walk(full));
        else if (f.endsWith('.tsx') || f.endsWith('.ts')) files.push(full);
      } catch {}
    }
  } catch {}
  return files;
}

const replacements = [
  [/rounded-\[4rem\]/g, 'rounded-2xl'],
  [/rounded-\[3\.5rem\]/g, 'rounded-2xl'],
  [/rounded-\[3rem\]/g, 'rounded-2xl'],
  [/rounded-\[2\.5rem\]/g, 'rounded-xl'],
  [/rounded-\[2rem\]/g, 'rounded-xl'],
  [/rounded-\[1\.8rem\]/g, 'rounded-lg'],
  [/rounded-\[1\.5rem\]/g, 'rounded-lg'],
  [/rounded-3xl/g, 'rounded-xl'],
];

let count = 0;
for (const file of walk(__dirname)) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    const next = content.replace(from, to);
    if (next !== content) { content = next; changed = true; }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', path.relative(__dirname, file));
    count++;
  }
}
console.log('Done. Files updated:', count);

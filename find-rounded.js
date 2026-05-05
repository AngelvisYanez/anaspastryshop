const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (['node_modules', '.next', 'fix-rounded.js', 'find-rounded.js'].includes(f)) continue;
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) files = files.concat(walk(full));
      else if (f.endsWith('.tsx') || f.endsWith('.ts')) files.push(full);
    } catch {}
  }
  return files;
}

for (const file of walk(__dirname)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // rounded-full on non-circular/non-blob elements
    if (line.includes('rounded-full') && !line.includes('blur-')) {
      console.log(path.relative(__dirname, file) + ':' + (i+1) + ' >>> ' + line.trim().substring(0, 100));
    }
  });
}

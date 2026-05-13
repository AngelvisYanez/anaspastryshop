import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('app/dashboard/suscripciones/PlansManager.tsx', 'utf8');

// Detect line ending
const crlf = c.includes('\r\n');
const NL = crlf ? '\r\n' : '\n';

// Wrap return in fragment
const returnGrid = `return (${NL}    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">`;
const returnGridFragment = `return (${NL}    <>${NL}    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">`;

if (!c.includes(returnGrid)) {
  console.log('ERROR: return pattern not found');
  process.exit(1);
}
c = c.replace(returnGrid, returnGridFragment);

// Fix closing - find the last modal closing and add fragment close
const oldEnd = `      )}${NL}  );${NL}}`;
const newEnd = `      )}${NL}    </>${NL}  );${NL}}`;

const lastIdx = c.lastIndexOf(oldEnd);
if (lastIdx === -1) {
  console.log('ERROR: end pattern not found. Trying alternative...');
  // Try without CRLF
  const altEnd = '      )}\n  );\n}';
  const altNew = '      )}\n    </>\n  );\n}';
  const altIdx = c.lastIndexOf(altEnd);
  if (altIdx === -1) {
    console.log('ERROR: no pattern found');
    process.exit(1);
  }
  c = c.substring(0, altIdx) + altNew + c.substring(altIdx + altEnd.length);
} else {
  c = c.substring(0, lastIdx) + newEnd + c.substring(lastIdx + oldEnd.length);
}

writeFileSync('app/dashboard/suscripciones/PlansManager.tsx', c, 'utf8');
console.log('has fragment:', c.includes('<>'));
console.log('End of file:');
console.log(c.slice(-100));

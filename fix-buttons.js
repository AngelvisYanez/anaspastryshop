const fs = require('fs');

// Files and their button rounded-full replacements
// Only targets lines with button-like rounded-full (with px-/py- padding patterns)
const files = [
  'app/checkout/membresia/CheckoutMembresia.tsx',
  'app/checkout/success/page.tsx',
  'app/dashboard/mis-cursos/page.tsx',
  'app/dashboard/page.tsx',
  'app/membresia/MembresiaClient.tsx',
  'app/nosotros/page.tsx',
  'app/not-found.tsx',
  'app/pasantias/page.tsx',
  'app/cursos/PublicCoursesClient.tsx',
  'app/planes/PlanesClient.tsx',
];

for (const rel of files) {
  const file = require('path').join(__dirname, rel);
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const updated = lines.map(line => {
    // Skip lines with circular/dot/toggle/spinner/avatar context
    if (
      /w-[12345](\.\d+)? h-[12345](\.\d+)?.*rounded-full/.test(line) ||  // small circles
      /rounded-full.*animate-spin/.test(line) ||  // spinners
      /h-[12](\.\d+)?\s/.test(line) && line.includes('rounded-full') ||  // progress bars/thin bars
      /w-[456789](\.\d+)? h-[23456789](\.\d+)? (bg|border)-.*(rounded-full|relative)/.test(line) ||  // toggles
      /animate-ping/.test(line) ||  // ping dots
      /animate-pulse.*rounded-full/.test(line) ||  // pulse dots
      line.includes('border-t-transparent') ||  // spinners
      /w-[23] h-[23]/.test(line)  // notification badges
    ) {
      return line;
    }
    
    // Replace rounded-full on button-like elements (have padding classes)
    if (line.includes('rounded-full') && (line.includes('px-') || line.includes('py-') || line.includes('<button') || line.includes('className="w-full'))) {
      return line.replace(/rounded-full/g, 'rounded-xl');
    }
    
    return line;
  });
  
  const newContent = updated.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', rel);
  }
}
console.log('Done.');

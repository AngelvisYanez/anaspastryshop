const fs = require('fs');
const path = require('path');
const base = __dirname;

// 1. DashboardHeader.tsx — remove talleres route line
const dh = path.join(base, 'app/dashboard/DashboardHeader.tsx');
let dhc = fs.readFileSync(dh, 'utf8');
dhc = dhc.replace(/.*path\.includes\("\/talleres"\).*\r?\n/, '');
fs.writeFileSync(dh, dhc);
console.log('1. DashboardHeader done');

// 2. MentoresView.tsx — header, cell, count, warning
const mv = path.join(base, 'app/dashboard/mentores/MentoresView.tsx');
let mvc = fs.readFileSync(mv, 'utf8');
mvc = mvc.replace(/<th className="pb-4">Talleres<\/th>/, '<th className="pb-4">Cursos</th>');
mvc = mvc.replace('{/* Talleres */}', '{/* Cursos */}');
mvc = mvc.replace('mentor._count.talleres', 'mentor._count.cursos');
mvc = mvc.replace('Si el mentor tiene talleres activos,', 'Si el mentor tiene cursos activos,');
fs.writeFileSync(mv, mvc);
console.log('2. MentoresView done');

// 3. PaymentCard.tsx — remove taller fallbacks
const pc = path.join(base, 'app/dashboard/pagos/PaymentCard.tsx');
let pcc = fs.readFileSync(pc, 'utf8');
pcc = pcc.replace('inscription.taller?.title || inscription.curso?.title', 'inscription.curso?.title');
pcc = pcc.replace('inscription.taller?.price || inscription.curso?.price', 'inscription.curso?.price');
fs.writeFileSync(pc, pcc);
console.log('3. PaymentCard done');

// 4. logs/page.tsx — remove TALLER entry
const lp = path.join(base, 'app/dashboard/logs/page.tsx');
let lpc = fs.readFileSync(lp, 'utf8');
lpc = lpc.replace(/\s*TALLER:\s+"Taller",?\r?\n/, '\n');
fs.writeFileSync(lp, lpc);
console.log('4. logs/page done');

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  await prisma.platformSection.upsert({
    where: { slug: 'nosotros' },
    update: { name: 'Nosotros', icon: 'Users', order: 5, roles: ['USER'], isActive: true },
    create: { name: 'Nosotros', slug: 'nosotros', icon: 'Users', order: 5, roles: ['USER'], isActive: true }
  });
  console.log('Nosotros OK');

  const deleted = await prisma.platformSection.deleteMany({ where: { slug: 'pasantias' } });
  console.log('Pasantias deleted:', deleted.count);

  const all = await prisma.platformSection.findMany({ orderBy: { order: 'asc' }, select: { name: true, slug: true } });
  console.log('Remaining:', all.map(s => s.name).join(', '));
} catch(e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}

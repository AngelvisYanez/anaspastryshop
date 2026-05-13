import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const user = await p.user.findUnique({
  where: { email: 'testuser.acu@mailinator.com' },
  select: { id: true, name: true, email: true }
});

console.log('User:', JSON.stringify(user));

if (!user) {
  console.log('User not found');
  await p.$disconnect();
  process.exit(1);
}

const inscriptions = await p.inscription.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
});

console.log('Inscriptions:', JSON.stringify(inscriptions, null, 2));

if (inscriptions.length === 0) {
  console.log('No inscriptions found');
  await p.$disconnect();
  process.exit(1);
}

const inscription = inscriptions[0];
console.log('Approving inscription:', inscription.id);

await p.inscription.update({
  where: { id: inscription.id },
  data: { status: 'APPROVED' }
});

const plan = await p.subscriptionPlan.findFirst({ where: { isActive: true } });
const now = new Date();
const endDate = new Date(now);
endDate.setMonth(endDate.getMonth() + 1);

await p.subscription.upsert({
  where: { userId: user.id },
  create: {
    userId: user.id,
    plan: plan?.slug ?? 'membresia',
    status: 'ACTIVE',
    startDate: now,
    endDate,
  },
  update: {
    status: 'ACTIVE',
    startDate: now,
    endDate,
  },
});

console.log('✅ Payment approved and subscription created for', user.email);
console.log('Plan:', plan?.slug, '| End date:', endDate.toISOString());

await p.$disconnect();

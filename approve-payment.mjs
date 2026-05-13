import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

const user = await p.user.findUnique({
  where: { email: 'angelviselyanez@gmail.com' },
  include: {
    subscription: true,
    inscripciones: {
      where: { status: 'APPROVED' },
      orderBy: { updatedAt: 'desc' },
      take: 3
    }
  }
})

console.log('User:', user?.name, user?.email)
console.log('Subscription status:', user?.subscription?.status)
console.log('Subscription endDate:', user?.subscription?.endDate)
console.log('Approved inscriptions:', user?.inscripciones?.length)

await p.$disconnect()

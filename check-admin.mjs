import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const p = new PrismaClient()

const admins = await p.user.findMany({ 
  where: { role: 'ADMIN' },
  select: { email: true, isActive: true, isApproved: true, password: true }
})

for (const u of admins) {
  const match = await bcrypt.compare('admin123', u.password || '')
  console.log(`${u.email}: isActive=${u.isActive}, isApproved=${u.isApproved}, passwordMatch=${match}`)
}

await p.$disconnect()

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Exito2026!', 10)

  const user = await prisma.user.upsert({
    where: { email: 'acuadmin@academiacredito.com' },
    update: {
      name: 'ACUADMIN',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      isActive: true,
    },
    create: {
      email: 'acuadmin@academiacredito.com',
      name: 'ACUADMIN',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
      isActive: true,
    },
  })

  console.log('Usuario admin creado:', user.email, '| Rol:', user.role)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

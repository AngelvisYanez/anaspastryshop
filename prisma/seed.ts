import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 1. Crear Usuario Principal (Newman)
  await prisma.user.upsert({
    where: { email: 'newman@artica.group' },
    update: {},
    create: {
      email: 'newman@artica.group',
      name: 'Newman Acosta',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
    },
  })

  // 2. Crear Admin Genérico
  await prisma.user.upsert({
    where: { email: 'admin@artica.media' },
    update: {},
    create: {
      email: 'admin@artica.media',
      name: 'Admin Articademy',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
    },
  })

  // 3. Crear Mentor
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@artica.media' },
    update: {},
    create: {
      email: 'mentor@artica.media',
      name: 'Mentor Media Ads',
      password: hashedPassword,
      role: 'MENTOR',
      isApproved: true,
    },
  })

  // 4. Crear un Curso de ejemplo con la NUEVA estructura
  await prisma.curso.create({
    data: {
      title: 'Meta Ads Academy 2026',
      description: 'Aprende a vender lo que sea con publicidad en Facebook e Instagram.',
      price: 45,
      totalHours: 10,
      totalClasses: 3,
      level: 'Intermedio',
      instructorId: mentor.id,
      courseModules: {
        create: [
          {
            title: 'Módulo 1: Fundamentos y Estructura',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            order: 0,
            lessons: {
              create: [
                {
                  title: 'El Ecosistema de Meta',
                  summary: 'Diferencia entre botón "Promocionar" vs. Ads Manager.',
                  order: 0
                },
                {
                  title: 'Estructura de una Campaña',
                  summary: 'Campaña, Conjunto de anuncios y Anuncio.',
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seed completed successfully with user: newman@artica.group')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

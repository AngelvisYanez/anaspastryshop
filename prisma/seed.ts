import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 1. Crear Usuario Principal (Admin)
  await prisma.user.upsert({
    where: { email: 'admin@academiaomnia.com' },
    update: {},
    create: {
      email: 'admin@academiaomnia.com',
      name: 'Admin Academia Omnia',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
    },
  })

  // 2. Crear Admin Genérico
  await prisma.user.upsert({
    where: { email: 'equipo@academiaomnia.com' },
    update: {},
    create: {
      email: 'equipo@academiaomnia.com',
      name: 'Equipo Academia Omnia',
      password: hashedPassword,
      role: 'ADMIN',
      isApproved: true,
    },
  })

  // 3. Crear Mentor
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@academiaomnia.com' },
    update: {},
    create: {
      email: 'mentor@academiaomnia.com',
      name: 'Mentor Academia Omnia',
      password: hashedPassword,
      role: 'MENTOR',
      isApproved: true,
    },
  })

  // 4. Crear un Curso de ejemplo con la NUEVA estructura
  await prisma.curso.create({
    data: {
      title: 'Publicidad Digital 2026',
      description: 'Aprende a crear campañas publicitarias efectivas en las plataformas digitales más usadas.',
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
                  title: 'El Ecosistema Digital',
                  summary: 'Diferencia entre promocionar contenido y gestionar campañas desde una plataforma publicitaria.',
                  order: 0
                },
                {
                  title: 'Estructura de una Campaña',
                  summary: 'Campaña, conjunto de anuncios y anuncio.',
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seed completed successfully with user: admin@academiaomnia.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

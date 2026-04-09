import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  const cursoCount = await prisma.curso.count()
  const moduleCount = await prisma.courseModule.count()
  const lessonCount = await prisma.lesson.count()

  console.log({
    users: userCount,
    cursos: cursoCount,
    modules: moduleCount,
    lessons: lessonCount
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SECTIONS = [
  { name: "Cursos",      slug: "cursos",      icon: "BookOpen",    order: 1, roles: ["ADMIN", "MENTOR", "USER"] },
  { name: "Lives",       slug: "lives",       icon: "Radio",       order: 2, roles: ["ADMIN", "MENTOR", "USER"] },
  { name: "Planes",      slug: "planes",      icon: "Star",        order: 4, roles: ["USER"] },
  { name: "Nosotros",    slug: "nosotros",    icon: "Users",       order: 5, roles: ["USER"] },
  { name: "Pasantías",   slug: "pasantias",   icon: "Briefcase",   order: 6, roles: ["USER"] },
  { name: "Mis Cursos",  slug: "mis-cursos",  icon: "GraduationCap", order: 7, roles: ["USER"] },
  { name: "Categorías",  slug: "categorias",  icon: "Tag",         order: 8, roles: ["ADMIN"] },
  { name: "Usuarios",    slug: "usuarios",    icon: "Users",       order: 9, roles: ["ADMIN", "MENTOR"] },
]

async function main() {
  console.log('Insertando módulos de plataforma...\n')
  for (const s of SECTIONS) {
    await prisma.platformSection.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    })
    console.log(`  ✓ ${s.name} (/${s.slug}) — roles: ${s.roles.join(', ')}`)
  }
  console.log('\nListo.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

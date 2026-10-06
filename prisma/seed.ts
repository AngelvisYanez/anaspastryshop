import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { WORKSHOP_LOCATION } from '../lib/utils/workshop'

const prisma = new PrismaClient()

const WORKSHOPS_SEED = [
  {
    slug: 'workshop-tortas-basicas',
    title: 'WORKSHOP TORTAS BÁSICAS',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a realizar tortas desde cero y también para aquellas que deseen afianzar sus conocimientos. Solo 8 cupos.',
    price: 70,
    spots: 8,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Desde Cero',
    image: '/foto-1.webp',
    isDecorationWorkshop: false,
    studentRequirements: 'El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (son 5 porciones de tortas).',
    realizaremos: [
      'Torta de vainilla y variaciones (torta sabor a limón)',
      'Torta marmoleada',
      'Torta de chocolate',
      'Torta de piña',
      'Glaseado cítrico',
      'Ganache de chocolate',
      'Muro de contención',
      'Merengue italiano (clase demostrativa)',
      'Ensamblaje, relleno y decoración de una torta alta con merengue italiano (clase demostrativa)',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Degustación de todas las preparaciones',
      '5 porciones de tortas para llevar',
    ],
  },
  {
    slug: 'workshop-tortas-especiales',
    title: 'WORKSHOP TORTAS ESPECIALES',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a realizar tortas especiales con sus diferentes variaciones y también para aquellas que deseen afianzar sus conocimientos. Solo 8 cupos.',
    price: 80,
    spots: 8,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Todos los niveles',
    image: '/foto-4.webp',
    isDecorationWorkshop: false,
    studentRequirements: 'El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (son 4 porciones de tortas).',
    realizaremos: [
      'Torta Red Velvet',
      'Torta de Zanahoria',
      'Frosting de queso crema',
      'Torta Tres Leches',
      'Crema chantilly',
      'Torta fría de Parchita (bizcocho genovés, crema de parchita)',
      'Chantilly de parchita',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Degustación de todas las preparaciones',
      '4 porciones de tortas para llevar',
    ],
  },
  {
    slug: 'workshop-candy-bar',
    title: 'WORKSHOP CANDY BAR',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a realizar dulces en presentación mini, ideales para fiestas y eventos. Solo 8 cupos.',
    price: 80,
    spots: 8,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Todos los niveles',
    image: '/foto-5.webp',
    isDecorationWorkshop: false,
    studentRequirements: 'El alumno debe traer un envase grande para llevarse todas las preparaciones que realizaremos (son 10 tipos de dulces).',
    realizaremos: [
      'Mini Cupcakes',
      'Suspiros',
      'Cake pops',
      'Paletas de Chocolate',
      'Mini Brownies',
      'Mini Alfajores',
      'Mini Polvorosas',
      'Mini Pavlovas',
      'Trufas de Chocolate',
      'Shots de Limón/Parchita',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Degustación de todas las preparaciones',
      '10 tipos de mini dulces para llevar',
    ],
  },
  {
    slug: 'workshop-buttercream-de-chocolate-blanco',
    title: 'WORKSHOP BUTTERCREAM DE CHOCOLATE BLANCO',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a decorar tortas desde cero y también para aquellas que deseen afianzar sus conocimientos. Solo 6 cupos.',
    price: 90,
    spots: 6,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Desde Cero a Intermedio',
    image: '/foto-2.webp',
    isDecorationWorkshop: true,
    studentRequirements: 'El alumno debe traer una base giratoria (de no tener, notificar previamente que disponemos de 3 bases para solventar).',
    realizaremos: [
      'Receta de torta de vainilla',
      'Ensamblado en torta real',
      'Relleno correcto',
      'Receta de buttercream de chocolate blanco',
      'Frisado de torta con buttercream de chocolate blanco',
      'Bordes perfectos',
      'Uso de stencil',
      'Elaboración de esferas de chocolate',
      'Muchos otros tips',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Torta real individual de trabajo',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Cada participante se lleva su proyecto a casa',
      'Caja para traslado de la torta',
    ],
  },
  {
    slug: 'workshop-buttercream-de-chocolate-blanco-avanzado',
    title: 'WORKSHOP BUTTERCREAM DE CHOCOLATE BLANCO Avanzado',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a decorar tortas de niveles con esta cubierta y también para aquellas que deseen afianzar sus conocimientos. Solo 6 cupos.',
    price: 150,
    spots: 6,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Intermedio a Avanzado',
    image: '/foto-3.webp',
    isDecorationWorkshop: true,
    studentRequirements: 'El alumno debe traer una base giratoria (de no tener, notificar previamente que disponemos de 3 bases para solventar).',
    realizaremos: [
      'Recetas de torta de vainilla',
      'Proporción ideal y distribución de la torta según niveles',
      'Ensamblado en torta real',
      'Ganache de chocolate para muro de contención',
      'Relleno correcto',
      'Receta de buttercream de chocolate blanco',
      'Frisado de torta con buttercream de chocolate blanco',
      'Bordes perfectos',
      'Montaje de tortas (2 niveles)',
      'Uso de stencil',
      'Uso de manga pastelera',
      'Muchos otros tips',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Tortas reales de trabajo por alumno',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Cada participante se lleva su proyecto a casa',
      'Caja para traslado de la torta',
    ],
  },
  {
    slug: 'workshop-fondant-basico',
    title: 'WORKSHOP FONDANT BÁSICO',
    description: 'Eleva tu repostería al siguiente nivel con este workshop. Aprenderás a estructurar tortas reales con un sellado impecable en Ganache (blanco y oscuro), logrando el lienzo perfecto para un forrado en fondant de alta costura. Solo 3 cupos.',
    price: 160,
    spots: 3,
    duration: 'Jornada intensiva',
    startTime: '2:00 PM',
    schedule: 'Se realiza en días de semana (Revisar cronograma de talleres)',
    level: 'Todos los niveles',
    image: '/foto-7.webp',
    isDecorationWorkshop: true,
    studentRequirements: 'El alumno debe traer una base giratoria.',
    realizaremos: [
      'Ensamblado en torta real',
      'Relleno correcto',
      'Receta Ganache de chocolate oscuro',
      'Receta Ganache de chocolate blanco',
      'Bordes perfectos',
      'Receta de fondant',
      'Cubrir pastel con fondant',
      'Modelado en Fondant (lazo)',
      'Aplicación de Papel de azúcar',
      'Muchos otros tips más',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Torta real de trabajo por participante',
      'Refrigerio completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Cada participante se lleva su proyecto a casa',
      'Caja para traslado de la torta',
    ],
  },
  {
    slug: 'workshop-ganache-de-chocolate',
    title: 'WORKSHOP GANACHE DE CHOCOLATE',
    description: 'Es un taller dirigido a todas las personas que deseen aprender a decorar tortas desde cero con esta cubierta y también para aquellas que deseen afianzar sus conocimientos. Solo 6 cupos.',
    price: 120,
    spots: 6,
    duration: '8 horas aproximadamente (9:00am – 4 a 5 pm)',
    startTime: '9:00 AM',
    schedule: 'Día Domingo (Revisar cronograma de talleres)',
    level: 'Desde Cero a Intermedio',
    image: '/foto-6.webp',
    isDecorationWorkshop: true,
    studentRequirements: 'El alumno debe traer una base giratoria (de no tener, notificar previamente que disponemos de 3 bases para solventar).',
    realizaremos: [
      'Receta de torta de chocolate',
      'Ensamblado en torta real',
      'Relleno correcto',
      'Receta de ganache de chocolate oscuro',
      'Receta de ganache de chocolate blanco',
      'Frisado de torta con ganache de chocolate oscuro',
      'Bordes perfectos',
      'Uso de stencil',
      'Elaboración de esferas de chocolate',
      'Muchos otros tips',
    ],
    incluye: [
      'Todos los materiales y utensilios',
      'Torta real individual para cada alumno',
      'Almuerzo completo',
      'Certificado de asistencia',
      'Recetario impreso',
      'Cada participante se lleva su proyecto a casa',
      'Caja para traslado de la torta',
    ],
  },
]

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Crear o actualizar usuario administrador (Anais Flores)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@anaspastryshop.com' },
    update: {
      name: 'Anais Flores',
      role: 'ADMIN',
      isActive: true,
      isApproved: true,
      image: '/foto-1.webp',
    },
    create: {
      email: 'admin@anaspastryshop.com',
      name: 'Anais Flores',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isApproved: true,
      image: '/foto-1.webp',
    },
  })

  // Upsert in-person workshops
  for (const w of WORKSHOPS_SEED) {
    const contentPayload = JSON.stringify({
      isWorkshop: true,
      slug: w.slug,
      location: WORKSHOP_LOCATION,
      workshopDate: w.schedule,
      workshopTime: w.startTime + ' — ' + (w.spots === 3 ? '6:00 PM' : '5:00 PM'),
      spots: w.spots,
      duration: w.duration,
      studentRequirements: w.studentRequirements,
      isDecorationWorkshop: w.isDecorationWorkshop,
      realizaremos: w.realizaremos,
      incluye: w.incluye,
    })

    // react-doctor-disable-next-line react-doctor/async-await-in-loop -- one-off seed script: a readable per-row read-then-write is preferred over a bulk query
    const existing = await prisma.curso.findFirst({
      where: {
        OR: [
          { title: w.title },
          { content: { contains: w.slug } },
        ],
      },
    })

    if (existing) {
      await prisma.curso.update({
        where: { id: existing.id },
        data: {
          title: w.title,
          description: w.description,
          price: w.price,
          totalHours: w.spots === 3 ? 4 : 8,
          totalClasses: 1,
          level: w.level,
          category: 'Workshops Presenciales',
          image: w.image,
          isLive: true,
          content: contentPayload,
          instructorId: admin.id,
        },
      })
    } else {
      await prisma.curso.create({
        data: {
          title: w.title,
          description: w.description,
          price: w.price,
          totalHours: w.spots === 3 ? 4 : 8,
          totalClasses: 1,
          level: w.level,
          category: 'Workshops Presenciales',
          image: w.image,
          isLive: true,
          content: contentPayload,
          instructorId: admin.id,
        },
      })
    }
  }

  // Cursos online base
  const onlineCourses = [
    {
      title: 'Cake de Piña',
      description: 'Aprende a preparar desde cero una clásica y deliciosa torta de piña esponjosa y su variación de quesipiña con un caramelo brillante en su punto exacto y una presentación de pastelería profesional.',
      price: 45,
      totalHours: 12,
      totalClasses: 12,
      level: 'Desde Cero',
      category: 'Cursos Online',
      slug: 'cake-de-pina',
      image: '/curso-online-cake-de-pina.png',
      isLive: false,
      content: JSON.stringify({ isWorkshop: false }),
    },
    {
      title: 'Merengue Italiano',
      description: "Te enseñamos el método infalible de Ana's Pastry Shop para dominar la técnica exacta del merengue italiano. Aprende a conseguir esa textura sedosa, brillante y con la estabilidad ideal para decorar tortas impecables y llevar tus postres al siguiente nivel.",
      price: 35,
      totalHours: 8,
      totalClasses: 8,
      level: 'Todos los niveles',
      category: 'Cursos Online',
      slug: 'merengue-italiano',
      image: '/curso-online-merengue-italiano.png',
      isLive: false,
      content: JSON.stringify({ isWorkshop: false }),
    },
  ]

  for (const oc of onlineCourses) {
    // react-doctor-disable-next-line react-doctor/async-await-in-loop -- one-off seed script: a readable per-row read-then-write is preferred over a bulk query
    const existing = await prisma.curso.findFirst({
      where: { title: oc.title },
    })

    if (!existing) {
      await prisma.curso.create({
        data: {
          ...oc,
          instructorId: admin.id,
        },
      })
    } else {
      await prisma.curso.update({
        where: { id: existing.id },
        data: {
          description: oc.description,
          totalClasses: oc.totalClasses,
          slug: existing.slug ?? oc.slug,
          image: existing.image ?? oc.image,
        },
      })
    }
  }

  console.log('Seed completed successfully: workshops and online courses registered!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

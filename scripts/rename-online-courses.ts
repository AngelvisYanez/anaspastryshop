/**
 * Renombra los dos cursos online genéricos a los cursos reales y les asigna
 * las portadas que viven en /public.
 *
 * Dry-run por defecto. Para escribir en la base de datos:
 *   npx tsx scripts/rename-online-courses.ts --apply
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Mapeo curso actual -> curso final.
 * Si necesitas cruzarlo, intercambia los dos `from` de arriba.
 */
const RENAMES: Array<{ from: string; to: string; slug: string; image: string }> = [
  {
    from: "Curso Online: Repostería & Pastelería Desde Cero",
    to: "Cake de Piña",
    slug: "cake-de-pina",
    image: "/curso-online-cake-de-piña.png",
  },
  {
    from: "Masterclass Online: Técnicas de Bizcochos & Rellenos Gourmet Estables",
    to: "Merengue Italiano",
    slug: "merengue-italiano",
    image: "/curso-online-merengue-italiano.png",
  },
];

async function main() {
  const apply = process.argv.includes("--apply");

  for (const rename of RENAMES) {
    const course = await prisma.curso.findFirst({ where: { title: rename.from } });

    if (!course) {
      console.log(`? No se encontró el curso "${rename.from}". ¿Ya fue renombrado?`);
      continue;
    }

    const slugTaken = await prisma.curso.findFirst({
      where: { slug: rename.slug, NOT: { id: course.id } },
      select: { title: true },
    });

    if (slugTaken) {
      console.log(`! El slug "${rename.slug}" ya lo usa "${slugTaken.title}". Omite ${rename.to}.`);
      continue;
    }

    const changes: string[] = [];
    if (course.title !== rename.to) changes.push(`título  "${course.title}" -> "${rename.to}"`);
    if (course.image !== rename.image) changes.push(`imagen  "${course.image}" -> "${rename.image}"`);
    if (course.slug !== rename.slug) changes.push(`slug    "${course.slug ?? "(vacío)"}" -> "${rename.slug}"`);

    if (!changes.length) {
      console.log(`= ${rename.to} ya está al día.`);
      continue;
    }

    console.log(`\n${rename.to}`);
    changes.forEach((c) => console.log(`    ${c}`));

    if (apply) {
      await prisma.curso.update({
        where: { id: course.id },
        data: { title: rename.to, slug: rename.slug, image: rename.image },
      });
      console.log("    -> aplicado");
    }
  }

  console.log(
    apply
      ? "\nListo. Reinicia el dev server para refrescar la caché de cursos."
      : "\nDry-run. Ejecuta con --apply para escribir en la base de datos."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Asigna las portadas de /public a los cursos online de la base de datos.
 *
 * Por defecto solo muestra el plan (dry-run). Pasa `--apply` para escribir:
 *   npx tsx scripts/set-online-course-covers.ts --apply
 *
 * El mapeo curso -> portada se define abajo en COVER_BY_TITLE.
 */
import { PrismaClient } from "@prisma/client";
import { normalize } from "@/lib/data/onlineCourseCovers";

const prisma = new PrismaClient();

const COVER_BY_TITLE: Array<{ contains: string; image: string }> = [
  { contains: "cake de piña", image: "/curso-online-cake-de-piña.png" },
  { contains: "merengue italiano", image: "/curso-online-merengue-italiano.png" },
];

function coverFor(title: string): string | null {
  const haystack = normalize(title);
  const match = COVER_BY_TITLE.find((entry) => haystack.includes(normalize(entry.contains)));
  return match ? match.image : null;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const courses = await prisma.curso.findMany({
    where: { category: "Cursos Online" },
    select: { id: true, title: true, image: true },
  });

  if (!courses.length) {
    console.log("No hay cursos online en la base de datos.");
    return;
  }

  let changed = 0;

  for (const course of courses) {
    const cover = coverFor(course.title);

    if (!cover) {
      console.log(`- ${course.title}\n    sin portada dedicada en /public (se mantiene "${course.image}")`);
      continue;
    }

    if (course.image === cover) {
      console.log(`= ${course.title}\n    ya tiene ${cover}`);
      continue;
    }

    console.log(`${apply ? "~" : "*"} ${course.title}\n    "${course.image}" -> ${cover}`);
    changed++;

    if (apply) {
      await prisma.curso.update({ where: { id: course.id }, data: { image: cover } });
    }
  }

  console.log(
    apply
      ? `\nListo. ${changed} curso(s) actualizado(s).`
      : `\nDry-run: ${changed} curso(s) cambiarían. Ejecuta con --apply para aplicarlo.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

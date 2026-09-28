/**
 * Convierte texto libre en un slug apto para URL: sin acentos, sin mayúsculas,
 * separado por guiones. "Repostería & Pastelería Desde Cero" -> "reposteria-pasteleria-desde-cero".
 */
export function slugify(value: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Genera un slug único a partir de una base, añadiendo sufijos `-2`, `-3`, ...
 * mientras `isTaken` devuelva true. `isTaken` debe ser asíncrono porque consulta la BD.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "curso";
  if (!(await isTaken(root))) return root;

  for (let n = 2; n < 100; n++) {
    const candidate = `${root}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${root}-${Date.now()}`;
}

/** Routes whose hero sits on a dark image, so the navbar uses light text until scroll. */
export function isDarkHeroPath(pathname: string): boolean {
  return (
    pathname === "/cursos" ||
    pathname.startsWith("/cursos/") ||
    pathname === "/workshops" ||
    pathname.startsWith("/workshops/") ||
    pathname.startsWith("/workshop/") ||
    pathname === "/nosotros" ||
    pathname === "/pasteleria" ||
    pathname === "/iniciar-sesion" ||
    pathname === "/registro" ||
    pathname === "/olvide-mi-contrasena" ||
    pathname === "/restablecer-contrasena" ||
    pathname.startsWith("/pagar/")
  );
}

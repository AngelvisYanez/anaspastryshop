import { describe, expect, it } from "vitest";
import { isDarkHeroPath } from "@/lib/utils/isDarkHeroPath";

describe("isDarkHeroPath", () => {
  it.each([
    "/cursos",
    "/cursos/cake-de-pina",
    "/workshops",
    "/workshops/calendario",
    "/workshop/tortas-basicas",
    "/nosotros",
    "/pasteleria",
    "/iniciar-sesion",
    "/registro",
    "/olvide-mi-contrasena",
    "/restablecer-contrasena",
    "/pagar/bolsa",
    "/pagar/curso/abc",
  ])("es dark hero: %s", (pathname) => {
    expect(isDarkHeroPath(pathname)).toBe(true);
  });

  it.each(["/", "/dashboard", "/dashboard/pagos", "/galeria"])(
    "no es dark hero: %s",
    (pathname) => {
      expect(isDarkHeroPath(pathname)).toBe(false);
    },
  );
});

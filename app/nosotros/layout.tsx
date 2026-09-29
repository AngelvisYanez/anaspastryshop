import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, buildPageMetadata, GEO } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: `Anais Flores — Chef Pastelera en ${GEO.shortAddress}, Venezuela`,
  description:
    "Conoce a Anais Flores, chef pastelera e instructora de Ana's Pastry Shop. Workshops en Coro, Falcón (Venezuela), y cursos online para alumnas de todo el mundo.",
  path: "/nosotros",
  keywords: [
    "Anais Flores pastelera",
    "chef pastelería Coro Falcón",
    "instructora pastelería Venezuela",
    "Ana's Pastry Shop nosotros",
  ],
});

export default function NosotrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Sobre Anais Flores", path: "/nosotros" },
        ])}
      />
      {children}
    </>
  );
}

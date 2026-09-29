import type { Metadata } from "next";
import {
  WORKSHOP_LOCATION,
  WORKSHOP_LOCATION_SHORT,
} from "@/lib/utils/workshop";

/** URL canónica del sitio (sin slash final). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://anaspastryshop.com";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://anaspastryshop.com";
  }
}

export const SITE_NAME = "Ana's Pastry Shop";
export const SITE_LEGAL_NAME = "Ana's Pastry Shop — Anais Flores";
export const SITE_EMAIL = "contacto@anaspastryshop.com";
export const SITE_PHONE_E164 = "+584121658015";
export const SITE_WHATSAPP = "584121658015";
export const SITE_INSTAGRAM = "https://www.instagram.com/anaspastryshopve/";
export const SITE_INSTAGRAM_HANDLE = "@anaspastryshopve";

/** Sede presencial (Coro, Falcón). */
export const GEO = {
  streetAddress:
    "Av. Tirso Salavarria entre calle Iturbe y calle Las Margaritas, Frente al museo de la UNEFM",
  addressLocality: "Coro",
  addressRegion: "Falcón",
  addressCountry: "VE",
  postalCode: "4101",
  latitude: 11.4047,
  longitude: -69.6735,
  placename: "Coro, Falcón, Venezuela",
  regionMeta: "VE-I",
  fullAddress: WORKSHOP_LOCATION,
  shortAddress: WORKSHOP_LOCATION_SHORT,
} as const;

/** Regiones donde los cursos online están disponibles (sin landings). */
export const ONLINE_REGIONS = [
  "Venezuela",
  "Latinoamérica",
  "España",
  "Estados Unidos",
  "Europa",
  "Resto del mundo",
] as const;

export const DEFAULT_TITLE =
  "Ana's Pastry Shop | Cursos Online Globales y Workshops en Venezuela";

export const DEFAULT_DESCRIPTION =
  "Cursos online de pastelería disponibles en todo el mundo y workshops presenciales en Coro, Falcón (Venezuela), con la Chef Anais Flores. Formación profesional desde cero, a tu ritmo.";

/** Keywords: online global + sede VE / Coro. */
export const SITE_KEYWORDS = [
  "cursos online de pastelería",
  "cursos de pastelería online internacionales",
  "aprender pastelería online",
  "cursos de repostería online español",
  "cursos de pastelería Venezuela",
  "talleres de pastelería Venezuela",
  "workshops pastelería Coro Falcón",
  "pastelería profesional online",
  "Ana's Pastry Shop",
  "Anais Flores pastelera",
  "decoración de pasteles online",
  "formación pastelería desde cero",
  "tortas de diseño Coro",
  "mesas dulces Venezuela",
];

export const FAQ_ITEMS = [
  {
    question: "¿Dónde están ubicados los workshops presenciales?",
    answer:
      "Los workshops presenciales se dictan en nuestra sede de Coro, Falcón, Venezuela (Av. Tirso Salavarria, frente al museo de la UNEFM). Recibimos alumnas de todo el país y de la región.",
  },
  {
    question: "¿Los cursos online están disponibles fuera de Venezuela?",
    answer:
      "Sí. Los cursos online de Ana's Pastry Shop están disponibles en todo el mundo: puedes estudiar desde cualquier país con acceso a internet, en español y a tu ritmo.",
  },
  {
    question: "¿Los talleres incluyen insumos?",
    answer:
      "Sí. Los workshops presenciales intensivos de 8 horas incluyen todos los insumos, materiales y práctica guiada por la Chef Anais Flores.",
  },
  {
    question: "¿Hacen tortas y pastelería a pedido?",
    answer:
      "Ofrecemos servicio de pastelería, tortas de diseño y mesas dulces desde Coro, Falcón (Venezuela). Contáctanos por WhatsApp para disponibilidad según la zona.",
  },
] as const;

type BuildPageMetaInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noIndex?: boolean;
};

/** Metadata reutilizable con canonical, Open Graph es_VE y keywords geo. */
export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = SITE_KEYWORDS,
  images,
  noIndex = false,
}: BuildPageMetaInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = path === "/" ? siteUrl : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImages = images ?? [
    {
      url: "/logo-anas-pastry-shop.png",
      width: 1080,
      height: 1080,
      alt: `${SITE_NAME} — Cursos online globales y workshops en Venezuela`,
    },
  ];

  return {
    title:
      path === "/" || title.includes(SITE_NAME)
        ? { absolute: title }
        : title,
    description,
    keywords,
    alternates: {
      canonical: path.startsWith("/") ? path : `/${path}`,
      languages: {
        "es-VE": path.startsWith("/") ? path : `/${path}`,
        es: path.startsWith("/") ? path : `/${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: "es_VE",
      alternateLocale: ["es_ES", "es_MX"],
      url,
      siteName: SITE_NAME,
      title: title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`,
      description,
      images: ogImages.map((i) => i.url),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    other: {
      "geo.region": GEO.regionMeta,
      "geo.placename": GEO.placename,
      "geo.position": `${GEO.latitude};${GEO.longitude}`,
      ICBM: `${GEO.latitude}, ${GEO.longitude}`,
      "content-language": "es-VE",
    },
  };
}

function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: GEO.streetAddress,
    addressLocality: GEO.addressLocality,
    addressRegion: GEO.addressRegion,
    postalCode: GEO.postalCode,
    addressCountry: GEO.addressCountry,
  };
}

function geoCoordinates() {
  return {
    "@type": "GeoCoordinates",
    latitude: GEO.latitude,
    longitude: GEO.longitude,
  };
}

function areaServedPlaces() {
  return [
    {
      "@type": "Place",
      name: "Worldwide",
      sameAs: "https://www.wikidata.org/wiki/Q2",
    },
    {
      "@type": "Country",
      name: "Venezuela",
      sameAs: "https://www.wikidata.org/wiki/Q717",
    },
  ];
}

/** JSON-LD: escuela (online global + presencial VE) y pastelería local. */
export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        legalName: SITE_LEGAL_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo-anas-pastry-shop.png`,
          width: 1080,
          height: 1080,
        },
        image: `${siteUrl}/logo-anas-pastry-shop.png`,
        description: DEFAULT_DESCRIPTION,
        email: SITE_EMAIL,
        telephone: SITE_PHONE_E164,
        foundingDate: "2018",
        address: postalAddress(),
        geo: geoCoordinates(),
        hasMap: `https://www.google.com/maps/search/?api=1&query=${GEO.latitude},${GEO.longitude}`,
        areaServed: areaServedPlaces(),
        sameAs: [SITE_INSTAGRAM],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: SITE_PHONE_E164,
            contactType: "customer service",
            email: SITE_EMAIL,
            availableLanguage: ["Spanish"],
            areaServed: "Worldwide",
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            url: `https://wa.me/${SITE_WHATSAPP}`,
            availableLanguage: ["Spanish"],
            areaServed: "Worldwide",
          },
        ],
        knowsAbout: [
          "Pastelería profesional",
          "Repostería",
          "Panadería",
          "Decoración de pasteles",
          "Cursos online de pastelería",
          "Workshops presenciales",
        ],
      },
      {
        "@type": "Bakery",
        "@id": `${siteUrl}/#bakery`,
        name: SITE_NAME,
        url: `${siteUrl}/pasteleria`,
        image: `${siteUrl}/logo-anas-pastry-shop.png`,
        description:
          "Pastelería artesanal, tortas de diseño y mesas dulces en Coro, Falcón, Venezuela.",
        telephone: SITE_PHONE_E164,
        email: SITE_EMAIL,
        address: postalAddress(),
        geo: geoCoordinates(),
        areaServed: { "@type": "Country", name: "Venezuela" },
        priceRange: "$$",
        servesCuisine: "Pastelería",
        parentOrganization: { "@id": `${siteUrl}/#organization` },
        sameAs: [SITE_INSTAGRAM],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: ["es-VE", "es"],
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#anais-flores`,
        name: "Anais Flores",
        jobTitle: "Chef Pastelera e Instructora",
        worksFor: { "@id": `${siteUrl}/#organization` },
        url: `${siteUrl}/nosotros`,
        sameAs: [SITE_INSTAGRAM],
        knowsAbout: ["Pastelería", "Repostería", "Formación gastronómica"],
        nationality: { "@type": "Country", name: "Venezuela" },
      },
    ],
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? siteUrl : `${siteUrl}${item.path}`,
    })),
  };
}

export function buildCourseJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  price?: number;
  isOnline?: boolean;
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: input.url.startsWith("http") ? input.url : `${siteUrl}${input.url}`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: siteUrl,
      address: postalAddress(),
    },
    ...(input.image
      ? { image: input.image.startsWith("http") ? input.image : `${siteUrl}${input.image}` }
      : {}),
    inLanguage: "es",
    isAccessibleForFree: false,
    ...(input.isOnline
      ? {
          educationalCredentialAwarded: "Certificado de participación",
          courseMode: "online",
          availableLanguage: "es",
          isFamilyFriendly: true,
        }
      : {
          courseMode: "onsite",
          location: {
            "@type": "Place",
            name: SITE_NAME,
            address: postalAddress(),
            geo: geoCoordinates(),
          },
        }),
    ...(typeof input.price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: input.url.startsWith("http") ? input.url : `${siteUrl}${input.url}`,
            areaServed: input.isOnline
              ? { "@type": "Place", name: "Worldwide" }
              : { "@type": "Country", name: "Venezuela" },
          },
        }
      : {}),
  };
}

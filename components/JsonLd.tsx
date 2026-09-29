type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Serializa JSON-LD de forma segura para el DOM (escapa `<`). */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

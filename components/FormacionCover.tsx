"use client";

import { useState } from "react";
import Image from "next/image";
import CourseCoverPlaceholder from "@/components/CourseCoverPlaceholder";
import { resolveCourseCover } from "@/lib/data/onlineCourseCovers";

/** Tamaños pensados para cards 1:1 en grillas 1/2/3 columnas. */
const SIZES = "(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw";

function usableSrc(image?: string | null): string | null {
  const value = (image ?? "").trim();
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

/**
 * Cover for a workshop/course card.
 * - Workshops → placeholder de marca (logo).
 * - Cursos online → portada dedicada si existe, si no `image`.
 */
export default function FormacionCover({
  image,
  title,
  category,
  isWorkshop,
  slug,
}: {
  image?: string | null;
  title: string;
  category?: string;
  isWorkshop: boolean;
  slug?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveCourseCover({
    title,
    slug: slug ?? undefined,
    image,
    isWorkshop,
  });
  const src = usableSrc(resolved);
  const showImage = !isWorkshop && src !== null && !failed;

  return (
    <div className="absolute inset-0">
      {showImage ? (
        <>
          {src.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={title}
              onError={() => setFailed(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105"
            />
          ) : (
            <Image
              src={src}
              alt={title}
              fill
              sizes={SIZES}
              onError={() => setFailed(true)}
              className="object-cover transition-transform duration-500 group-hover/cover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        </>
      ) : (
        <CourseCoverPlaceholder
          title={title}
          category={category}
          isWorkshop={isWorkshop}
        />
      )}
    </div>
  );
}

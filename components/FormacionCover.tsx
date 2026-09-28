"use client";

import { useState } from "react";
import Image from "next/image";
import CourseCoverPlaceholder from "@/components/CourseCoverPlaceholder";

const SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function usableSrc(image?: string | null): string | null {
  const value = (image ?? "").trim();
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

/**
 * Cover for a workshop/course card. Uses the real portada when the record has
 * one and falls back to the branded Ana's Pastry Shop placeholder otherwise, so
 * every card in the app looks identical.
 */
export default function FormacionCover({
  image,
  title,
  category,
  isWorkshop,
}: {
  image?: string | null;
  title: string;
  category?: string;
  isWorkshop: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = usableSrc(image);
  const showImage = src !== null && !failed;

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

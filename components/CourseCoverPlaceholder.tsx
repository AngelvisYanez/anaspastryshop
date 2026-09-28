"use client";

import Image from "next/image";

export default function CourseCoverPlaceholder({
  className = "",
  forceWhite = false,
}: {
  className?: string;
  title?: string;
  category?: string;
  isWorkshop?: boolean;
  /** Fondo oscuro (hero púrpura): siempre logo blanco. */
  forceWhite?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-full bg-card flex items-center justify-center p-6 sm:p-8 select-none border-b border-card-border/50 ${className}`}
    >
      <div className="relative w-[55%] max-w-[11rem] sm:max-w-[12rem] aspect-[3/1] transition-transform duration-500 group-hover/cover:scale-105">
        {forceWhite ? (
          <Image
            src="/logo-anas-pastry-shop-white.png"
            alt="Ana's Pastry Shop"
            fill
            sizes="(max-width: 640px) 55vw, 192px"
            className="object-contain"
          />
        ) : (
          <>
            <Image
              src="/logo-anas-pastry-shop.png"
              alt="Ana's Pastry Shop"
              fill
              sizes="(max-width: 640px) 55vw, 192px"
              className="object-contain dark:hidden"
            />
            <Image
              src="/logo-anas-pastry-shop-white.png"
              alt="Ana's Pastry Shop"
              fill
              sizes="(max-width: 640px) 55vw, 192px"
              className="object-contain hidden dark:block"
            />
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

export default function CourseCoverPlaceholder({
  className = "",
}: {
  className?: string;
  title?: string;
  category?: string;
  isWorkshop?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-full bg-card flex items-center justify-center p-6 select-none border-b border-card-border/50 ${className}`}
    >
      <div className="relative w-40 sm:w-44 h-14 sm:h-16 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo-anas-pastry-shop.png"
          alt="Ana's Pastry Shop"
          fill
          sizes="(max-width: 768px) 160px, 200px"
          className="object-contain dark:hidden"
        />
        <Image
          src="/logo-anas-pastry-shop-white.png"
          alt="Ana's Pastry Shop"
          fill
          sizes="(max-width: 768px) 160px, 200px"
          className="object-contain hidden dark:block"
        />
      </div>
    </div>
  );
}

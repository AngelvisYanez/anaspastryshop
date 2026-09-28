"use client";

export function PaymentQrPreview({
  imageUrl,
  onZoom,
  title,
  hint,
  tone,
}: {
  imageUrl: string;
  onZoom: (url: string) => void;
  title: string;
  hint: string;
  tone: "purple" | "amber";
}) {
  const shell =
    tone === "purple"
      ? "bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800/50"
      : "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/50";
  const titleClass =
    tone === "purple"
      ? "text-purple-700 dark:text-purple-300"
      : "text-amber-700 dark:text-amber-300";

  return (
    <div className={`${shell} border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-6`}>
      <button type="button" onClick={() => onZoom(imageUrl)} className="relative group cursor-pointer">
        <div className="w-36 h-36 bg-white p-2 rounded-xl border border-card-border shadow-sm flex items-center justify-center">
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          Ampliar
        </div>
      </button>
      <div className="text-center sm:text-left space-y-1">
        <p className={`text-xs font-black uppercase tracking-wider ${titleClass}`}>{title}</p>
        <p className="text-xs text-muted max-w-[200px]">{hint}</p>
      </div>
    </div>
  );
}

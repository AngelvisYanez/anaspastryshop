"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CopyMini({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
      title="Copiar"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export function AccountDetailRows({
  rows,
}: {
  rows: { label: string; value?: string | null }[];
}) {
  return (
    <div className="space-y-2.5">
      {rows
        .filter((r) => r.value)
        .map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
                {row.label}
              </p>
              <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
            </div>
            <CopyMini text={row.value!} />
          </div>
        ))}
    </div>
  );
}
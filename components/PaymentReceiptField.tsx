"use client";

import { useRef, useState } from "react";
import { Check, ImageIcon, Loader2, Upload } from "lucide-react";
import { ReceiptPreviewDialog } from "@/components/ReceiptPreviewDialog";

export function PaymentReceiptField({
  caption,
  inputId,
  receiptImage,
  onReceiptChange,
  uploadingReceipt,
  onUpload,
}: {
  caption: string;
  inputId: string;
  receiptImage: string | null;
  onReceiptChange: (url: string | null) => void;
  uploadingReceipt: boolean;
  onUpload: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const resetInput = () => {
    onReceiptChange(null);
    setPreviewOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
        {caption}
      </div>
      {receiptImage ? (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check size={16} />
            <span className="text-sm font-bold">Comprobante adjuntado</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="text-xs text-accent font-bold hover:underline flex items-center gap-1"
            >
              <ImageIcon size={12} /> Ver
            </button>
            <button type="button" onClick={resetInput} className="text-xs text-muted hover:text-red-500 font-bold">
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-card-border rounded-2xl p-6 cursor-pointer hover:border-accent hover:bg-accent-subtle transition"
        >
          {uploadingReceipt ? (
            <Loader2 size={24} className="animate-spin text-accent" />
          ) : (
            <Upload size={24} className="text-muted" />
          )}
          <span className="text-sm font-bold text-foreground">
            {uploadingReceipt ? "Subiendo comprobante..." : "Haz clic para subir tu comprobante"}
          </span>
          <span className="text-[11px] text-muted font-medium">
            Captura de pantalla o recibo (PNG, JPG, WEBP · Máx. 5MB)
          </span>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingReceipt}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      )}

      <ReceiptPreviewDialog
        url={receiptImage}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

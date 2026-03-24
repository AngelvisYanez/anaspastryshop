"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Smartphone,
  Bitcoin,
  Upload,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { createInscription } from "@/lib/actions/inscription";
import { useRouter } from "next/navigation";

export default function CheckoutModal({
  isOpen,
  onClose,
  price,
  title,
  tallerId,
  cursoId,
}: {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  title: string;
  tallerId?: string;
  cursoId?: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"zelle" | "bcv" | "usdt" | null>(null);
  const [copied, setCopied] = useState(false);
  const tasaBCV = 36.5; 
  const montoBS = (price * tasaBCV).toFixed(2);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method) {
      setError("Selecciona un método de pago");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const reference = formData.get("reference")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();

    let dbMethod: "ZELLE" | "PAGO_MOVIL" | "USDT" | "TRANSFERENCIA" = "ZELLE";
    if (method === "bcv") dbMethod = "PAGO_MOVIL";
    if (method === "usdt") dbMethod = "USDT";

    const result = await createInscription({
      method: dbMethod,
      amountPaid: price,
      reference,
      phoneNumber,
      tallerId,
      cursoId,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 3000);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-gray-400 hover:text-black"
            >
              <X />
            </button>

            {success ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h2 className="text-3xl font-black text-[#1A1A2E] mb-4">¡Inscripción en Revisión!</h2>
                <p className="text-gray-500 font-medium text-lg">
                  Hemos recibido tu reporte de pago exitosamente para <span className="text-[#5A4FCF]">{title}</span>. Te daremos acceso pronto.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black mb-1 text-[#1A1A2E]">
                  Inscribirme en <span className="text-[#5A4FCF]">{title}</span>
                </h2>
                <p className="text-gray-400 mb-8 font-medium">
                  Selecciona tu método de pago preferido para finalizar
                </p>

                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-10">
                  <button
                    onClick={() => setMethod("zelle")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "zelle" ? "border-[#5A4FCF] bg-indigo-50" : "border-gray-100"}`}
                  >
                    <CreditCard
                      size={20}
                      className={method === "zelle" ? "text-[#5A4FCF]" : "text-gray-400"}
                    />
                    <span className="text-[10px] font-black uppercase">Zelle</span>
                  </button>
                  <button
                    onClick={() => setMethod("bcv")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "bcv" ? "border-[#5A4FCF] bg-indigo-50" : "border-gray-100"}`}
                  >
                    <Smartphone
                      size={20}
                      className={method === "bcv" ? "text-[#5A4FCF]" : "text-gray-400"}
                    />
                    <span className="text-[10px] font-black uppercase">Pago Móvil</span>
                  </button>
                  <button
                    onClick={() => setMethod("usdt")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "usdt" ? "border-[#5A4FCF] bg-indigo-50" : "border-gray-100"}`}
                  >
                    <Bitcoin
                      size={20}
                      className={method === "usdt" ? "text-[#5A4FCF]" : "text-gray-400"}
                    />
                    <span className="text-[10px] font-black uppercase">Binance</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {method === "zelle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-6 rounded-[2rem] mb-8"
                    >
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Enviar a:</p>
                      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 mb-6">
                        <span className="font-bold text-[#1A1A2E]">pagos@artica.group</span>
                        <button type="button" onClick={() => copyToClipboard("pagos@artica.group")}>
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Referencia / Titular</label>
                        <input name="reference" required type="text" placeholder="Ej. Newman Acosta" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#5A4FCF] text-sm" />
                      </div>
                    </motion.div>
                  )}

                  {method === "bcv" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-6 rounded-[2rem] mb-8 space-y-4"
                    >
                      <div className="flex justify-between items-end mb-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Monto a pagar (BCV):</p>
                        <span className="text-2xl font-black text-[#1A1A2E]">Bs. {montoBS}</span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1 bg-white p-4 rounded-xl border border-gray-100">
                        <p><b>Banco:</b> Banesco (0134)</p>
                        <p><b>Teléfono:</b> 0412-1234567</p>
                        <p><b>RIF:</b> J-123456789</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Referencia</label>
                          <input name="reference" required type="text" placeholder="Ej. 123456" className="w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#5A4FCF] text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Teléfono emisor</label>
                          <input name="phoneNumber" required type="text" placeholder="Ej. 0412..." className="w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#5A4FCF] text-sm" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {method === "usdt" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-6 rounded-[2rem] mb-8"
                    >
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Binance Pay ID:</p>
                      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 mb-6">
                        <span className="font-bold text-[#1A1A2E]">123456789 (Artica Group)</span>
                        <button type="button" onClick={() => copyToClipboard("123456789")}>
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">ID de Transacción / Usuario</label>
                        <input name="reference" required type="text" placeholder="Ej. newman_acosta" className="w-full p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#5A4FCF] text-sm" />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-2">Sube tu comprobante (Opcional)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center hover:border-[#5A4FCF] transition-colors cursor-pointer group">
                      <Upload className="mx-auto mb-2 text-gray-300 group-hover:text-[#5A4FCF] transition-colors" />
                      <span className="text-xs font-bold text-gray-400">JPG, PNG o PDF</span>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading || !method}
                      className="w-full bg-[#1A1A2E] text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Confirmar Pago"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

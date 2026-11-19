"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Clipboard, ReceiptText, Search } from "lucide-react";
import { ReceiptPreviewDialog } from "@/components/ReceiptPreviewDialog";
import { findGuidedSaleStudent, registerGuidedSale } from "@/lib/actions/guided-sale";
import { guidedAmount, guidedPaymentMethods, guidedReceiptError, guidedReceiptTypes } from "@/lib/guided-sale";

type Course = { id: string; title: string; price: number; isWorkshop: boolean };
type Student = { id: string; name: string | null; whatsappNumber: string | null };
type CompletedSale = { id: string; email: string; student: string | null; course: string };
type Method = keyof typeof guidedPaymentMethods;

const steps = ["Alumno", "Formación y pago", "Autorizar"];
const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", currencyDisplay: "code" });
const field = "min-h-11 w-full min-w-0 rounded-xl border border-card-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const label = "grid min-w-0 gap-1.5 text-sm font-semibold text-foreground";
const secondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-4 text-sm font-bold text-foreground hover:bg-section-alt disabled:opacity-50";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent-solid px-4 text-sm font-bold text-white hover:bg-accent-solid-hover disabled:opacity-50";

export default function GuidedSaleForm({ courses }: { courses: Course[] }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [lookup, setLookup] = useState<{ email: string; student: Student | null } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [method, setMethod] = useState<Method | "">("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<{ file: File; preview: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState<{ sale: CompletedSale; setupUrl: string | null } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const preview = receipt?.preview;
  const course = courses.find(({ id }) => id === courseId);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function goTo(next: number) {
    setStep(next);
    setError("");
    setVerified(false);
    heading.current?.focus();
  }

  async function checkStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lookup) {
      if (!lookup.student && !/^\+[1-9]\d{7,14}$/.test(phone.replace(/[\s()-]/g, ""))) {
        setError("Escribe el WhatsApp con código de país. Ejemplo +58 412 123 4567.");
        return;
      }
      goTo(1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await findGuidedSaleStudent(email);
      if (result.error) setError(result.error);
      else if (result.email && result.student !== undefined) {
        setEmail(result.email);
        setLookup({ email: result.email, student: result.student });
      }
    } catch {
      setError("No se pudo consultar el correo.");
    } finally {
      setBusy(false);
    }
  }

  function checkPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course || !method || guidedAmount(amount) === null || !reference.trim() || !receipt) {
      setError("Completa la formación, el método, el monto en USD, la referencia y el comprobante.");
      return;
    }
    goTo(2);
  }

  async function authorize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lookup || !receipt || !verified || busy) return;
    setBusy(true);
    setError("");
    const data = new FormData();
    Object.entries({
      email: lookup.email, studentId: lookup.student?.id ?? "", name, whatsapp: phone, courseId,
      method, amount, reference, verified: "true",
    }).forEach(([key, value]) => data.set(key, value));
    data.set("receipt", receipt.file);
    try {
      const result = await registerGuidedSale(data);
      if (!result.sale) setError(result.error ?? "No se pudo registrar la venta.");
      else {
        setComplete({ sale: result.sale, setupUrl: result.setupPath ? new URL(result.setupPath, window.location.origin).href : null });
        setReceipt(null);
      }
    } catch {
      setError("No se pudo registrar la venta. Verifica el historial antes de reintentar.");
    } finally {
      setBusy(false);
    }
  }

  if (complete) {
    return <section className="space-y-4 rounded-2xl border border-card-border bg-card p-4 sm:p-6" aria-labelledby="guided-sale-complete">
      <CircleCheck className="text-emerald-600 dark:text-emerald-400" size={26} aria-hidden="true" />
      <div>
        <h2 id="guided-sale-complete" className="text-lg font-black text-foreground">Venta registrada</h2>
        <p className="mt-1 text-sm text-muted"><strong>{complete.sale.student || complete.sale.email}</strong> ya tiene acceso a <strong>{complete.sale.course}</strong>.</p>
      </div>
      {complete.setupUrl ? <div className="space-y-2 rounded-xl bg-section-alt p-3">
        <label className={label}>Enlace privado para crear la contraseña
          <input value={complete.setupUrl} readOnly className={field} onFocus={(event) => event.currentTarget.select()} />
        </label>
        <p className="text-xs text-muted">Compártelo solo con el alumno. El enlace seguirá activo hasta que establezca su contraseña.</p>
        <button type="button" className={secondary} onClick={async () => {
          try { await navigator.clipboard.writeText(complete.setupUrl!); setCopyStatus("Enlace copiado."); }
          catch { setCopyStatus("Selecciona el enlace para copiarlo."); }
        }}><Clipboard size={16} /> Copiar enlace</button>
        {copyStatus && <p role="status" className="text-sm text-muted">{copyStatus}</p>}
      </div> : <p className="text-sm text-muted">El alumno puede entrar con su correo y su contraseña habitual.</p>}
      <p className="break-all text-xs text-muted">Registro de pago · {complete.sale.id}</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/pagos?page=1" className={primary}>Ver historial de pagos</Link>
        <button type="button" className={secondary} onClick={() => {
          setComplete(null); setCopyStatus(""); setLookup(null); setEmail(""); setName(""); setPhone("");
          setCourseId(""); setAmount(""); setMethod(""); setReference(""); goTo(0);
        }}>Registrar otra venta</button>
      </div>
    </section>;
  }

  return (
    <div className="space-y-4">
      <ol aria-label="Pasos de la venta" className="grid grid-cols-3 gap-1 rounded-2xl border border-card-border bg-section-alt p-1.5 sm:gap-2">
        {steps.map((title, index) => <li key={title} aria-current={step === index ? "step" : undefined}
          className={`flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl px-1.5 py-2 text-[11px] font-bold sm:px-3 sm:text-sm ${step === index ? "bg-accent-solid text-white" : "text-muted"}`}>
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-current/10">{step > index ? <Check size={14} /> : index + 1}</span>{title}
        </li>)}
      </ol>

      <section aria-labelledby="guided-step-heading" className="rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:p-6">
        <h2 id="guided-step-heading" ref={heading} tabIndex={-1} className="mb-4 text-lg font-black text-foreground outline-none">{steps[step]}</h2>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

        {step === 0 && <form onSubmit={checkStudent} className="space-y-4">
          <label className={label}>Correo del alumno
            <input type="email" autoComplete="off" value={email} required maxLength={254} className={field} disabled={busy}
              onChange={(event) => {
                setEmail(event.target.value); setLookup(null); setName(""); setPhone(""); setError("");
                setMethod(""); setReference(""); setReceipt(null);
              }} />
          </label>
          {lookup && (lookup.student ? <div className="rounded-xl border border-card-border bg-section-alt p-3 text-sm">
            <p className="font-bold text-foreground">Cuenta encontrada · {lookup.student.name || lookup.email}</p>
            {lookup.student.whatsappNumber && <p className="mt-0.5 text-muted">WhatsApp {lookup.student.whatsappNumber}</p>}
          </div> : <div className="space-y-3">
            <p className="text-sm text-muted">Se creará una cuenta para este correo al autorizar la venta.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>Nombre completo<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required className={field} /></label>
              <label className={label}>WhatsApp con código de país<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={30} required placeholder="+58 412 123 4567" className={field} /></label>
            </div>
          </div>)}
          <button className={primary} disabled={busy}>{lookup ? <ArrowRight size={16} /> : <Search size={16} />}{busy ? "Buscando…" : lookup ? "Continuar" : "Buscar cuenta"}</button>
        </form>}

        {step === 1 && <form onSubmit={checkPayment} className="space-y-4">
          <label className={label}>Formación
            <select value={courseId} required className={field} onChange={(event) => {
              const selected = courses.find(({ id }) => id === event.target.value);
              setCourseId(event.target.value);
              setAmount(selected && selected.price > 0 ? selected.price.toFixed(2) : "");
            }}>
              <option value="">Selecciona un curso o workshop</option>
              {courses.map((entry) => <option key={entry.id} value={entry.id}>{entry.title} · {entry.isWorkshop ? "Workshop" : "Curso online"} · {money.format(entry.price)}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={label}>Método de pago
              <select value={method} onChange={(event) => setMethod(event.target.value as Method | "")} required className={field}>
                <option value="">Selecciona</option>
                {Object.entries(guidedPaymentMethods).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
            </label>
            <label className={label}>Monto pagado en USD
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} maxLength={10} required className={field} />
            </label>
            <label className={label}>Referencia de pago
              <input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} required className={field} />
            </label>
          </div>
          <div className="space-y-2 rounded-xl border border-dashed border-card-border bg-section-alt p-3">
            <label className={label}>Comprobante
              <input type="file" accept={guidedReceiptTypes.join(",")} className="block w-full min-w-0 text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-card file:px-3 file:py-2 file:font-bold file:text-foreground"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  event.target.value = "";
                  const issue = guidedReceiptError(file);
                  setError(issue ?? "");
                  setReceipt(issue ? null : { file, preview: URL.createObjectURL(file) });
                }} />
            </label>
            <p className="text-xs text-muted">JPG, PNG o WebP de hasta 5 MB.</p>
            {receipt && <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-0 break-all text-muted">{receipt.file.name}</span>
              <button type="button" className={secondary} onClick={() => setPreviewOpen(true)}><ReceiptText size={16} /> Ver comprobante</button>
              <button type="button" className={secondary} onClick={() => setReceipt(null)}>Quitar</button>
            </div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondary} onClick={() => goTo(0)}><ArrowLeft size={16} /> Atrás</button>
            <button className={primary}>Revisar venta <ArrowRight size={16} /></button>
          </div>
        </form>}

        {step === 2 && <form onSubmit={authorize} className="space-y-4">
          <dl className="grid gap-3 rounded-xl bg-section-alt p-3 text-sm sm:grid-cols-2">
            <div className="min-w-0"><dt className="text-xs text-muted">Alumno</dt><dd className="break-words font-bold">{lookup?.student?.name || name || email}</dd><dd className="break-all text-muted">{email}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted">Formación</dt><dd className="break-words font-bold">{course?.title}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted">Pago</dt><dd className="font-bold">{money.format(guidedAmount(amount) ?? 0)} · {method && guidedPaymentMethods[method]}</dd><dd className="break-all text-muted">{reference}</dd></div>
            <div className="min-w-0"><dt className="text-xs text-muted">Comprobante</dt><dd><button type="button" onClick={() => setPreviewOpen(true)} className="break-all text-left font-bold text-accent underline">{receipt?.file.name}</button></dd></div>
          </dl>
          <label className="flex items-start gap-2 text-sm font-semibold text-foreground">
            <input type="checkbox" required checked={verified} disabled={busy} onChange={(event) => setVerified(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-accent-solid" />
            Verifiqué el pago y autorizo el acceso a esta formación.
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondary} disabled={busy} onClick={() => goTo(1)}><ArrowLeft size={16} /> Atrás</button>
            <button className={primary} disabled={busy || !verified}><Check size={16} /> {busy ? "Registrando…" : "Autorizar y registrar"}</button>
          </div>
        </form>}
      </section>
      <ReceiptPreviewDialog url={preview ?? null} open={previewOpen && Boolean(preview)} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Power,
  BookOpen,
} from "lucide-react";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  type CouponApplyMode,
  type CouponRecord,
} from "@/lib/actions/coupons";

type FormationOption = {
  id: string;
  title: string;
  slug: string | null;
  price: number;
  category: string;
  isLive: boolean;
};

type FormState = {
  code: string;
  description: string;
  discountPercent: number;
  minItems: number;
  applyMode: CouponApplyMode;
  cursoIds: string[];
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  discountPercent: 10,
  minItems: 1,
  applyMode: "ANY",
  cursoIds: [],
  isActive: true,
};

const inputClass =
  "w-full bg-card border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium";
const labelClass =
  "text-[11px] font-black uppercase tracking-widest text-muted mb-1.5 block";

export default function CouponManager({
  initialCoupons,
  formations,
}: {
  initialCoupons: CouponRecord[];
  formations: FormationOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CouponRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const titleById = useMemo(
    () => Object.fromEntries(formations.map((f) => [f.id, f.title])),
    [formations]
  );

  const onlineFormations = formations.filter((f) => !f.isLive);
  const workshopFormations = formations.filter((f) => f.isLive);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setCreating(true);
  }

  function openEdit(coupon: CouponRecord) {
    setCreating(false);
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountPercent: coupon.discountPercent,
      minItems: coupon.minItems,
      applyMode: coupon.applyMode === "ALL" ? "ALL" : "ANY",
      cursoIds: [...coupon.cursoIds],
      isActive: coupon.isActive,
    });
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function toggleCurso(id: string) {
    setForm((f) => ({
      ...f,
      cursoIds: f.cursoIds.includes(id)
        ? f.cursoIds.filter((x) => x !== id)
        : [...f.cursoIds, id],
    }));
  }

  function selectOnlineBundle() {
    setForm((f) => ({
      ...f,
      applyMode: "ALL",
      minItems: Math.max(2, onlineFormations.length),
      cursoIds: onlineFormations.map((c) => c.id),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        code: form.code,
        description: form.description,
        discountPercent: form.discountPercent,
        minItems: form.minItems,
        applyMode: form.applyMode,
        cursoIds: form.cursoIds,
        isActive: form.isActive,
      };
      const result = editing
        ? await updateCoupon(editing.id, payload)
        : await createCoupon(payload);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      closeForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCoupon(id);
      setDeleteId(null);
      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleCouponActive(id, isActive);
      router.refresh();
    });
  }

  const showForm = creating || !!editing;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Tag size={22} className="text-accent" />
            Cupones
          </h2>
          <p className="text-muted text-sm font-medium mt-1">
            Configura el descuento, cuántos ítems aplican y a qué formaciones (individuales o en conjunto).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-accent-solid text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition shadow-md"
        >
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      <div className="space-y-3">
        {initialCoupons.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-10 text-center">
            <p className="text-foreground font-bold">Sin cupones aún</p>
            <p className="text-muted text-sm mt-1">Crea el primero para empezar a ofrecer descuentos.</p>
          </div>
        ) : (
          initialCoupons.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-card-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-foreground tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-xs font-black bg-accent-subtle text-accent px-2 py-0.5 rounded-md">
                    -{c.discountPercent}%
                  </span>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      c.isActive
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600"
                        : "bg-section-alt text-muted"
                    }`}
                  >
                    {c.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {c.description && (
                  <p className="text-sm text-muted font-medium">{c.description}</p>
                )}
                <p className="text-xs text-muted">
                  Mín. <strong className="text-foreground">{c.minItems}</strong> ítem
                  {c.minItems === 1 ? "" : "s"} · Modo{" "}
                  <strong className="text-foreground">
                    {c.applyMode === "ALL" ? "Conjunto (todas)" : "Cualquiera"}
                  </strong>
                  {" · "}
                  {c.cursoIds.length === 0
                    ? "Todas las formaciones"
                    : c.cursoIds
                        .map((id) => titleById[id] || id.slice(0, 8))
                        .join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  title={c.isActive ? "Desactivar" : "Activar"}
                  disabled={isPending}
                  onClick={() => handleToggle(c.id, !c.isActive)}
                  className="p-2.5 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-card-hover transition"
                >
                  <Power size={16} />
                </button>
                <button
                  type="button"
                  title="Editar"
                  onClick={() => openEdit(c)}
                  className="p-2.5 rounded-xl border border-card-border text-muted hover:text-accent hover:bg-card-hover transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  title="Eliminar"
                  onClick={() => setDeleteId(c.id)}
                  className="p-2.5 rounded-xl border border-card-border text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-form-title"
            className="bg-card rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-card-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-card-border sticky top-0 bg-card z-10">
              <h2 id="coupon-form-title" className="text-lg font-black text-foreground">
                {editing ? "Editar cupón" : "Nuevo cupón"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 hover:bg-card-hover rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <p className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 rounded-xl">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coupon-code" className={labelClass}>
                    Código
                  </label>
                  <input
                    id="coupon-code"
                    required
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="TODOSLOSCURSOS"
                    className={`${inputClass} font-mono tracking-wider`}
                  />
                </div>
                <div>
                  <label htmlFor="coupon-percent" className={labelClass}>
                    Descuento (%)
                  </label>
                  <input
                    id="coupon-percent"
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountPercent: Number(e.target.value) || 0,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="coupon-desc" className={labelClass}>
                  Descripción
                </label>
                <input
                  id="coupon-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Visible al aplicar el cupón"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coupon-min" className={labelClass}>
                    Ítems mínimos
                  </label>
                  <input
                    id="coupon-min"
                    type="number"
                    min={1}
                    required
                    value={form.minItems}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minItems: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className={inputClass}
                  />
                  <p className="text-[11px] text-muted mt-1.5">
                    Cantidad de formaciones que debe llevar el cliente.
                  </p>
                </div>
                <div>
                  <span className={labelClass}>Modo de aplicación</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, applyMode: "ANY" }))}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                        form.applyMode === "ANY"
                          ? "bg-accent-solid text-white border-accent-solid"
                          : "border-card-border text-muted hover:bg-card-hover"
                      }`}
                    >
                      Cualquiera
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, applyMode: "ALL" }))}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition ${
                        form.applyMode === "ALL"
                          ? "bg-accent-solid text-white border-accent-solid"
                          : "border-card-border text-muted hover:bg-card-hover"
                      }`}
                    >
                      En conjunto
                    </button>
                  </div>
                  <p className="text-[11px] text-muted mt-1.5">
                    {form.applyMode === "ALL"
                      ? "Debe incluir todas las formaciones marcadas."
                      : "Basta con cumplir el mínimo entre las marcadas."}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={labelClass + " !mb-0"}>Formaciones aplicables</span>
                  {onlineFormations.length > 0 && (
                    <button
                      type="button"
                      onClick={selectOnlineBundle}
                      className="text-[11px] font-bold text-accent hover:underline"
                    >
                      Paquete cursos online
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted mb-3">
                  Sin selección = aplica a cualquier formación (respetando ítems mínimos).
                </p>

                {onlineFormations.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2 flex items-center gap-1">
                      <BookOpen size={12} /> Cursos online
                    </p>
                    <div className="space-y-2">
                      {onlineFormations.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:bg-card-hover cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={form.cursoIds.includes(f.id)}
                            onChange={() => toggleCurso(f.id)}
                            className="rounded border-card-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">
                            {f.title}
                          </span>
                          <span className="text-xs text-muted font-bold">${f.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {workshopFormations.length > 0 && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2">
                      Workshops
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {workshopFormations.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:bg-card-hover cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={form.cursoIds.includes(f.id)}
                            onChange={() => toggleCurso(f.id)}
                            className="rounded border-card-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm font-medium text-foreground flex-1">
                            {f.title}
                          </span>
                          <span className="text-xs text-muted font-bold">${f.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-card-border text-accent focus:ring-accent"
                />
                <span className="text-sm font-bold text-foreground">Cupón activo</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border border-card-border text-sm font-bold text-muted hover:bg-card-hover transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-accent-solid text-white text-sm font-bold hover:bg-accent-solid-hover transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {editing ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-card rounded-2xl w-full max-w-sm p-6 border border-card-border shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-foreground">¿Eliminar cupón?</h3>
            <p className="text-sm text-muted">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-card-border text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

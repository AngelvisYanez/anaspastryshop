"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart, type CartItem } from "./CartContext";

export default function AddToBagButton({
  item,
  compact = false,
  variant = "outline",
}: {
  item: CartItem;
  compact?: boolean;
  variant?: "outline" | "solid";
}) {
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (isInCart(item.id)) return;
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const alreadyInBag = isInCart(item.id);

  const base = compact
    ? "px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
    : "w-full px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md";

  const styles = alreadyInBag
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
    : added
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
    : variant === "solid"
    ? "bg-accent hover:bg-accent-hover text-white shadow-pink-600/20"
    : "bg-card border border-card-border text-foreground hover:border-accent/50 hover:text-accent";

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={alreadyInBag}
      className={`${base} ${styles} ${alreadyInBag ? "" : "hover:shadow-pink-600/30"}`}
    >
      {alreadyInBag || added ? (
        <>
          <Check size={compact ? 13 : 15} />
          {alreadyInBag ? "En la Bolsa" : "¡Agregado!"}
        </>
      ) : (
        <>
          <ShoppingBag size={compact ? 13 : 15} />
          Añadir a la Bolsa
        </>
      )}
    </button>
  );
}
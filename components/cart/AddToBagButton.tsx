"use client";

import { useState } from "react";
import { ShoppingBag, Check, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "./CartContext";

function buttonStyles({
  alreadyInBag,
  justAdded,
  variant,
}: {
  alreadyInBag: boolean;
  justAdded: boolean;
  variant: "outline" | "solid";
}) {
  if (alreadyInBag) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm";
  }
  if (justAdded) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
  }
  if (variant === "solid") {
    return "bg-accent-solid hover:bg-accent-solid-hover text-white shadow-accent-solid/20";
  }
  return "bg-card border border-card-border text-foreground hover:border-accent hover:text-accent shadow-sm";
}

export default function AddToBagButton({
  item,
  compact = false,
  variant = "outline",
  openDrawerOnAdd = false,
  labelAdd,
  labelRemove,
  className = "",
}: {
  item: CartItem;
  compact?: boolean;
  variant?: "outline" | "solid";
  openDrawerOnAdd?: boolean;
  labelAdd?: string;
  labelRemove?: string;
  className?: string;
}) {
  const { addItem, removeItem, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const alreadyInBag = isInCart(item.id);
  const iconSize = compact ? 13 : 15;
  const textAdd = labelAdd ?? (compact ? "Añadir" : "Añadir a la Bolsa");
  const textRemove = labelRemove ?? (compact ? "Quitar" : "Quitar de la Bolsa");

  const base = compact
    ? "w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer select-none"
    : "w-full px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer select-none";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (alreadyInBag) {
      removeItem(item.id);
      setJustAdded(false);
      return;
    }

    addItem(item, openDrawerOnAdd);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  let icon = <ShoppingBag size={iconSize} className="shrink-0" />;
  let label = textAdd;
  if (alreadyInBag) {
    icon = <Trash2 size={iconSize} className="shrink-0" />;
    label = textRemove;
  } else if (justAdded) {
    icon = <Check size={iconSize} className="shrink-0 text-emerald-500" />;
    label = "¡Añadido!";
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={alreadyInBag ? `Quitar ${item.title} de la bolsa` : `Añadir ${item.title} a la bolsa`}
      className={`${base} ${buttonStyles({ alreadyInBag, justAdded, variant })} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

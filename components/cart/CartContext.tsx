"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string | null;
  isWorkshop: boolean;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  isInCart: (id: string) => boolean;
  addItem: (item: CartItem, openDrawer?: boolean) => void;
  removeItem: (id: string) => void;
  clearBag: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const STORAGE_KEY = "anas-pastry-bag";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage failures
    }
  }, [items, hydrated]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.price, 0),
    [items]
  );

  const isInCart = (id: string) => items.some((item) => item.id === id);

  const addItem = (item: CartItem, openDrawer = true) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearBag = () => setItems([]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      total,
      isInCart,
      addItem,
      removeItem,
      clearBag,
      openCart,
      closeCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers are stable for the lifetime of the provider
    [items, isOpen, total],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
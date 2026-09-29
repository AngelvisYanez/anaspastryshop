"use client";

import { createContext, useContext, useLayoutEffect, useMemo } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

/** Dark mode deshabilitado: siempre light. setTheme queda como no-op. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    try {
      window.localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      // storage unavailable (private mode)
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: "light", setTheme: () => {} }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

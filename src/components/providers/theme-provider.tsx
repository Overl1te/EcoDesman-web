"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "eco-desman-web-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [usesSystemPreference, setUsesSystemPreference] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== "light" && stored !== "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (usesSystemPreference) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, usesSystemPreference]);

  useEffect(() => {
    if (typeof window === "undefined" || !usesSystemPreference) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncWithSystem = (event?: MediaQueryListEvent) => {
      setMode(event?.matches ?? media.matches ? "dark" : "light");
    };

    syncWithSystem();
    media.addEventListener("change", syncWithSystem);
    return () => media.removeEventListener("change", syncWithSystem);
  }, [usesSystemPreference]);

  const toggleMode = () => {
    setUsesSystemPreference(false);
    setMode((current) => (current === "dark" ? "light" : "dark"));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggleMode,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }
  return context;
}

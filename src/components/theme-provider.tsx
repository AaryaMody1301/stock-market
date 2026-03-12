"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function parseTheme(value: string | null): Theme {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return parseTheme(localStorage.getItem("theme"));
  });
  const [resolvedTheme, setResolved] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    return theme === "system" ? (mq.matches ? "dark" : "light") : theme;
  });
  const themeRef = useRef<Theme>(theme);

  const applyThemeClass = useCallback((resolved: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = (t: Theme) => (t === "system" ? (mq.matches ? "dark" : "light") : t);
    themeRef.current = theme;
    applyThemeClass(resolve(theme));

    const handler = () => {
      if (themeRef.current === "system") {
        const next = mq.matches ? "dark" : "light";
        setResolved(next);
        applyThemeClass(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyThemeClass, theme]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      themeRef.current = t;
      localStorage.setItem("theme", t);
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const resolved = t === "system" ? (mq.matches ? "dark" : "light") : t;
      setResolved(resolved);
      applyThemeClass(resolved);
    },
    [applyThemeClass],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

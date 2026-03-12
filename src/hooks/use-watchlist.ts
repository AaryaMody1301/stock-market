"use client";

import { useState, useEffect, useCallback } from "react";

const WATCHLIST_KEY = "investsmart-watchlist";

function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWatchlist(symbols: string[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
  window.dispatchEvent(new CustomEvent("watchlist-change"));
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(readWatchlist);

  useEffect(() => {
    const handler = () => setSymbols(readWatchlist());
    window.addEventListener("watchlist-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("watchlist-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((symbol: string) => {
    const current = readWatchlist();
    const upper = symbol.toUpperCase();
    if (!current.includes(upper)) {
      writeWatchlist([...current, upper]);
    }
  }, []);

  const remove = useCallback((symbol: string) => {
    const current = readWatchlist();
    writeWatchlist(current.filter((s) => s !== symbol.toUpperCase()));
  }, []);

  const has = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols],
  );

  const toggle = useCallback(
    (symbol: string) => {
      if (has(symbol)) {
        remove(symbol);
      } else {
        add(symbol);
      }
    },
    [has, add, remove],
  );

  return { symbols, add, remove, has, toggle };
}

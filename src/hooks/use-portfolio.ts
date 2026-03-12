"use client";

import { useState, useEffect, useCallback } from "react";

const PORTFOLIO_KEY = "investsmart-portfolio";

export interface Holding {
  id: string;
  symbol: string;
  shares: number;
  avgCost: number;
  addedAt: string; // ISO date
}

function readPortfolio(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePortfolio(holdings: Holding[]) {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(holdings));
  window.dispatchEvent(new CustomEvent("portfolio-change"));
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(readPortfolio);

  useEffect(() => {
    const handler = () => setHoldings(readPortfolio());
    window.addEventListener("portfolio-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("portfolio-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const addHolding = useCallback(
    (symbol: string, shares: number, avgCost: number) => {
      const current = readPortfolio();
      const upper = symbol.toUpperCase();
      // Merge if same symbol exists
      const existing = current.find((h) => h.symbol === upper);
      if (existing) {
        const totalShares = existing.shares + shares;
        const totalCost =
          existing.shares * existing.avgCost + shares * avgCost;
        existing.shares = totalShares;
        existing.avgCost = totalCost / totalShares;
        writePortfolio([...current]);
      } else {
        const holding: Holding = {
          id: crypto.randomUUID(),
          symbol: upper,
          shares,
          avgCost,
          addedAt: new Date().toISOString(),
        };
        writePortfolio([...current, holding]);
      }
    },
    [],
  );

  const removeHolding = useCallback((id: string) => {
    const current = readPortfolio();
    writePortfolio(current.filter((h) => h.id !== id));
  }, []);

  const updateHolding = useCallback(
    (id: string, shares: number, avgCost: number) => {
      const current = readPortfolio();
      const holding = current.find((h) => h.id === id);
      if (holding) {
        holding.shares = shares;
        holding.avgCost = avgCost;
        writePortfolio([...current]);
      }
    },
    [],
  );

  return { holdings, addHolding, removeHolding, updateHolding };
}

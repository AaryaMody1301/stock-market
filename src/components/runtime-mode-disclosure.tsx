"use client";

import { createContext, useContext, useEffect, useState } from "react";

type RuntimeMode = "unknown" | "demo" | "live";

const RuntimeModeContext = createContext<RuntimeMode>("unknown");

interface ReadyPayload {
  mode?: unknown;
}

export function RuntimeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<RuntimeMode>("unknown");

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/ready", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as ReadyPayload;
        if (payload.mode === "demo" || payload.mode === "live") {
          setMode(payload.mode);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMode("unknown");
      });

    return () => controller.abort();
  }, []);

  return <RuntimeModeContext.Provider value={mode}>{children}</RuntimeModeContext.Provider>;
}

export function RuntimeModeBanner() {
  const mode = useContext(RuntimeModeContext);
  if (mode !== "demo") return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:text-amber-200"
    >
      Demo mode: prices, charts, search results, profiles, and news are deterministic synthetic fixtures. No Finnhub or Twelve Data requests are made.
    </div>
  );
}

export function RuntimeDataNotice() {
  const mode = useContext(RuntimeModeContext);
  const year = new Date().getFullYear();

  if (mode === "demo") {
    return (
      <>
        © {year} StockPulse. Demo market data is synthetic and deterministic; seeded evidence is clearly marked as fixture data. Research tool, not investment advice.
      </>
    );
  }

  if (mode === "live") {
    return (
      <>
        © {year} StockPulse. Market data may come from Finnhub and Twelve Data; filing evidence comes from SEC EDGAR. Research tool, not investment advice.
      </>
    );
  }

  return (
    <>
      © {year} StockPulse. Data mode and source readiness are reported in-app. Research tool, not investment advice.
    </>
  );
}

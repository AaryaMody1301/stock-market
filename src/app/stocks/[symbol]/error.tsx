"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function StockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive/60 mb-4" />
      <h2 className="text-2xl font-bold">Failed to load stock data</h2>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t fetch data for this stock. The market data provider may
        be temporarily unavailable.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <Button className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}

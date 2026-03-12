"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-6 h-16 w-16 text-destructive/60" />
      <h2 className="text-2xl font-bold tracking-tight">
        Something went wrong
      </h2>
      <p className="mt-2 text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}

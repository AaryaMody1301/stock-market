"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NewsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive/60 mb-4" />
      <h2 className="text-2xl font-bold">Failed to load news</h2>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t fetch the latest market news right now.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}

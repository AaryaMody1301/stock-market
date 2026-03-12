import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StockNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <SearchX className="h-20 w-20 text-muted-foreground/40 mb-6" />
      <h1 className="text-3xl font-bold tracking-tight">Stock Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find data for this symbol. It may be delisted or
        incorrectly typed.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button>Browse Markets</Button>
        </Link>
      </div>
    </div>
  );
}

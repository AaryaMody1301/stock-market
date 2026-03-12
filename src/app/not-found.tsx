import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="h-20 w-20 text-muted-foreground/40 mb-6" />
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Page not found
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button>Go to Dashboard</Button>
        </Link>
        <Link href="/news">
          <Button variant="outline">Market News</Button>
        </Link>
      </div>
    </div>
  );
}

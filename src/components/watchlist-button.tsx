"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WatchlistButtonProps {
  symbol: string;
  className?: string;
}

export function WatchlistButton({ symbol, className }: WatchlistButtonProps) {
  const { has, toggle } = useWatchlist();
  const isWatched = has(symbol);

  const handleToggle = () => {
    toggle(symbol);
    if (isWatched) {
      toast.info(`${symbol} removed from watchlist`);
    } else {
      toast.success(`${symbol} added to watchlist`);
    }
  };

  return (
    <Button
      variant={isWatched ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={cn("gap-1.5", className)}
    >
      <Star
        className={cn(
          "h-4 w-4",
          isWatched && "fill-current",
        )}
      />
      {isWatched ? "Watching" : "Watch"}
    </Button>
  );
}

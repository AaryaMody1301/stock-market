import { TickerTape } from "@/components/ui/ticker-tape";
import type { Quote } from "@/lib/providers/types";

export function TickerTapeServer({ quotes }: { quotes: Quote[] }) {
  return <TickerTape quotes={quotes} />;
}

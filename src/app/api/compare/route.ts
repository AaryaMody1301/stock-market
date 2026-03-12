import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/providers";
import { z } from "zod/v4";

const schema = z.object({
  symbols: z
    .string()
    .transform((s) => s.split(",").map((t) => t.trim().toUpperCase()))
    .pipe(z.array(z.string().min(1).max(10)).min(1).max(4)),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = schema.safeParse({ symbols: searchParams.get("symbols") || "" });

  if (!parsed.success) {
    return NextResponse.json({ error: "Provide 1-4 symbols" }, { status: 400 });
  }

  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  try {
    const results = await Promise.allSettled(
      parsed.data.symbols.map(async (symbol) => ({
        symbol,
        bars: await marketData.getDailyBars(symbol, from, to),
      })),
    );

    const data = results
      .filter(
        (r): r is PromiseFulfilledResult<{ symbol: string; bars: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> }> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch comparison data" },
      { status: 502 },
    );
  }
}

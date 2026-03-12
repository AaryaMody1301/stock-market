import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/providers";
import { z } from "zod";
import { REVALIDATE } from "@/lib/constants";

const querySchema = z.object({
  symbols: z
    .string()
    .min(1)
    .transform((s) => s.split(",").map((t) => t.trim().toUpperCase()))
    .pipe(z.array(z.string().min(1).max(10)).min(1).max(30)),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({ symbols: searchParams.get("symbols") });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid symbols parameter. Provide comma-separated tickers." },
      { status: 400 },
    );
  }

  try {
    const quotes = await marketData.getQuotes(parsed.data.symbols);
    return NextResponse.json(
      { data: quotes },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE.quotes}, stale-while-revalidate=${REVALIDATE.quotes * 2}`,
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 502 });
  }
}

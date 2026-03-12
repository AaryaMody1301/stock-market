import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/providers";
import { z } from "zod";
import { REVALIDATE } from "@/lib/constants";

const querySchema = z.object({
  q: z.string().min(1).max(50),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({ q: searchParams.get("q") });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid query parameter 'q'." },
      { status: 400 },
    );
  }

  try {
    const results = await marketData.searchSymbol(parsed.data.q);
    return NextResponse.json(
      { data: results },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE.search}, stale-while-revalidate=${REVALIDATE.search * 2}`,
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}

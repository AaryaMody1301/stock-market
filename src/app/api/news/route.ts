import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/providers";
import { z } from "zod";
import { REVALIDATE } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

const querySchema = z.object({
  category: z
    .enum(["general", "forex", "crypto", "merger"])
    .default("general"),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(ip);
  if (limited) return limited;

  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({ category: searchParams.get("category") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid category. Use: general, forex, crypto, or merger." },
      { status: 400 },
    );
  }

  const category = parsed.data.category;

  try {
    const news = await marketData.getMarketNews(category);
    return NextResponse.json(
      { data: news },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE.news}, stale-while-revalidate=${REVALIDATE.news * 2}`,
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
  }
}

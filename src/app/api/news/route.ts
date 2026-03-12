import { NextRequest, NextResponse } from "next/server";
import { marketData } from "@/lib/providers";
import { REVALIDATE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || "general";

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

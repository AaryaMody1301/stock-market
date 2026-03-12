import { Suspense } from "react";
import Image from "next/image";
import { marketData } from "@/lib/providers";
import type { MarketNewsItem } from "@/lib/providers/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market News",
  description: "Latest financial news and market updates from top sources.",
};

function NewsCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

function timeAgo(unixSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000 - unixSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NewsCard({ item }: { item: MarketNewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="transition-all hover:shadow-md hover:border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex gap-4">
            {item.imageUrl && (
              <div className="hidden sm:block flex-shrink-0 w-48 h-32 relative">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover rounded-l-lg"
                  sizes="192px"
                  unoptimized
                />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.source}
                  </Badge>
                  {item.category && item.category !== "general" && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary">
                  {item.headline}
                </h3>
                {item.summary && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(item.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  Read more <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

async function NewsFeed() {
  const news = await marketData.getMarketNews("general");

  if (news.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Newspaper className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No news available at the moment.</p>
        <p className="text-sm">Check back later for the latest market updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item, i) => (
        <NewsCard key={`${item.url}-${i}`} item={item} />
      ))}
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market News</h1>
            <p className="text-muted-foreground">
              Latest headlines and market-moving stories
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<NewsCardSkeleton />}>
        <NewsFeed />
      </Suspense>
    </div>
  );
}

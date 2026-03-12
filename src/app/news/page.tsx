import { Suspense } from "react";
import Image from "next/image";
import { marketData } from "@/lib/providers";
import type { MarketNewsItem } from "@/lib/providers/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, ExternalLink, Clock, TrendingUp } from "lucide-react";
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
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
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

function FeaturedNewsCard({ item }: { item: MarketNewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-0">
            {item.imageUrl && (
              <div className="relative h-48 sm:h-auto sm:w-64 flex-shrink-0 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 256px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-gradient-to-r" />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {item.source}
                  </Badge>
                  {item.category && item.category !== "general" && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
                  {item.headline}
                </h3>
                {item.summary && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {item.summary}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(item.publishedAt)}
                </span>
                <span className="flex items-center gap-1 text-primary font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  Read article <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function NewsCard({ item }: { item: MarketNewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20">
        <CardContent className="p-0">
          <div className="flex gap-4">
            {item.imageUrl && (
              <div className="hidden sm:block flex-shrink-0 w-48 h-32 relative overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover rounded-l-lg transition-transform duration-500 group-hover:scale-105"
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
                <h3 className="font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
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
                <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 text-primary font-medium">
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
      <div className="py-16 text-center text-muted-foreground">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Newspaper className="h-8 w-8 opacity-50" />
        </div>
        <p className="font-medium">No news available at the moment.</p>
        <p className="text-sm mt-1">Check back later for the latest market updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Featured first article */}
      {news[0] && <FeaturedNewsCard item={news[0]} />}
      {/* Rest */}
      {news.slice(1).map((item, i) => (
        <NewsCard key={`${item.url}-${i}`} item={item} />
      ))}
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="gradient-mesh">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
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
    </div>
  );
}

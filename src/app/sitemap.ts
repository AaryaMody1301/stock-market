import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "/", changeFrequency: "hourly", priority: 1 },
    { url: "/news", changeFrequency: "hourly", priority: 0.8 },
    { url: "/watchlist", changeFrequency: "daily", priority: 0.6 },
    { url: "/portfolio", changeFrequency: "daily", priority: 0.6 },
    { url: "/compare", changeFrequency: "daily", priority: 0.7 },
  ];
}

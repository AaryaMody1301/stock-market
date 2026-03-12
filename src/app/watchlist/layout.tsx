import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist",
  description:
    "Track your favorite stocks in real-time. Monitor price changes and stay updated on the market.",
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

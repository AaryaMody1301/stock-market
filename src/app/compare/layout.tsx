import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Stocks",
  description:
    "Compare up to 4 stocks side by side with interactive charts. Analyze percentage change and absolute price trends.",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

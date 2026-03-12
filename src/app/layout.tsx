import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InvestSmart — Smart Stock Market Analytics",
    template: "%s | InvestSmart",
  },
  description:
    "Smart stock market analytics with real-time prices, interactive charts, portfolio tracking, watchlists, and market news. Invest smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              Skip to main content
            </a>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1">{children}</main>
              <footer className="border-t border-border/40 py-6">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
                  &copy; {new Date().getFullYear()} InvestSmart. Market data provided
                  by Finnhub &amp; Twelve Data. For personal use only.
                </div>
              </footer>
            </div>
          </TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

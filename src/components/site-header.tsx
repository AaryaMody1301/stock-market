import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { StockSearch } from "@/components/stock-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { MarketStatusIndicator } from "@/components/market-status";
import { NavLinks } from "@/components/nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu */}
        <MobileNav />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            InvestSmart
          </span>
        </Link>

        {/* Market Status */}
        <MarketStatusIndicator />

        {/* Navigation */}
        <NavLinks />

        {/* Search */}
        <div className="ml-auto flex-1 md:max-w-sm">
          <StockSearch />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

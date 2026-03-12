"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import type { SymbolSearchResult } from "@/lib/providers/types";

export function StockSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        } else {
          setError(true);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback(
    (symbol: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/stocks/${symbol}`);
    },
    [router],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search stocks...</span>
        <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Search stocks</DialogTitle>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by ticker or company name..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}
              {!loading && query.length > 0 && results.length === 0 && (
                <CommandEmpty>{error ? "Search failed. Try again." : "No results found."}</CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup heading="Stocks">
                  {results.map((r) => (
                    <CommandItem
                      key={r.symbol}
                      value={r.symbol}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <span className="font-semibold">{r.symbol}</span>
                          <span className="ml-2 text-muted-foreground">
                            {r.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {r.exchange}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

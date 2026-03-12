"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ComparisonChart } from "@/components/charts/comparison-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Plus, X, Search, Loader2 } from "lucide-react";

interface ComparisonData {
  symbol: string;
  bars: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>;
}

const SUGGESTED = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"];

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [input, setInput] = useState("");
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const addSymbol = useCallback(
    (sym: string) => {
      const upper = sym.trim().toUpperCase();
      if (upper && !symbols.includes(upper) && symbols.length < 4) {
        setSymbols((prev) => [...prev, upper]);
        setFetched(false);
      }
      setInput("");
    },
    [symbols],
  );

  const removeSymbol = useCallback((sym: string) => {
    setSymbols((prev) => prev.filter((s) => s !== sym));
    setFetched(false);
  }, []);

  const fetchComparison = useCallback(async () => {
    if (symbols.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/compare?symbols=${symbols.join(",")}`,
      );
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setFetched(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Stock Comparison
            </h1>
            <p className="text-muted-foreground">
              Compare up to 4 stocks side by side
            </p>
          </div>
        </div>
      </section>

      {/* Symbol Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Stocks to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSymbol(input);
                }}
                placeholder="Add ticker symbol (e.g. AAPL)"
                className="pl-9"
                disabled={symbols.length >= 4}
              />
            </div>
            <Button
              onClick={() => addSymbol(input)}
              disabled={!input.trim() || symbols.length >= 4}
              size="default"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Selected symbols */}
          <div className="flex flex-wrap gap-2">
            {symbols.map((sym) => (
              <Badge key={sym} variant="secondary" className="gap-1 px-3 py-1.5">
                {sym}
                <button onClick={() => removeSymbol(sym)}>
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Quick-add suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.filter((s) => !symbols.includes(s)).map((s) => (
              <button
                key={s}
                onClick={() => addSymbol(s)}
                className="rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                disabled={symbols.length >= 4}
              >
                + {s}
              </button>
            ))}
          </div>

          <Button
            onClick={fetchComparison}
            disabled={symbols.length < 2 || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="mr-2 h-4 w-4" />
            )}
            Compare {symbols.length} Stocks
          </Button>
        </CardContent>
      </Card>

      {/* Chart */}
      {fetched && data.length >= 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1 Year Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="percent">
              <TabsList className="mb-4">
                <TabsTrigger value="percent">% Change</TabsTrigger>
                <TabsTrigger value="price">Absolute Price</TabsTrigger>
              </TabsList>
              <TabsContent value="percent">
                <ComparisonChart data={data} mode="percent" />
              </TabsContent>
              <TabsContent value="price">
                <ComparisonChart data={data} mode="price" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {fetched && data.length < 2 && (
        <div className="py-12 text-center text-muted-foreground">
          Could not load enough data to compare. Check the ticker symbols and
          try again.
        </div>
      )}
    </div>
  );
}

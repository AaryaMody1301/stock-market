"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePortfolio } from "@/hooks/use-portfolio";
import { toast } from "sonner";

interface AddToPortfolioButtonProps {
  symbol: string;
  currentPrice: number;
}

export function AddToPortfolioButton({
  symbol,
  currentPrice,
}: AddToPortfolioButtonProps) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState("1");
  const [cost, setCost] = useState(currentPrice.toFixed(2));
  const { addHolding } = usePortfolio();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseFloat(shares);
    const c = parseFloat(cost);
    if (s > 0 && c > 0) {
      addHolding(symbol, s, c);
      toast.success(`Added ${s} shares of ${symbol} to portfolio`);
      setOpen(false);
      setShares("1");
      setCost(currentPrice.toFixed(2));
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />
        Portfolio
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Add {symbol} to Portfolio
          </DialogTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Number of Shares
              </label>
              <Input
                type="number"
                min="0.001"
                step="any"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Average Cost per Share ($)
              </label>
              <Input
                type="number"
                min="0.01"
                step="any"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 150.00"
                className="mt-1"
              />
            </div>
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Investment</span>
                <span className="font-semibold">
                  ${(parseFloat(shares || "0") * parseFloat(cost || "0")).toFixed(2)}
                </span>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Briefcase className="mr-2 h-4 w-4" />
              Add to Portfolio
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  ColorType,
  LineSeries,
} from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";

const LINE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

interface ComparisonData {
  symbol: string;
  bars: Array<{ date: string; close: number }>;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  height?: number;
  mode: "price" | "percent";
}

export function ComparisonChart({
  data,
  height = 450,
  mode,
}: ComparisonChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#71717a",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      grid: {
        vertLines: {
          color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        },
        horzLines: {
          color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        },
      },
      crosshair: {
        vertLine: {
          labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5",
        },
        horzLine: {
          labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    data.forEach((series, i) => {
      const color = LINE_COLORS[i % LINE_COLORS.length];
      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        title: series.symbol,
        priceFormat:
          mode === "percent"
            ? { type: "custom", formatter: (v: number) => `${v.toFixed(2)}%` }
            : { type: "price", precision: 2, minMove: 0.01 },
      });

      const basePrice = series.bars[0]?.close || 1;

      const lineData = series.bars.map((b) => ({
        time: b.date as string,
        value:
          mode === "percent"
            ? ((b.close - basePrice) / basePrice) * 100
            : b.close,
      }));

      lineSeries.setData(lineData);
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, isDark, mode]);

  return <div ref={containerRef} className="w-full rounded-lg" />;
}

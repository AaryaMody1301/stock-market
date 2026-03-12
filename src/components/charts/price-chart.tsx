"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type CandlestickData,
  type Time,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";

interface PriceChartProps {
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  height?: number;
  showVolume?: boolean;
  showSMA?: boolean;
}

function calcSMA(data: { close: number }[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

export function PriceChart({
  data,
  height = 400,
  showVolume = true,
  showSMA = true,
}: PriceChartProps) {
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
        vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
      },
      crosshair: {
        vertLine: { labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5" },
        horzLine: { labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
      },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const chartData: CandlestickData<Time>[] = data.map((d) => ({
      time: d.date as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeries.setData(chartData);

    // Volume histogram
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        borderVisible: false,
      });

      volumeSeries.setData(
        data
          .filter((d) => d.volume != null && d.volume > 0)
          .map((d) => ({
            time: d.date as Time,
            value: d.volume!,
            color:
              d.close >= d.open
                ? isDark
                  ? "rgba(34,197,94,0.3)"
                  : "rgba(34,197,94,0.4)"
                : isDark
                  ? "rgba(239,68,68,0.3)"
                  : "rgba(239,68,68,0.4)",
          })),
      );
    }

    // SMA overlays
    if (showSMA && data.length > 20) {
      const sma20 = calcSMA(data, 20);
      const sma50 = calcSMA(data, 50);

      const sma20Series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 1,
        title: "SMA 20",
        priceLineVisible: false,
      });

      sma20Series.setData(
        data
          .map((d, i) =>
            sma20[i] !== null
              ? { time: d.date as Time, value: sma20[i]! }
              : null,
          )
          .filter(Boolean) as Array<{ time: Time; value: number }>,
      );

      if (data.length > 50) {
        const sma50Series = chart.addSeries(LineSeries, {
          color: "#f59e0b",
          lineWidth: 1,
          title: "SMA 50",
          priceLineVisible: false,
        });

        sma50Series.setData(
          data
            .map((d, i) =>
              sma50[i] !== null
                ? { time: d.date as Time, value: sma50[i]! }
                : null,
            )
            .filter(Boolean) as Array<{ time: Time; value: number }>,
        );
      }
    }

    chartRef.current = chart;
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
  }, [data, height, isDark, showVolume, showSMA]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg"
      role="img"
      aria-label="Stock price candlestick chart"
    />
  );
}

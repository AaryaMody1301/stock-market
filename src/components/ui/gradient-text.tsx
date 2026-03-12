"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}

export function GradientText({
  children,
  className,
  from = "from-primary",
  via = "via-primary/70",
  to = "to-primary/50",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        from,
        via,
        to,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PulsingDot({
  className,
  color = "bg-emerald-500",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          color,
        )}
      />
      <span
        className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)}
      />
    </span>
  );
}

export function Sparkles({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <span className="absolute -right-1 -top-1 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className,
}: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-px",
        className,
      )}
    >
      {/* Animated glow border */}
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-sm" />
      </div>
      <div className="relative rounded-[11px] bg-card">{children}</div>
    </motion.div>
  );
}

export function GradientBorderCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-px",
        className,
      )}
    >
      <div className="relative rounded-[11px] bg-card transition-colors group-hover:bg-card/80">
        {children}
      </div>
    </div>
  );
}

export function ShimmerCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card",
        className,
      )}
    >
      {/* Shimmer effect on hover */}
      <div className="pointer-events-none absolute -inset-full z-10 block translate-x-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
      <div className="relative">{children}</div>
    </div>
  );
}

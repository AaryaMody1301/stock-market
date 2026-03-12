"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  Briefcase,
  GitCompareArrows,
  Newspaper,
  ArrowUpRight,
} from "lucide-react";

const actions = [
  {
    href: "/watchlist",
    icon: Eye,
    label: "Watchlist",
    desc: "Track your favorites",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    href: "/portfolio",
    icon: Briefcase,
    label: "Portfolio",
    desc: "Monitor holdings",
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    href: "/compare",
    icon: GitCompareArrows,
    label: "Compare",
    desc: "Side by side analysis",
    gradient: "from-purple-500/10 to-purple-600/5",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    href: "/news",
    icon: Newspaper,
    label: "News",
    desc: "Market-moving stories",
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.href}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <Link href={action.href}>
              <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 bg-gradient-to-br ${action.gradient}`}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconBg} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

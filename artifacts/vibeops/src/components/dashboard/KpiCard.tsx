import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  trend?: number;
  trendDirection?: "up" | "down";
  trendType?: "good" | "bad" | "neutral";
  icon?: ReactNode;
  delay?: number;
  className?: string;
  /** When set, the card becomes a link to this route. */
  href?: string;
}

export default function KpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  trend,
  trendDirection = "up",
  trendType = "good",
  icon,
  delay = 0,
  className,
  href,
}: KpiCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const duration = 800;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const displayValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? Math.round(count).toLocaleString()
        : count.toFixed(1)
      : value;

  const trendColor =
    trendType === "good"
      ? "text-success"
      : trendType === "bad"
        ? "text-destructive"
        : "text-muted-foreground";

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "group h-full rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        href && "cursor-pointer hover:border-primary/40",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div className="flex items-center gap-1.5">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          {href && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-2xl font-semibold text-foreground/80">{prefix}</span>}
          <span className="text-3xl font-semibold tracking-tight text-foreground">{displayValue}</span>
          {suffix && <span className="text-xl font-semibold text-foreground/80">{suffix}</span>}
        </div>

        {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}

        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            {trendDirection === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

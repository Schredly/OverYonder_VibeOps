import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number; // percentage
  trendDirection?: "up" | "down";
  trendType?: "good" | "bad" | "neutral";
  delay?: number;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  trend,
  trendDirection = "up",
  trendType = "good",
  delay = 0,
  className,
}: KpiCardProps) {
  const [count, setCount] = useState(0);

  // Simplified count-up effect
  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const duration = 1000;
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
    }
  }, [value]);

  const displayValue = typeof value === "number" ? Math.round(count).toLocaleString() : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("glass rounded-xl p-5 relative overflow-hidden group", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded",
              trendType === "good" ? "text-emerald-500 bg-emerald-500/10" : 
              trendType === "bad" ? "text-rose-500 bg-rose-500/10" : 
              "text-amber-500 bg-amber-500/10"
            )}
          >
            {trendDirection === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="flex items-baseline">
        {prefix && <span className="text-2xl font-bold text-foreground/80 mr-1">{prefix}</span>}
        <span className="text-3xl font-bold tracking-tight text-foreground">{displayValue}</span>
        {suffix && <span className="text-xl font-bold text-foreground/80 ml-1">{suffix}</span>}
      </div>
    </motion.div>
  );
}

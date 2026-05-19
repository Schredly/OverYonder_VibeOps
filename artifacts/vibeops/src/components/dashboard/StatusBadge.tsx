import { cn } from "@/lib/utils";

type Tone = "success" | "primary" | "warning" | "danger" | "neutral" | "info";

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

const toneStyles: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-500/10 text-blue-600",
};

/**
 * Map a free-form status string ("Active", "At Risk", "Pending", …) to a tone.
 * Centralized so badges stay consistent across pages.
 */
export function statusToTone(status: string): Tone {
  const s = status.toLowerCase();
  if (/(active|approved|completed|healthy|on track|done|success|live|deployed)/.test(s)) return "success";
  if (/(at risk|review|pending|in progress|planning|in review|warning)/.test(s)) return "warning";
  if (/(rejected|critical|failed|blocked|escalated|breach|high risk|expired)/.test(s)) return "danger";
  if (/(submitted|new|draft|info)/.test(s)) return "info";
  return "primary";
}

export default function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? statusToTone(label);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneStyles[resolved],
        className,
      )}
    >
      {label}
    </span>
  );
}

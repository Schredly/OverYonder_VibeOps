// Centralized tone mapping for APM enums → StatusBadge tones.

type Tone = "success" | "primary" | "warning" | "danger" | "neutral" | "info";

export const dispositionTone: Record<string, Tone> = {
  Tolerate: "neutral",
  Invest: "success",
  Migrate: "info",
  Modernize: "primary",
  Replace: "warning",
  Retire: "danger",
};

export const criticalityTone: Record<string, Tone> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

export const riskTone: Record<string, Tone> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "success",
};

export const lifecycleTone: Record<string, Tone> = {
  Plan: "info",
  Build: "primary",
  Production: "success",
  Sunset: "warning",
  Retired: "danger",
};

export const certTone: Record<string, Tone> = {
  Certified: "success",
  Due: "warning",
  Overdue: "danger",
  "Not Started": "neutral",
  "In Progress": "info",
};

export function healthBarColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-amber-500";
  return "bg-destructive";
}

/** Tech debt: higher = worse, so the color scale is inverted. */
export function techDebtTone(score: number): Tone {
  if (score >= 70) return "danger";
  if (score >= 45) return "warning";
  return "success";
}

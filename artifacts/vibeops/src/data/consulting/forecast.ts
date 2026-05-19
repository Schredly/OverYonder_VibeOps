// Delivery-driven revenue forecast.
//
// Revenue recognizes as work gets delivered, so the forecast is paced by
// delivery, not curve-fit. For each engagement we compare planned progress
// (how far along it *should* be today) against actual progress to get a
// Schedule Performance Index (SPI). SPI < 1 means the engagement is behind
// pace — its end date is projected to slip, which pushes its remaining
// revenue into later months.

import { engagements, type Engagement } from "./engagements";
import { consultingTasks, type ConsultingTask } from "./tasks";
import { consultants } from "./consultants";
import { clients } from "./clients";

export const FORECAST_TODAY = new Date("2026-05-16");

const DAY_MS = 86_400_000;
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const daysBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY_MS;

const consultantName = (id: string) =>
  consultants.find((c) => c.id === id)?.name ?? id;

const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id;

export type ForecastStatus = "On Track" | "Watch" | "At Risk" | "Critical";

export interface DrivingTask {
  task: ConsultingTask;
  ownerName: string;
  signal: "Blocked" | "Overdue" | "Waiting for Client" | "High risk";
}

export interface EngagementForecast {
  engagement: Engagement;
  clientName: string;
  plannedProgress: number; // where the engagement should be today, %
  actualProgress: number; // %
  spi: number; // actual / planned — < 1 is behind pace
  status: ForecastStatus;
  remainingRevenue: number; // budget not yet recognized
  revenueAtRisk: number; // remaining revenue discounted by schedule confidence
  originalEndDate: Date;
  forecastEndDate: Date; // projected from current delivery velocity
  slipDays: number;
  slipWeeks: number;
  drivingTasks: DrivingTask[]; // task-level signals behind the slip
}

export interface MonthForecast {
  label: string; // e.g. "Jun 26"
  committed: number; // $K expected to land — confidence-weighted
  atRisk: number; // $K exposed to schedule slip
}

export interface ForecastSummary {
  forecastNext3Months: number; // $ committed + at-risk over next 3 months
  revenueAtRisk: number; // $ total schedule-weighted exposure
  engagementsSlipping: number; // count behind pace (At Risk / Critical)
  onTrackPct: number;
  onTrackCount: number;
  activeCount: number;
}

function statusFor(spi: number, started: boolean, complete: boolean): ForecastStatus {
  if (!started || complete) return "On Track";
  if (spi >= 0.95) return "On Track";
  if (spi >= 0.8) return "Watch";
  if (spi >= 0.6) return "At Risk";
  return "Critical";
}

function drivingTasksFor(engagementId: string): DrivingTask[] {
  const signalRank: Record<DrivingTask["signal"], number> = {
    Blocked: 0,
    Overdue: 1,
    "Waiting for Client": 2,
    "High risk": 3,
  };
  return consultingTasks
    .filter((t) => t.engagementId === engagementId)
    .map((t): DrivingTask | null => {
      const overdue =
        new Date(t.dueDate).getTime() < FORECAST_TODAY.getTime() &&
        t.status !== "Complete";
      let signal: DrivingTask["signal"] | null = null;
      if (t.status === "Blocked") signal = "Blocked";
      else if (overdue) signal = "Overdue";
      else if (t.status === "Waiting for Client") signal = "Waiting for Client";
      else if (t.risk === "High") signal = "High risk";
      return signal ? { task: t, ownerName: consultantName(t.ownerId), signal } : null;
    })
    .filter((d): d is DrivingTask => d !== null)
    .sort((a, b) => signalRank[a.signal] - signalRank[b.signal]);
}

function computeEngagementForecast(eng: Engagement): EngagementForecast {
  const start = new Date(eng.startDate);
  const end = new Date(eng.endDate);
  const totalDuration = Math.max(1, daysBetween(start, end));
  const elapsed = daysBetween(start, FORECAST_TODAY);
  const started = elapsed > 0;
  const complete = eng.progress >= 100;

  const plannedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  const actualProgress = eng.progress;
  const spi = plannedProgress > 0 ? actualProgress / plannedProgress : 1;

  const remainingRevenue = Math.max(0, eng.budget - eng.revenueRecognized);

  // Project the end date from current delivery velocity (% per day).
  let forecastEndDate = end;
  if (started && !complete && actualProgress > 0) {
    const velocity = actualProgress / elapsed;
    const forecastRemainingDays = (100 - actualProgress) / velocity;
    const projected = new Date(FORECAST_TODAY.getTime() + forecastRemainingDays * DAY_MS);
    if (projected.getTime() > FORECAST_TODAY.getTime()) forecastEndDate = projected;
  }

  const slipDays = Math.max(0, Math.round(daysBetween(end, forecastEndDate)));

  const status = statusFor(spi, started, complete);
  const confidence = Math.min(1, spi);
  const revenueAtRisk = Math.round(remainingRevenue * (1 - confidence));

  return {
    engagement: eng,
    clientName: clientName(eng.clientId),
    plannedProgress: Math.round(plannedProgress),
    actualProgress,
    spi: Math.round(spi * 100) / 100,
    status,
    remainingRevenue,
    revenueAtRisk,
    originalEndDate: end,
    forecastEndDate,
    slipDays,
    slipWeeks: Math.round(slipDays / 7),
    drivingTasks: drivingTasksFor(eng.id),
  };
}

export const engagementForecasts: EngagementForecast[] = engagements
  .map(computeEngagementForecast)
  .sort((a, b) => b.revenueAtRisk - a.revenueAtRisk);

function monthWindow(count: number) {
  const months: { label: string; start: Date; end: Date }[] = [];
  let y = FORECAST_TODAY.getFullYear();
  let m = FORECAST_TODAY.getMonth();
  for (let i = 0; i < count; i++) {
    months.push({
      label: `${MONTH_LABELS[m]} ${String(y).slice(2)}`,
      start: new Date(y, m, 1),
      end: new Date(y, m + 1, 1),
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return months;
}

function buildMonthlyForecast(): MonthForecast[] {
  const months = monthWindow(6);
  const buckets = months.map((mo) => ({ label: mo.label, committed: 0, atRisk: 0 }));

  for (const ef of engagementForecasts) {
    if (ef.remainingRevenue <= 0) continue;
    // Spread remaining revenue linearly from today to the forecast end date.
    const spreadDays = Math.max(1, daysBetween(FORECAST_TODAY, ef.forecastEndDate));
    const perDay = ef.remainingRevenue / spreadDays;
    const confidence = Math.min(1, ef.spi);

    months.forEach((mo, idx) => {
      const overlapStart = Math.max(mo.start.getTime(), FORECAST_TODAY.getTime());
      const overlapEnd = Math.min(mo.end.getTime(), ef.forecastEndDate.getTime());
      const overlapDays = Math.max(0, (overlapEnd - overlapStart) / DAY_MS);
      const slice = perDay * overlapDays;
      buckets[idx].committed += slice * confidence;
      buckets[idx].atRisk += slice * (1 - confidence);
    });
  }

  return buckets.map((b) => ({
    label: b.label,
    committed: Math.round(b.committed / 1000),
    atRisk: Math.round(b.atRisk / 1000),
  }));
}

export const monthlyForecast: MonthForecast[] = buildMonthlyForecast();

function buildSummary(): ForecastSummary {
  const active = engagementForecasts.filter((e) => e.actualProgress < 100);
  const onTrackCount = active.filter((e) => e.status === "On Track").length;
  return {
    forecastNext3Months: monthlyForecast
      .slice(0, 3)
      .reduce((s, m) => s + (m.committed + m.atRisk) * 1000, 0),
    revenueAtRisk: active.reduce((s, e) => s + e.revenueAtRisk, 0),
    engagementsSlipping: active.filter(
      (e) => e.status === "At Risk" || e.status === "Critical",
    ).length,
    onTrackPct: active.length ? Math.round((onTrackCount / active.length) * 100) : 0,
    onTrackCount,
    activeCount: active.length,
  };
}

export const forecastSummary: ForecastSummary = buildSummary();

// Engagements off-pace — the dashboard watchlist. Sorted by dollar exposure.
export const forecastWatchlist: EngagementForecast[] = engagementForecasts.filter(
  (e) => e.status !== "On Track" && e.actualProgress < 100,
);

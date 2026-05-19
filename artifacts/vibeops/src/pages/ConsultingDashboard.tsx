import { useState } from "react";
import { Link } from "wouter";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { money, shortDate } from "@/components/consulting/format";
import {
  monthlyForecast,
  forecastSummary,
  forecastWatchlist,
  type EngagementForecast,
  type ForecastStatus,
} from "@/data/consulting/forecast";
import { engagements } from "@/data/consulting/engagements";
import { clients } from "@/data/consulting/clients";
import { consultants } from "@/data/consulting/consultants";

// Revenue datasets — all values in $K.
const revenueRanges = {
  weekly: {
    label: "Weekly",
    subtitle: "Last 8 weeks ($K)",
    data: [
      { name: "W1", value: 850 },
      { name: "W2", value: 920 },
      { name: "W3", value: 1100 },
      { name: "W4", value: 1250 },
      { name: "W5", value: 1180 },
      { name: "W6", value: 1320 },
      { name: "W7", value: 1400 },
      { name: "W8", value: 1450 },
    ],
  },
  monthly: {
    label: "Monthly",
    subtitle: "Last 6 months",
    data: [
      { name: "Dec", value: 3900 },
      { name: "Jan", value: 4250 },
      { name: "Feb", value: 4100 },
      { name: "Mar", value: 4680 },
      { name: "Apr", value: 5020 },
      { name: "May", value: 5400 },
    ],
  },
  "3m": {
    label: "3 Month",
    subtitle: "Last 13 weeks ($K)",
    data: [
      { name: "W1", value: 1010 },
      { name: "W2", value: 1080 },
      { name: "W3", value: 1140 },
      { name: "W4", value: 1090 },
      { name: "W5", value: 1180 },
      { name: "W6", value: 1240 },
      { name: "W7", value: 1210 },
      { name: "W8", value: 1300 },
      { name: "W9", value: 1280 },
      { name: "W10", value: 1360 },
      { name: "W11", value: 1320 },
      { name: "W12", value: 1400 },
      { name: "W13", value: 1450 },
    ],
  },
  "6m": {
    label: "6 Month",
    subtitle: "Last 6 months",
    data: [
      { name: "Dec", value: 3900 },
      { name: "Jan", value: 4250 },
      { name: "Feb", value: 4100 },
      { name: "Mar", value: 4680 },
      { name: "Apr", value: 5020 },
      { name: "May", value: 5400 },
    ],
  },
  "1y": {
    label: "1 Year",
    subtitle: "Last 12 months",
    data: [
      { name: "Jun", value: 3200 },
      { name: "Jul", value: 3350 },
      { name: "Aug", value: 3480 },
      { name: "Sep", value: 3610 },
      { name: "Oct", value: 3740 },
      { name: "Nov", value: 3820 },
      { name: "Dec", value: 3900 },
      { name: "Jan", value: 4250 },
      { name: "Feb", value: 4100 },
      { name: "Mar", value: 4680 },
      { name: "Apr", value: 5020 },
      { name: "May", value: 5400 },
    ],
  },
  all: {
    label: "All",
    subtitle: "Annual revenue",
    data: [
      { name: "2022", value: 28600 },
      { name: "2023", value: 34200 },
      { name: "2024", value: 41800 },
      { name: "2025", value: 49500 },
    ],
  },
} as const;

type RevenueRange = keyof typeof revenueRanges;
const revenueRangeKeys = Object.keys(revenueRanges) as RevenueRange[];

const formatRevenue = (value: number) =>
  value >= 1000 ? `$${(value / 1000).toFixed(1)}M` : `$${value}K`;

const utilization = [
  { name: "W1", value: 72 },
  { name: "W2", value: 75 },
  { name: "W3", value: 78 },
  { name: "W4", value: 80 },
  { name: "W5", value: 82 },
  { name: "W6", value: 84 },
  { name: "W7", value: 85 },
  { name: "W8", value: 87 },
];

const margin = [
  { name: "Q1", value: 28 },
  { name: "Q2", value: 31 },
  { name: "Q3", value: 33 },
  { name: "Q4", value: 36 },
];

const clientNameById: Record<string, string> = Object.fromEntries(
  clients.map((c) => [c.id, c.name]),
);
const consultantNameById: Record<string, string> = Object.fromEntries(
  consultants.map((c) => [c.id, c.name]),
);

// Top live engagements by contract value — drawn from real engagement records.
const topEngagements = [...engagements]
  .sort((a, b) => b.budget - a.budget)
  .slice(0, 6);

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const healthStyles = {
  Healthy: "bg-success/10 text-success",
  "At Risk": "bg-primary/10 text-primary",
  Critical: "bg-destructive/10 text-destructive",
} as const;

const healthIcons = {
  Healthy: CheckCircle2,
  "At Risk": AlertTriangle,
  Critical: AlertTriangle,
} as const;

// Forecast values are in $K.
const forecastValueFormat = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}M` : `$${v}K`;

const forecastStatusTone: Record<ForecastStatus, "success" | "warning" | "danger"> = {
  "On Track": "success",
  Watch: "warning",
  "At Risk": "warning",
  Critical: "danger",
};

const signalTone = {
  Blocked: "danger",
  Overdue: "danger",
  "Waiting for Client": "warning",
  "High risk": "warning",
} as const;

function WatchlistRow({ ef }: { ef: EngagementForecast }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-muted/40"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Chevron className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <Link
                href={`/consulting/engagements/${ef.engagement.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block truncate font-medium text-foreground hover:text-primary"
              >
                {ef.engagement.name}
              </Link>
              <div className="text-xs text-muted-foreground">{ef.clientName}</div>
            </div>
          </div>
        </td>
        <td className="p-3">
          <StatusBadge label={ef.status} tone={forecastStatusTone[ef.status]} />
        </td>
        <td className="p-3">
          <div className="font-medium text-foreground">{ef.spi.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            {ef.actualProgress}% done · {ef.plannedProgress}% planned
          </div>
        </td>
        <td className="p-3">
          {ef.slipWeeks > 0 ? (
            <>
              <div className="font-medium text-destructive">~{ef.slipWeeks} wk late</div>
              <div className="text-xs text-muted-foreground">
                {shortDate(ef.forecastEndDate.toISOString().slice(0, 10))}
              </div>
            </>
          ) : (
            <span className="text-muted-foreground">On schedule</span>
          )}
        </td>
        <td className="p-3 font-medium text-foreground">{money(ef.remainingRevenue)}</td>
        <td className="p-3 font-semibold text-destructive">{money(ef.revenueAtRisk)}</td>
      </tr>
      {open && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Signals driving the slip
            </div>
            {ef.drivingTasks.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No flagged tasks — the slip is pace-driven: the team is delivering
                slower than the plan assumes. Re-baseline scope or add capacity.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {ef.drivingTasks.map((dt) => (
                  <li
                    key={dt.task.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card p-3"
                  >
                    <StatusBadge label={dt.signal} tone={signalTone[dt.signal]} />
                    <span className="font-medium text-foreground">{dt.task.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {dt.ownerName} · due {shortDate(dt.task.dueDate)}
                    </span>
                    {dt.task.blocker && (
                      <span className="w-full text-xs text-destructive">
                        Blocker: {dt.task.blocker}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function ConsultingDashboard() {
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("weekly");
  const revenue = revenueRanges[revenueRange];

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Services CEO Dashboard"
        description="Consulting operations, revenue health, and delivery posture."
        badges={
          <>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">Executive View</Badge>
            <Badge className="bg-success/10 text-success hover:bg-success/15">Pipeline Strong</Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Weekly Revenue" value={1.45} prefix="$" suffix="M" href="/consulting/billing" trend={12} icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Billable Utilization" value={87} suffix="%" href="/consulting/utilization" trend={3.7} icon={<TrendingUp className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Project Margin" value={36} suffix="%" href="/consulting/reporting" trend={2.1} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Active Engagements" value={18} href="/consulting/engagements" trend={15.3} icon={<Briefcase className="h-5 w-5" />} delay={0.2} />
        <KpiCard title="Pipeline Value" value={8.2} prefix="$" suffix="M" href="/consulting/proposals" subtitle="across proposals" trend={9.4} icon={<DollarSign className="h-5 w-5" />} delay={0.25} />
        <KpiCard title="Consultant Capacity" value={92} suffix="%" href="/consulting/capacity" subtitle="committed next 30d" trend={4} trendType="neutral" icon={<Users className="h-5 w-5" />} delay={0.3} />
        <KpiCard title="On-Time Delivery" value={94} suffix="%" href="/consulting/delivery" trend={1.2} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.35} />
        <KpiCard title="Delivery Risk" value={2} href="/consulting/risks" subtitle="engagements flagged" trend={1} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.4} />
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2 className="text-lg font-semibold text-foreground">Delivery Forecast</h2>
          <span className="text-sm text-muted-foreground">
            Revenue is paced by delivery — projected from how fast each engagement is actually progressing.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Forecast Revenue" value={forecastSummary.forecastNext3Months / 1_000_000} prefix="$" suffix="M" href="/consulting/forecasting" subtitle="next 3 months" icon={<TrendingUp className="h-5 w-5" />} delay={0.05} />
          <KpiCard title="Revenue at Risk" value={forecastSummary.revenueAtRisk / 1000} prefix="$" suffix="K" href="/consulting/risks" subtitle="schedule-weighted exposure" trendType="bad" icon={<ShieldAlert className="h-5 w-5" />} delay={0.1} />
          <KpiCard title="Engagements Slipping" value={forecastSummary.engagementsSlipping} href="/consulting/delivery" subtitle="behind delivery pace" trendType="bad" icon={<TrendingDown className="h-5 w-5" />} delay={0.15} />
          <KpiCard title="On-Track" value={forecastSummary.onTrackPct} suffix="%" href="/consulting/delivery" subtitle={`${forecastSummary.onTrackCount} of ${forecastSummary.activeCount} engagements`} icon={<Gauge className="h-5 w-5" />} delay={0.2} />
        </div>

        <ChartCard
          title="Revenue Forecast — Committed vs At Risk"
          subtitle="Projected from delivery pace ($K per month)"
          delay={0.25}
          action={
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(var(--primary))" }} />
                Committed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(var(--destructive))" }} />
                At risk
              </span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={forecastValueFormat} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, name: any) => [
                  forecastValueFormat(value as number),
                  name === "committed" ? "Committed" : "At risk",
                ]}
              />
              <Bar dataKey="committed" stackId="forecast" fill="hsl(var(--primary))" maxBarSize={48} />
              <Bar dataKey="atRisk" stackId="forecast" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Revenue at Risk — Engagement Watchlist</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Engagements behind delivery pace, ranked by dollar exposure. Expand a row to see the tasks driving the slip.
            </p>
          </div>
          {forecastWatchlist.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Every active engagement is on or ahead of pace.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Engagement</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Pace (SPI)</th>
                  <th className="p-3">Forecast slip</th>
                  <th className="p-3">Remaining fees</th>
                  <th className="p-3">At risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {forecastWatchlist.map((ef) => (
                  <WatchlistRow key={ef.engagement.id} ef={ef} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard
          title="Revenue Trend"
          subtitle={revenue.subtitle}
          className="xl:col-span-2"
          delay={0.4}
          action={
            <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {revenueRangeKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRevenueRange(key)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    revenueRange === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {revenueRanges[key].label}
                </button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...revenue.data]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatRevenue} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [formatRevenue(value as number), "Revenue"]} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Consultant Utilization" subtitle="Billable %" delay={0.5}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}%`, "Utilization"]} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--card))", stroke: "hsl(var(--success))", strokeWidth: 2 }} animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Margin Trend" subtitle="Quarterly project margin" delay={0.6}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={margin}>
              <defs>
                <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}%`, "Margin"]} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorMargin)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-lg border border-border bg-card shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h3 className="text-base font-medium text-foreground">Active Client Engagements</h3>
              <p className="mt-1 text-sm text-muted-foreground">Live engagements ranked by contract value — select one to open its record.</p>
            </div>
            <Link href="/consulting/engagements">
              <Button variant="outline" size="sm">All engagements</Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topEngagements.map((eng) => {
              const Icon = healthIcons[eng.health];
              return (
                <Link
                  key={eng.id}
                  href={`/consulting/engagements/${eng.id}`}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground">{eng.name}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{clientNameById[eng.clientId] ?? eng.clientId}</span>
                      <span>{eng.type}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {consultantNameById[eng.deliveryManagerId] ?? eng.deliveryManagerId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-medium text-foreground">{money(eng.budget)}</div>
                      <div className="text-xs text-muted-foreground">Contract value</div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                        healthStyles[eng.health],
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {eng.health}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

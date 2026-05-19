import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Activity, AlertTriangle, Target } from "lucide-react";
import { revenueForecast, utilizationForecast, marginTrend } from "@/data/consulting/revenue";
import { proposals } from "@/data/consulting/proposals";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

export default function ConsultingForecasting() {
  const baseTotal = revenueForecast.reduce((s, m) => s + m.base, 0);
  const optimistic = revenueForecast.reduce((s, m) => s + m.optimistic, 0);
  const pessimistic = revenueForecast.reduce((s, m) => s + m.pessimistic, 0);
  const weightedPipeline = proposals
    .filter((p) => p.stage !== "Closed Won" && p.stage !== "Closed Lost")
    .reduce((s, p) => s + (p.value * p.probability) / 100, 0);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Forecasting"
        description="Revenue, utilization, margin, and AI transformation forecasting with scenario modeling."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="6mo Base Revenue" value={baseTotal / 1000} prefix="$" suffix="M" trend={9} icon={<TrendingUp className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Optimistic" value={optimistic / 1000} prefix="$" suffix="M" subtitle={`+${Math.round(((optimistic - baseTotal) / baseTotal) * 100)}% vs base`} icon={<Target className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Pessimistic" value={pessimistic / 1000} prefix="$" suffix="M" subtitle={`-${Math.round(((baseTotal - pessimistic) / baseTotal) * 100)}% vs base`} icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Weighted Pipeline" value={weightedPipeline / 1_000_000} prefix="$" suffix="M" subtitle="probability-adjusted" icon={<Activity className="h-5 w-5" />} delay={0.2} />
      </div>

      <ChartCard title="Revenue forecast" subtitle="Base / Optimistic / Pessimistic — next 6 months">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueForecast}>
            <defs>
              <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.18} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[4000, 10000]} tickFormatter={(v) => `$${v / 1000}M`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${(v / 1000).toFixed(1)}M`, ""]} />
            <Area type="monotone" dataKey="base" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#band)" />
            <Line type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            <Line type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Utilization forecast" subtitle="Forecast vs target">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={utilizationForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={80} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="forecast" stroke="hsl(var(--success))" strokeWidth={2.5} />
              <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Margin trend" subtitle="6 quarter trailing">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={marginTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[20, 40]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ScenarioCard
          title="Best case"
          tone="success"
          summary="Top 3 deals close + Veridian wave 2 expands"
          metrics={[
            { label: "6mo Revenue", value: "$48M" },
            { label: "Margin", value: "37%" },
            { label: "New Engagements", value: "11" },
          ]}
        />
        <ScenarioCard
          title="Base"
          tone="primary"
          summary="Current win-rate × current pipeline ages"
          metrics={[
            { label: "6mo Revenue", value: "$43M" },
            { label: "Margin", value: "34%" },
            { label: "New Engagements", value: "8" },
          ]}
        />
        <ScenarioCard
          title="Downside"
          tone="warning"
          summary="2 strategic deals slip + Cascade churns"
          metrics={[
            { label: "6mo Revenue", value: "$37M" },
            { label: "Margin", value: "30%" },
            { label: "New Engagements", value: "5" },
          ]}
        />
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  tone,
  summary,
  metrics,
}: {
  title: string;
  tone: "success" | "primary" | "warning";
  summary: string;
  metrics: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <StatusBadge label={title} tone={tone} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">{m.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Activity, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { weeklyRevenue, utilizationForecast } from "@/data/consulting/revenue";
import { consultants } from "@/data/consulting/consultants";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

export default function BillableUtilization() {
  const targetUtil = 80;
  const realized = Math.round(consultants.reduce((s, c) => s + c.utilizationActual, 0) / consultants.length);
  const billable = Math.round(consultants.reduce((s, c) => s + c.utilizationActual * 0.92, 0) / consultants.length);
  const overallocated = consultants.filter((c) => c.utilizationActual >= c.utilizationTarget + 8);
  const underutilized = consultants.filter((c) => c.utilizationActual < c.utilizationTarget - 10);

  const consultantBars = consultants
    .map((c) => ({ name: c.initials, value: c.utilizationActual, target: c.utilizationTarget, full: c.name }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Billable Utilization"
        description="Profitability lens — billable percent, target gap, and consultant-level comparisons."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Billable %" value={billable} suffix="%" trend={2.1} icon={<Activity className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Realized Utilization" value={realized} suffix="%" subtitle={`Target ${targetUtil}%`} trend={1.5} icon={<TrendingUp className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Overallocated" value={overallocated.length} subtitle="risk of burnout" trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Underutilized" value={underutilized.length} subtitle="margin drag" trend={1} trendDirection="down" trendType="good" icon={<Clock className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Billable %" subtitle="Last 12 weeks">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={targetUtil} stroke="hsl(var(--success))" strokeDasharray="4 4" label={{ value: `Target ${targetUtil}%`, position: "right", fill: "hsl(var(--success))", fontSize: 11 }} />
              <Line type="monotone" dataKey="billable" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Forecast vs Target" subtitle="Next 6 months">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilizationForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="forecast" stroke="hsl(var(--success))" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Per-consultant utilization</h3>
          <p className="mt-1 text-sm text-muted-foreground">Bars are realized utilization. Reference line is portfolio target.</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={consultantBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(label, items) => (items?.[0]?.payload as any)?.full ?? label}
                formatter={(v: any) => [`${v}%`, "Utilization"]}
              />
              <ReferenceLine y={targetUtil} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {consultantBars.map((d, i) => {
                  const fill =
                    d.value >= d.target + 8
                      ? "hsl(var(--destructive))"
                      : d.value < d.target - 10
                        ? "hsl(var(--chart-5))"
                        : "hsl(var(--primary))";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PeopleListCard title="Overallocated — schedule risk" people={overallocated} tone="danger" />
        <PeopleListCard title="Underutilized — margin drag" people={underutilized} tone="warning" />
      </div>
    </div>
  );
}

function PeopleListCard({ title, people, tone }: { title: string; people: typeof consultants; tone: "danger" | "warning" }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
      </div>
      <ul className="divide-y divide-border">
        {people.map((p) => (
          <li key={p.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium text-foreground">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.level} · {p.practice}</div>
            </div>
            <StatusBadge label={`${p.utilizationActual}% / ${p.utilizationTarget}%`} tone={tone} />
          </li>
        ))}
        {people.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Nothing flagged.</li>}
      </ul>
    </div>
  );
}

import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ChartCard from "@/components/dashboard/ChartCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, UserPlus, TrendingDown, TrendingUp } from "lucide-react";
import { consultants } from "@/data/consulting/consultants";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const FUTURE_DEMAND = [
  { practice: "AI Strategy", demand: 4.2, supply: 3.6 },
  { practice: "AI Modernization", demand: 6.5, supply: 4.8 },
  { practice: "AI Governance", demand: 2.4, supply: 2.0 },
  { practice: "Security", demand: 2.8, supply: 2.4 },
  { practice: "Adoption", demand: 4.0, supply: 3.6 },
  { practice: "Modernization", demand: 5.0, supply: 4.4 },
  { practice: "Data & ML", demand: 3.6, supply: 2.8 },
  { practice: "Operating Model", demand: 1.6, supply: 1.5 },
];

export default function ConsultantCapacity() {
  const avgFuture = Math.round(consultants.reduce((s, c) => s + c.futureCapacity, 0) / consultants.length);
  const benchAvailable = consultants.filter((c) => c.futureCapacity >= 30).length;
  const constrained = consultants.filter((c) => c.futureCapacity <= 15).length;
  const totalGap = FUTURE_DEMAND.reduce((s, p) => s + Math.max(0, p.demand - p.supply), 0).toFixed(1);

  const byPractice = Object.entries(
    consultants.reduce((acc, c) => {
      acc[c.practice] = (acc[c.practice] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  ).map(([practice, count]) => ({ practice, count }));

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Consultant Capacity"
        description="Forward-looking staffing — available capacity, future demand, role gaps, and hiring indicators."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Avg 60d Capacity" value={avgFuture} suffix="%" trend={3} icon={<Users className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Bench Available" value={benchAvailable} subtitle="≥ 30% open" icon={<UserPlus className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Constrained" value={constrained} subtitle="≤ 15% open" trend={1} trendDirection="up" trendType="bad" icon={<TrendingDown className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Demand Gap" value={Number(totalGap)} suffix=" FTE" subtitle="next 60d" icon={<TrendingUp className="h-5 w-5" />} delay={0.2} />
      </div>

      <ChartCard title="Demand vs Supply by practice" subtitle="Forward 60-day FTE">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={FUTURE_DEMAND}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="practice" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="supply" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} barSize={18} />
            <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Headcount by practice">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPractice} layout="vertical" margin={{ top: 0, right: 16, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="practice" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Hiring indicators</h3>
            <p className="mt-1 text-sm text-muted-foreground">Where the gap exceeds 0.5 FTE for the next 60 days.</p>
          </div>
          <ul className="divide-y divide-border">
            {FUTURE_DEMAND.filter((p) => p.demand - p.supply > 0.5).map((p) => (
              <li key={p.practice} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-foreground">{p.practice}</div>
                  <div className="text-xs text-muted-foreground">Gap {(p.demand - p.supply).toFixed(1)} FTE</div>
                </div>
                <StatusBadge label={p.demand - p.supply >= 1.5 ? "Hire now" : "Watch"} tone={p.demand - p.supply >= 1.5 ? "danger" : "warning"} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Available capacity (60-day forward)</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Consultant</th>
              <th className="p-3">Level</th>
              <th className="p-3">Practice</th>
              <th className="p-3">Region</th>
              <th className="p-3">Skills</th>
              <th className="p-3">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...consultants].sort((a, b) => b.futureCapacity - a.futureCapacity).map((c) => (
              <tr key={c.id} className="hover:bg-muted/40">
                <td className="p-3">
                  <div className="font-medium text-foreground">{c.name}</div>
                </td>
                <td className="p-3 text-muted-foreground">{c.level}</td>
                <td className="p-3 text-muted-foreground">{c.practice}</td>
                <td className="p-3 text-muted-foreground">{c.region}</td>
                <td className="p-3 text-muted-foreground">{c.skills.join(" · ")}</td>
                <td className="p-3">
                  <StatusBadge
                    label={`${c.futureCapacity}%`}
                    tone={c.futureCapacity >= 30 ? "success" : c.futureCapacity >= 15 ? "warning" : "danger"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, Activity, Briefcase } from "lucide-react";
import {
  weeklyRevenue,
  monthlyRevenue,
  quarterlyRevenue,
  revenueByIndustry,
  revenueByPractice,
  revenueForecast,
} from "@/data/consulting/revenue";
import { clients } from "@/data/consulting/clients";
import { money } from "@/components/consulting/format";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const palette = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function RevenueOperations() {
  const lastWeek = weeklyRevenue[weeklyRevenue.length - 1];
  const prevWeek = weeklyRevenue[weeklyRevenue.length - 2];
  const wow = (((lastWeek.revenue - prevWeek.revenue) / prevWeek.revenue) * 100).toFixed(1);
  const mtd = monthlyRevenue[monthlyRevenue.length - 1];
  const qtd = quarterlyRevenue[quarterlyRevenue.length - 1];
  const ytd = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);

  const byClient = clients
    .map((c) => ({ name: c.name, value: c.arr / 1000 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Revenue Operations"
        description="Weekly, monthly, and quarterly revenue, broken down by client, industry, and practice."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Weekly Revenue" value={lastWeek.revenue / 1000} prefix="$" suffix="M" trend={Number(wow)} icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="MTD Revenue" value={mtd.revenue / 1000} prefix="$" suffix="M" subtitle={`Target ${money(mtd.target * 1000)}`} trend={9.4} icon={<TrendingUp className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="QTD Revenue" value={qtd.revenue / 1000} prefix="$" suffix="M" subtitle={`Margin ${qtd.margin}%`} trend={6.3} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="YTD Revenue" value={ytd / 1000} prefix="$" suffix="M" trend={14.8} icon={<Briefcase className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Weekly Revenue Trend" subtitle="Last 12 weeks ($K)" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyRevenue}>
              <defs>
                <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rev-area)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly vs Target" subtitle="Run-rate against quota">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}M`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${(v / 1000).toFixed(1)}M`, ""]} />
              <Bar dataKey="target" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} barSize={14} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quarterly Revenue & Margin" subtitle="Trailing 6 quarters">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={quarterlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}M`} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[20, 40]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Industry" subtitle="ARR mix ($K)" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByIndustry} layout="vertical" margin={{ top: 0, right: 16, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
              <YAxis type="category" dataKey="industry" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "ARR"]} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                {revenueByIndustry.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Practice" subtitle="$K">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByPractice}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="practice" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "Revenue"]} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Forecast (next 6 months)" subtitle="Base / Optimistic / Pessimistic" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}M`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="base" stroke="hsl(var(--primary))" strokeWidth={2.5} />
              <Line type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top accounts by ARR" subtitle="Top 8 ($K)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byClient} layout="vertical" margin={{ top: 0, right: 16, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "ARR"]} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

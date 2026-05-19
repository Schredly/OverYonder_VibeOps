import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, FileText, DollarSign, Activity, Users, Sparkles } from "lucide-react";
import { weeklyRevenue, marginTrend, customerHealthTrend } from "@/data/consulting/revenue";
import { engagements } from "@/data/consulting/engagements";
import { proposals } from "@/data/consulting/proposals";
import { consultants } from "@/data/consulting/consultants";
import { clients } from "@/data/consulting/clients";
import { money } from "@/components/consulting/format";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

export default function ExecutiveReporting() {
  const totalRevenue = engagements.reduce((s, e) => s + e.revenueRecognized, 0);
  const avgMargin = Math.round(engagements.reduce((s, e) => s + e.margin, 0) / engagements.length);
  const avgUtil = Math.round(consultants.reduce((s, c) => s + c.utilizationActual, 0) / consultants.length);
  const portfolioHealth = Math.round(clients.reduce((s, c) => s + c.healthScore, 0) / clients.length);
  const wonYTD = proposals.filter((p) => p.stage === "Closed Won").reduce((s, p) => s + p.value, 0);

  const insights = [
    {
      title: "Veridian wave 2 is the single biggest near-term lever",
      body: "Closing wave 2 ($3.1M, 80% probability) lifts Q3 base by 6%. Risk: Madrid integration could push timeline 2-3 weeks.",
      tone: "primary" as const,
    },
    {
      title: "Meridian adoption recovery is the top delivery risk to renewal",
      body: "Wave 2 adoption KPIs trail target. Renewal narrative depends on lifting weekly active to ≥60% by quarter end.",
      tone: "warning" as const,
    },
    {
      title: "Sentinel logistics workstream needs cleared staff",
      body: "Two cleared sub-contractors identified; client COO confirming sponsorship. Without resolution, August cutover slips.",
      tone: "danger" as const,
    },
    {
      title: "Quantum Tech is the highest-margin engagement of the quarter",
      body: "Optimization phase delivering 46% margin and 31% cost-per-call reduction. Pursue managed services renewal aggressively.",
      tone: "success" as const,
    },
  ];

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Executive Reporting"
        description="Boardroom-quality view of consulting performance — revenue, delivery, customer, and operational signals."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="mr-2 h-4 w-4" />
              Schedule board readout
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Recognized Revenue" value={totalRevenue / 1_000_000} prefix="$" suffix="M" trend={9.2} icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Avg Engagement Margin" value={avgMargin} suffix="%" trend={2.1} icon={<Activity className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Billable Utilization" value={avgUtil} suffix="%" trend={2} icon={<Users className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Portfolio Health" value={portfolioHealth} suffix="/100" subtitle={`Won YTD ${money(wonYTD)}`} trend={2} icon={<Sparkles className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Revenue trajectory" subtitle="Last 12 weeks ($K)" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyRevenue}>
              <defs>
                <linearGradient id="exec-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#exec-rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Margin trend" subtitle="Quarterly">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marginTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Margin"]} />
              <Bar dataKey="value" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Customer health trend" subtitle="Rolling portfolio average">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={customerHealthTrend}>
            <defs>
              <linearGradient id="exec-health" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--success))" strokeWidth={2.5} fill="url(#exec-health)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-base font-medium text-foreground">Strategic insights & recommendations</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Synthesized from delivery, financial, and customer signals.</p>
        </div>
        <ul className="divide-y divide-border">
          {insights.map((i, idx) => (
            <li key={idx} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium text-foreground">{i.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
                </div>
                <StatusBadge
                  label={
                    i.tone === "success"
                      ? "Tailwind"
                      : i.tone === "warning"
                        ? "Watch"
                        : i.tone === "danger"
                          ? "Escalation"
                          : "Lever"
                  }
                  tone={i.tone}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

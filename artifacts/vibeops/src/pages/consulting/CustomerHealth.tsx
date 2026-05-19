import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ChartCard from "@/components/dashboard/ChartCard";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import { Heart, TrendingUp, AlertTriangle, MessageSquare } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "wouter";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { customerHealthTrend } from "@/data/consulting/revenue";
import { engagementsForClient } from "@/data/consulting/engagements";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

function healthTone(score: number) {
  if (score >= 80) return "success";
  if (score >= 65) return "warning";
  return "danger";
}

// Derived sub-scores per client. Deterministic from the client's healthScore so
// the heatmap stays consistent across renders.
function subScores(score: number) {
  const skew = (offset: number) => Math.max(0, Math.min(100, score + offset));
  return {
    deliverySat: skew(-2),
    execEngagement: skew(4),
    renewalRisk: 100 - score, // inverted
    adoption: skew(-6),
    escalations: Math.max(0, 100 - score - 10),
    expansion: skew(2),
    sentiment: skew(0),
  };
}

const dimensions = [
  { key: "deliverySat", label: "Delivery Sat" },
  { key: "execEngagement", label: "Exec Engagement" },
  { key: "renewalRisk", label: "Renewal Risk" },
  { key: "adoption", label: "Adoption" },
  { key: "escalations", label: "Escalations" },
  { key: "expansion", label: "Expansion" },
  { key: "sentiment", label: "Sentiment" },
] as const;

export default function CustomerHealth() {
  const { clients: clientStore } = useConsultingData();
  const clients = clientStore.items;
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (tier && c.strategicTier !== tier) return false;
      return true;
    });
  }, [clients, search, tier]);

  const avg = Math.round(clients.reduce((s, c) => s + c.healthScore, 0) / clients.length);
  const atRisk = clients.filter((c) => c.healthScore < 70).length;
  const atRiskRenewals = clients.filter((c) => c.renewalRisk !== "Low").length;
  const champions = clients.reduce((s, c) => s + c.stakeholders.filter((st) => st.sentiment === "Champion").length, 0);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Customer Health"
        description="Strategic account health, satisfaction trends, renewal risk, and stakeholder sentiment."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Portfolio Health" value={avg} suffix="/100" trend={2} icon={<Heart className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Accounts < 70" value={atRisk} subtitle="Needs intervention" trend={1} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Renewal Risk" value={atRiskRenewals} subtitle="Medium or High" icon={<TrendingUp className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Champions" value={champions} subtitle="across portfolio" trend={4} icon={<MessageSquare className="h-5 w-5" />} delay={0.2} />
      </div>

      <ChartCard title="Portfolio Health Trend" subtitle="Rolling average across portfolio">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={customerHealthTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="score" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--card))", stroke: "hsl(var(--success))", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search accounts…"
        summary={`${filtered.length} of ${clients.length} accounts`}
        filters={
          <FilterSelect label="Tier" value={tier} onChange={setTier} options={["Platinum", "Gold", "Silver", "Emerging"]} />
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Account health heatmap</h3>
          <p className="mt-1 text-sm text-muted-foreground">Sub-scores derived from delivery, executive, and adoption signals.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="sticky left-0 bg-muted/40 p-3">Account</th>
                <th className="p-3 text-center">Score</th>
                {dimensions.map((d) => (
                  <th key={d.key} className="p-3 text-center text-xs">{d.label}</th>
                ))}
                <th className="p-3 text-center">Renewal Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const subs = subScores(c.healthScore);
                const engagementsCount = engagementsForClient(c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="sticky left-0 bg-card p-3">
                      <Link href={`/consulting/clients/${c.id}`} className="font-medium text-foreground hover:text-primary">
                        {c.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{engagementsCount} active</div>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge label={String(c.healthScore)} tone={healthTone(c.healthScore)} />
                    </td>
                    {dimensions.map((d) => {
                      const v = (subs as Record<string, number>)[d.key];
                      const lower = d.key === "renewalRisk" || d.key === "escalations";
                      const goodHigh = !lower;
                      const tone =
                        (goodHigh && v >= 80) || (!goodHigh && v <= 20)
                          ? "bg-success/10 text-success"
                          : (goodHigh && v >= 65) || (!goodHigh && v <= 40)
                            ? "bg-amber-100 text-amber-700"
                            : "bg-destructive/10 text-destructive";
                      return (
                        <td key={d.key} className="p-2 text-center">
                          <span className={cn("inline-flex h-8 w-12 items-center justify-center rounded-md text-xs font-semibold", tone)}>
                            {v}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <StatusBadge label={c.renewalRisk} tone={c.renewalRisk === "High" ? "danger" : c.renewalRisk === "Medium" ? "warning" : "success"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

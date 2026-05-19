import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Sparkles,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { engagementsForClient } from "@/data/consulting/engagements";
import { deliveryRisks } from "@/data/consulting/risks";
import { weeklyRevenue } from "@/data/consulting/revenue";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { money } from "@/components/consulting/format";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const sentimentTone = {
  Champion: "success",
  Supportive: "info",
  Neutral: "neutral",
  Detractor: "danger",
} as const;

export default function ClientDetail() {
  const [, params] = useRoute<{ id: string }>("/consulting/clients/:id");
  const { clients: clientStore } = useConsultingData();
  const client = useMemo(
    () => clientStore.items.find((c) => c.id === params?.id),
    [clientStore.items, params?.id],
  );

  if (!client) {
    return (
      <div className="space-y-4 p-8">
        <Link href="/consulting/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client Portfolio
          </Button>
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          Client not found.
        </div>
      </div>
    );
  }

  const engagements = engagementsForClient(client.id);
  const totalRevenue = engagements.reduce((s, e) => s + e.revenueRecognized, 0);
  const totalBudget = engagements.reduce((s, e) => s + e.budget, 0);
  const avgMargin = engagements.length
    ? Math.round(engagements.reduce((s, e) => s + e.margin, 0) / engagements.length)
    : 0;
  const risks = deliveryRisks.filter((r) => engagements.some((e) => e.id === r.engagementId));

  return (
    <div className="space-y-6 p-8 pb-20">
      <Link href="/consulting/clients">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Client Portfolio
        </Button>
      </Link>

      <PageHeader
        title={client.name}
        description={`${client.industry} · ${client.region} · Last executive review ${client.lastExecutiveReview}`}
        badges={
          <>
            <StatusBadge label={client.strategicTier} tone={client.strategicTier === "Platinum" ? "primary" : "warning"} />
            <StatusBadge label={`${client.aiMaturity} AI Maturity`} tone="info" />
            <StatusBadge
              label={`${client.deliveryRisk}`}
              tone={client.deliveryRisk === "Critical" ? "danger" : client.deliveryRisk === "At Risk" ? "warning" : "success"}
            />
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Run AI insights
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Schedule QBR
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="ARR" value={client.arr / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Health Score" value={client.healthScore} suffix="/100" trend={2} icon={<Activity className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Active Engagements" value={engagements.length} icon={<TrendingUp className="h-5 w-5" />} delay={0.15} />
        <KpiCard
          title="Expansion Opportunity"
          value={client.expansionOpportunity / 1_000_000}
          prefix="$"
          suffix="M"
          subtitle={`Renewal risk: ${client.renewalRisk}`}
          icon={<DollarSign className="h-5 w-5" />}
          delay={0.2}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="ai">AI Initiatives</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h3 className="text-base font-medium text-foreground">Account summary</h3>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <Detail label="Account owner" value={client.accountOwner} />
              <Detail label="Executive sponsor" value={client.executiveSponsor} />
              <Detail label="Region" value={client.region} />
              <Detail label="Industry" value={client.industry} />
              <Detail label="Strategic tier" value={client.strategicTier} />
              <Detail label="AI maturity" value={client.aiMaturity} />
              <Detail label="Renewal risk" value={client.renewalRisk} />
              <Detail label="Last exec review" value={client.lastExecutiveReview} />
            </dl>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-medium text-foreground">Engagement totals</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Total budget" value={money(totalBudget)} />
              <Detail label="Revenue recognized" value={money(totalRevenue)} />
              <Detail label="Avg margin" value={`${avgMargin}%`} />
              <Detail label="Open risks" value={String(risks.length)} />
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="engagements">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Engagement</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Phase</th>
                  <th className="p-3">Health</th>
                  <th className="p-3">Margin</th>
                  <th className="p-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {engagements.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/40">
                    <td className="p-3">
                      <Link href={`/consulting/engagements/${e.id}`} className="font-medium text-foreground hover:text-primary">
                        {e.name}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{e.type}</td>
                    <td className="p-3 text-muted-foreground">{e.phase}</td>
                    <td className="p-3">
                      <StatusBadge label={e.health} tone={e.health === "Critical" ? "danger" : e.health === "At Risk" ? "warning" : "success"} />
                    </td>
                    <td className="p-3 font-medium text-foreground">{e.margin}%</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{e.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {engagements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No active engagements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-foreground">Account revenue trend</h3>
                <p className="text-sm text-muted-foreground">Last 12 weeks ($K)</p>
              </div>
              <Badge className="bg-success/10 text-success hover:bg-success/15">+ {avgMargin}% margin</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyRevenue}>
                <defs>
                  <linearGradient id={`acc-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${v}K`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill={`url(#acc-${client.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="risks">
          <div className="space-y-3">
            {risks.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No open risks for this client. Nice.
              </div>
            )}
            {risks.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          r.severity === "Critical" ? "text-destructive" : r.severity === "High" ? "text-amber-500" : "text-muted-foreground"
                        }`}
                      />
                      <h4 className="font-medium text-foreground">{r.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.impact}</p>
                    <p className="mt-3 text-sm text-foreground"><span className="font-medium">Mitigation:</span> {r.mitigationPlan}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge label={r.severity} tone={r.severity === "Critical" ? "danger" : r.severity === "High" ? "warning" : "neutral"} />
                    <StatusBadge label={r.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stakeholders">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {client.stakeholders.map((s) => (
              <div key={s.name} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                    {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.role}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <StatusBadge label={s.sentiment} tone={sentimentTone[s.sentiment]} />
                </div>
              </div>
            ))}
            {client.stakeholders.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
                No stakeholders captured. Add executive sponsor, champions, and detractors to inform account strategy.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <PlaceholderTab
            icon={<Sparkles className="h-5 w-5 text-primary" />}
            title="AI Initiatives"
            body="Surfaces this client's AI use cases — pilots, scaled deployments, governed model registry, and adoption KPIs. Wired to the Programs and Engagements modules."
          />
        </TabsContent>

        <TabsContent value="assessments">
          <PlaceholderTab
            icon={<ClipboardCheck className="h-5 w-5 text-primary" />}
            title="Assessments"
            body="AI readiness, security posture, and operational readiness assessments tied to this account. Connects to the Assessments module on the enterprise side."
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-medium text-foreground">Activity timeline</h3>
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {engagements
                .flatMap((e) => e.activity.map((a) => ({ ...a, eng: e.name })))
                .sort((a, b) => (a.ts < b.ts ? 1 : -1))
                .slice(0, 12)
                .map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {a.ts} · {a.eng}
                    </div>
                    <div className="text-sm text-foreground">
                      <span className="font-medium">{a.actor}:</span> {a.message}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function PlaceholderTab({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <Button variant="outline" size="sm" className="mt-4">
        <Users className="mr-2 h-4 w-4" />
        Connect data source
      </Button>
    </div>
  );
}

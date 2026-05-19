import { Fragment } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Link } from "wouter";
import { engagements, type Engagement } from "@/data/consulting/engagements";
import { findClient } from "@/data/consulting/clients";
import { consultingTasks } from "@/data/consulting/tasks";
import { deliveryRisks } from "@/data/consulting/risks";
import { Activity, AlertTriangle, Clock, Target } from "lucide-react";
import { money } from "@/components/consulting/format";
import { cn } from "@/lib/utils";

const healthTone = {
  Healthy: "success",
  "At Risk": "warning",
  Critical: "danger",
} as const;

export default function DeliveryOperations() {
  const atRisk = engagements.filter((e) => e.health !== "Healthy");
  const slipped = engagements.flatMap((e) => e.milestones.filter((m) => m.status === "Slipped").map((m) => ({ e, m })));
  const blocked = consultingTasks.filter((t) => t.status === "Blocked");
  const escalated = deliveryRisks.filter((r) => r.status === "Escalated");

  const upcomingMilestones = engagements
    .flatMap((e) =>
      e.milestones
        .filter((m) => m.status !== "Done")
        .map((m) => ({ ...m, eng: e }))
    )
    .sort((a, b) => (a.due < b.due ? -1 : 1))
    .slice(0, 8);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Delivery Operations"
        description="PMO command center — at-risk engagements, slipped milestones, blocked work, and escalations across the portfolio."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Engagements" value={engagements.length} icon={<Activity className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="At Risk / Critical" value={atRisk.length} subtitle={`${escalated.length} escalated`} trend={2} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Slipped Milestones" value={slipped.length} icon={<Clock className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Blocked Tasks" value={blocked.length} subtitle="Across portfolio" icon={<Target className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card shadow-sm lg:col-span-2">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Engagements at risk</h3>
            <p className="mt-1 text-sm text-muted-foreground">Operational watchlist — sorted by health, then revenue.</p>
          </div>
          <div className="divide-y divide-border">
            {atRisk
              .sort((a, b) => (a.health === b.health ? b.revenueRecognized - a.revenueRecognized : a.health === "Critical" ? -1 : 1))
              .map((e) => <DeliveryRow key={e.id} e={e} />)}
            {atRisk.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No engagements are at risk right now.</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Open escalations</h3>
            <p className="mt-1 text-sm text-muted-foreground">Risks that need executive air cover.</p>
          </div>
          <div className="divide-y divide-border">
            {escalated.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{r.impact}</div>
                  </div>
                  <StatusBadge label={r.severity} tone={r.severity === "Critical" ? "danger" : "warning"} />
                </div>
              </div>
            ))}
            {escalated.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No active escalations.</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Upcoming milestones</h3>
          </div>
          <ul className="divide-y divide-border">
            {upcomingMilestones.map((m, i) => (
              <li key={i} className="flex items-center justify-between p-4">
                <div>
                  <Link href={`/consulting/engagements/${m.eng.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                    {m.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {m.eng.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{m.due}</span>
                  <StatusBadge label={m.status} tone={m.status === "Slipped" ? "danger" : m.status === "At Risk" ? "warning" : "info"} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Blocked work</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tasks waiting on a dependency or client.</p>
          </div>
          <ul className="divide-y divide-border">
            {blocked.map((t) => (
              <li key={t.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    {t.blocker && <div className="mt-1 text-xs text-muted-foreground">Blocker: {t.blocker}</div>}
                  </div>
                  <StatusBadge label={t.priority} tone={t.priority === "Critical" ? "danger" : "warning"} />
                </div>
              </li>
            ))}
            {blocked.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Nothing blocked. Clean board.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Delivery risk heatmap</h3>
          <p className="mt-1 text-sm text-muted-foreground">Severity × likelihood across open delivery risks.</p>
        </div>
        <div className="p-6">
          <RiskHeatmap />
        </div>
      </div>
    </div>
  );
}

function DeliveryRow({ e }: { e: Engagement }) {
  const client = findClient(e.clientId);
  return (
    <div className="flex items-center justify-between p-6 hover:bg-muted/40">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/consulting/engagements/${e.id}`} className="font-medium text-foreground hover:text-primary">
            {e.name}
          </Link>
          <StatusBadge label={e.phase} />
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {client?.name} · DM owns {e.riskCount} open risk{e.riskCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">{money(e.revenueRecognized)}</div>
          <div className="text-xs text-muted-foreground">recognized</div>
        </div>
        <StatusBadge label={e.health} tone={healthTone[e.health]} />
      </div>
    </div>
  );
}

const severities = ["Low", "Medium", "High", "Critical"] as const;
const likelihoods = ["Unlikely", "Possible", "Likely", "Almost Certain"] as const;

function RiskHeatmap() {
  const counts: Record<string, number> = {};
  deliveryRisks.forEach((r) => {
    const key = `${r.severity}::${r.likelihood}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  const cellColor = (sev: string, like: string) => {
    const sevWeight = severities.indexOf(sev as any);
    const likeWeight = likelihoods.indexOf(like as any);
    const score = sevWeight * likeWeight;
    if (score >= 6) return "bg-destructive/15 text-destructive";
    if (score >= 3) return "bg-amber-100 text-amber-700";
    return "bg-success/10 text-success";
  };
  return (
    <div className="inline-block">
      <div className="grid grid-cols-[140px_repeat(4,minmax(0,1fr))] gap-2 text-xs">
        <div />
        {likelihoods.map((l) => (
          <div key={l} className="px-2 py-1 text-center font-medium text-muted-foreground">{l}</div>
        ))}
        {[...severities].reverse().map((sev) => (
          <Fragment key={sev}>
            <div className="px-2 py-3 font-medium text-muted-foreground">{sev}</div>
            {likelihoods.map((like) => {
              const count = counts[`${sev}::${like}`] ?? 0;
              return (
                <div
                  key={`${sev}-${like}`}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-md text-sm font-semibold",
                    count > 0 ? cellColor(sev, like) : "bg-muted text-muted-foreground",
                  )}
                >
                  {count > 0 ? count : "·"}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

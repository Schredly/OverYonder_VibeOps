import { Link, useRoute } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Activity, Users, AlertTriangle, Sparkles, Clock } from "lucide-react";
import { findEngagement } from "@/data/consulting/engagements";
import { findClient } from "@/data/consulting/clients";
import { consultants } from "@/data/consulting/consultants";
import { consultingTasks } from "@/data/consulting/tasks";
import { deliveryRisks } from "@/data/consulting/risks";
import { money } from "@/components/consulting/format";
import { cn } from "@/lib/utils";

const milestoneTone = {
  Done: "success",
  "On Track": "info",
  "At Risk": "warning",
  Slipped: "danger",
} as const;

const deliverableTone = {
  Draft: "neutral",
  "In Review": "info",
  Approved: "success",
  Delivered: "success",
} as const;

export default function EngagementDetail() {
  const [, params] = useRoute<{ id: string }>("/consulting/engagements/:id");
  const engagement = params ? findEngagement(params.id) : undefined;

  if (!engagement) {
    return (
      <div className="space-y-4 p-8">
        <Link href="/consulting/engagements">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to Engagements</Button>
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          Engagement not found.
        </div>
      </div>
    );
  }

  const client = findClient(engagement.clientId);
  const team = consultants.filter((c) => engagement.teamIds.includes(c.id));
  const dm = consultants.find((c) => c.id === engagement.deliveryManagerId);
  const tasks = consultingTasks.filter((t) => t.engagementId === engagement.id);
  const risks = deliveryRisks.filter((r) => r.engagementId === engagement.id);
  const billUsed = engagement.revenueRecognized;
  const burnPct = Math.round((billUsed / engagement.budget) * 100);

  return (
    <div className="space-y-6 p-8 pb-20">
      <Link href="/consulting/engagements">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Engagements
        </Button>
      </Link>

      <PageHeader
        title={engagement.name}
        description={
          <>
            <Link href={`/consulting/clients/${engagement.clientId}`} className="text-primary hover:underline">
              {client?.name}
            </Link>{" "}
            · {engagement.type} · {engagement.phase} · {engagement.startDate} → {engagement.endDate}
          </>
        }
        badges={
          <>
            <StatusBadge label={engagement.phase} tone="primary" />
            <StatusBadge label={engagement.health} tone={engagement.health === "Critical" ? "danger" : engagement.health === "At Risk" ? "warning" : "success"} />
            <StatusBadge label={`${engagement.progress}% complete`} tone="info" />
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Status update
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Schedule steering</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Budget" value={engagement.budget / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Revenue Recognized" value={engagement.revenueRecognized / 1_000_000} prefix="$" suffix="M" subtitle={`${burnPct}% of budget`} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Margin" value={engagement.margin} suffix="%" trend={2} icon={<Activity className="h-5 w-5" />} delay={0.15} trendType={engagement.margin >= 30 ? "good" : "bad"} />
        <KpiCard title="Open Risks" value={engagement.riskCount} subtitle={`${team.length} on team`} icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & Milestones</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="linked">Linked</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h3 className="text-base font-medium text-foreground">Executive summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{engagement.executiveSummary}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Detail label="Delivery Manager" value={dm?.name ?? "Unassigned"} />
              <Detail label="Engagement Type" value={engagement.type} />
              <Detail label="Phase" value={engagement.phase} />
              <Detail label="Health" value={engagement.health} />
              <Detail label="AI Platforms" value={engagement.aiPlatforms.join(", ")} />
              <Detail label="Applications" value={engagement.applications.join(", ")} />
            </dl>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-medium text-foreground">Burn & margin</h3>
            <div className="mt-4 space-y-4">
              <BurnRow label="Budget used" value={burnPct} accent="primary" />
              <BurnRow label="Schedule used" value={engagement.progress} accent="success" />
            </div>
            <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {engagement.progress > burnPct + 10
                ? "Tracking ahead of burn — margin tailwind."
                : burnPct > engagement.progress + 10
                  ? "Burning faster than progress — margin watch."
                  : "Burn ≈ schedule. Steady."}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-medium text-foreground">Milestones</h3>
            <ol className="mt-4 space-y-4">
              {engagement.milestones.map((m, i) => (
                <li key={i} className="flex items-center justify-between rounded-md border border-border bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
                        m.status === "Done"
                          ? "border-success bg-success/10 text-success"
                          : m.status === "Slipped"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : m.status === "At Risk"
                              ? "border-amber-500 bg-amber-50 text-amber-600"
                              : "border-primary/40 bg-primary/10 text-primary",
                      )}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{m.name}</div>
                      <div className="text-xs text-muted-foreground">Due {m.due}</div>
                    </div>
                  </div>
                  <StatusBadge label={m.status} tone={milestoneTone[m.status]} />
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FinancialCard label="Budget" value={money(engagement.budget)} />
          <FinancialCard label="Revenue Recognized" value={money(engagement.revenueRecognized)} sub={`${burnPct}% of budget`} />
          <FinancialCard label="Margin" value={`${engagement.margin}%`} sub={engagement.margin >= 30 ? "Above target" : "Below target"} />
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {c.initials}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.level} · {c.practice}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Util: {c.utilizationActual}% / {c.utilizationTarget}%</span>
                  <span>${c.billRate}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks">
          {risks.length === 0 ? (
            <EmptyTab text="No open risks. Bank it." />
          ) : (
            <div className="space-y-3">
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
          )}
        </TabsContent>

        <TabsContent value="deliverables">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Deliverable</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {engagement.deliverables.map((d) => (
                  <tr key={d.name} className="hover:bg-muted/40">
                    <td className="p-3 font-medium text-foreground">{d.name}</td>
                    <td className="p-3 text-muted-foreground">{d.owner}</td>
                    <td className="p-3 text-muted-foreground">{d.due}</td>
                    <td className="p-3"><StatusBadge label={d.status} tone={deliverableTone[d.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Task</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Hrs (act/est)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="p-3 font-medium text-foreground">{t.name}</td>
                    <td className="p-3 text-muted-foreground">{consultants.find((c) => c.id === t.ownerId)?.name}</td>
                    <td className="p-3"><StatusBadge label={t.status} /></td>
                    <td className="p-3"><StatusBadge label={t.priority} tone={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "neutral"} /></td>
                    <td className="p-3 text-muted-foreground">{t.dueDate}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{t.actualHours} / {t.estimatedHours}</td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No tasks tracked.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="linked" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LinkedCard
            title="Linked approvals"
            body="Steering, change orders, and CXO approvals tied to this engagement."
            count={2}
            href="/approvals"
          />
          <LinkedCard
            title="Linked assessments"
            body="AI readiness, security, and adoption assessments scoped to this client."
            count={1}
            href="/assessments"
          />
          <LinkedCard
            title="Linked applications"
            body={`Apps in scope: ${engagement.applications.join(", ")}`}
            count={engagement.applications.length}
            href="/applications"
          />
          <LinkedCard
            title="AI platforms in use"
            body={engagement.aiPlatforms.join(", ")}
            count={engagement.aiPlatforms.length}
            href="/control-tower"
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-medium text-foreground">Activity feed</h3>
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {engagement.activity.map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {a.ts}
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

function BurnRow({ label, value, accent }: { label: string; value: number; accent: "primary" | "success" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", accent === "primary" ? "bg-primary" : "bg-success")} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function FinancialCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function LinkedCard({ title, body, count, href }: { title: string; body: string; count: number; href: string }) {
  return (
    <Link href={href}>
      <div className="cursor-pointer rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{count}</div>
        </div>
      </div>
    </Link>
  );
}

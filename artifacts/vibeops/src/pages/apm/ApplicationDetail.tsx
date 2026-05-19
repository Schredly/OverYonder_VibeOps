import { useMemo, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Activity, Wrench, Users, Sparkles, Clock, Plus } from "lucide-react";
import CreateRecordDialog from "@/components/consulting/CreateRecordDialog";
import RecordFormDialog from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import AiReadinessDrawer from "@/components/apm/AiReadinessDrawer";
import AssessmentsPanel from "@/components/apm/AssessmentsPanel";
import {
  applicationEditFields,
  applicationInitialValues,
  applicationPatch,
} from "@/components/apm/applicationForm";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { findCapability } from "@/data/apm/capabilities";
import { findTechnology } from "@/data/apm/technologies";
import { findPerson, internalUsers, consultants as allConsultants } from "@/data/apm/people";
import { projectsForApplication } from "@/data/apm/projects";
import { APM_TASK_STATUSES } from "@/data/apm/tasks";
import { certificationCampaigns } from "@/data/apm/certifications";
import { money } from "@/components/consulting/format";
import {
  dispositionTone,
  criticalityTone,
  riskTone,
  lifecycleTone,
  certTone,
  healthBarColor,
} from "@/components/apm/tone";

const serviceTone = {
  Operational: "success",
  Degraded: "warning",
  Down: "danger",
  Planned: "info",
} as const;

const sensitivityTone = {
  Public: "neutral",
  Internal: "info",
  Confidential: "warning",
  Restricted: "danger",
} as const;

export default function ApplicationDetail() {
  const [, params] = useRoute<{ id: string }>("/applications/:id");
  const { applications: appStore, tasks: taskStore, risks: riskStore } = useApmData();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const app = useMemo(
    () => appStore.items.find((a) => a.id === params?.id),
    [appStore.items, params?.id],
  );

  if (!app) {
    return (
      <div className="space-y-4 p-8">
        <Link href="/applications">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to Application Portfolio</Button>
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          Application not found.
        </div>
      </div>
    );
  }

  const owner = findPerson(app.ownerId);
  const consultants = app.consultantIds.map((id) => findPerson(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const projects = projectsForApplication(app.id);
  const tasks = taskStore.items.filter((t) => t.scope.type === "application" && t.scope.id === app.id);
  const risks = riskStore.items.filter((r) => r.scope.type === "application" && r.scope.id === app.id);
  const certs = certificationCampaigns
    .map((c) => ({ campaign: c, att: c.attestations.find((a) => a.appId === app.id) }))
    .filter((x) => x.att);

  const handleEditSubmit = (values: Record<string, string>) => {
    appStore.update(app.id, applicationPatch(values, app));
    toast({ title: "Application updated", description: `${values.name || app.name} saved.` });
    setEditOpen(false);
  };

  const handleDelete = () => {
    appStore.remove(app.id);
    toast({ title: "Application deleted", description: `${app.name} was removed from the portfolio.` });
    navigate("/applications");
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <Link href="/applications">
        <Button variant="ghost" size="sm" className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" />Back to Application Portfolio</Button>
      </Link>

      <PageHeader
        title={app.name}
        description={`${app.businessUnit} · ${app.vendor} · ${app.hostingModel} · ${app.userCount.toLocaleString()} users`}
        badges={
          <>
            <StatusBadge label={app.lifecycleStage} tone={lifecycleTone[app.lifecycleStage]} />
            <StatusBadge label={app.businessCriticality} tone={criticalityTone[app.businessCriticality]} />
            <StatusBadge label={app.disposition} tone={dispositionTone[app.disposition]} />
            <StatusBadge label={`${app.certStatus} cert`} tone={certTone[app.certStatus]} />
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />AI readiness
            </Button>
            <CreateRecordDialog
              title="New Task"
              description={`Assign work for ${app.name} to an internal user or an external consultant.`}
              submitLabel="Create task"
              fields={[
                { name: "name", label: "Task name", required: true },
                { name: "assignee", label: "Assign to", type: "select", required: true, options: [...internalUsers.map((u) => `${u.name} (internal)`), ...allConsultants.map((c) => `${c.name} (consultant)`)] },
                { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
                { name: "status", label: "Status", type: "select", options: APM_TASK_STATUSES as unknown as string[] },
                { name: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
                { name: "estimatedHours", label: "Estimated hours", type: "number" },
              ]}
              trigger={
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />Assign Task
                </Button>
              }
            />
            <RowActions
              entityName={app.name}
              entityKind="application"
              onEdit={() => setEditOpen(true)}
              onDelete={handleDelete}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Annual Cost" value={app.annualCost / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Health Score" value={app.healthScore} suffix="/100" icon={<Activity className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Tech Debt" value={app.techDebtScore} suffix="/100" trendType="bad" icon={<Wrench className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Open Risks" value={risks.filter((r) => r.status !== "Closed").length} subtitle={`${consultants.length} consultants with access`} icon={<Users className="h-5 w-5" />} delay={0.2} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap bg-muted">
          {["overview", "capabilities", "services", "technologies", "integrations", "data", "risks", "assessments", "certifications", "projects", "tasks", "consultants", "activity"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h3 className="text-base font-medium text-foreground">Overview</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{app.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Detail label="Internal owner" value={owner ? `${owner.name} — ${owner.role}` : "Unassigned"} />
              <Detail label="Business unit" value={app.businessUnit} />
              <Detail label="Lifecycle stage" value={app.lifecycleStage} />
              <Detail label="Business criticality" value={app.businessCriticality} />
              <Detail label="Disposition" value={app.disposition} />
              <Detail label="Hosting" value={app.hostingModel} />
              <Detail label="Cloud readiness" value={app.cloudReadiness} />
              <Detail label="AI readiness" value={app.aiReadiness} />
              <Detail label="Vendor" value={app.vendor} />
              <Detail label="Users" value={app.userCount.toLocaleString()} />
            </dl>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="text-base font-medium text-foreground">Health</h3>
              <div className="mt-4 space-y-3">
                <Meter label="Health score" value={app.healthScore} good />
                <Meter label="Tech debt" value={app.techDebtScore} good={false} />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="text-base font-medium text-foreground">Access</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Owned internally by <span className="font-medium text-foreground">{owner?.name}</span>.
                {consultants.length > 0
                  ? ` ${consultants.length} external consultant${consultants.length === 1 ? "" : "s"} granted scoped access.`
                  : " No external consultant access granted."}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <CardList
            items={app.capabilityIds.map((id) => findCapability(id)).filter(Boolean).map((c) => ({
              title: c!.name,
              sub: c!.description,
            }))}
            empty="No capabilities mapped."
          />
        </TabsContent>

        <TabsContent value="services">
          <SimpleTable
            head={["Service", "Status"]}
            rows={app.services.map((s) => [s.name, <StatusBadge key={s.name} label={s.status} tone={serviceTone[s.status]} />])}
            empty="No application services defined."
          />
        </TabsContent>

        <TabsContent value="technologies">
          <SimpleTable
            head={["Technology", "Category", "Standard", "Lifecycle"]}
            rows={app.technologyIds.map((id) => findTechnology(id)).filter(Boolean).map((t) => [
              <Link key={t!.id} href="/technology" className="font-medium text-foreground hover:text-primary">{t!.name}</Link>,
              t!.category,
              <StatusBadge key={`s-${t!.id}`} label={t!.standardStatus} tone={t!.standardStatus === "Approved" ? "success" : t!.standardStatus === "Retired" ? "danger" : "warning"} />,
              <StatusBadge key={`l-${t!.id}`} label={t!.lifecycleStatus} tone={/End of/.test(t!.lifecycleStatus) ? "danger" : t!.lifecycleStatus === "Declining" ? "warning" : "success"} />,
            ])}
            empty="No technologies recorded."
          />
        </TabsContent>

        <TabsContent value="integrations">
          <SimpleTable
            head={["Integration", "Direction", "Target", "Type"]}
            rows={app.integrations.map((i) => [i.name, i.direction, i.target, i.type])}
            empty="No integrations recorded."
          />
        </TabsContent>

        <TabsContent value="data">
          <SimpleTable
            head={["Data object", "Sensitivity"]}
            rows={app.dataObjects.map((d) => [d.name, <StatusBadge key={d.name} label={d.sensitivity} tone={sensitivityTone[d.sensitivity]} />])}
            empty="No data objects classified."
          />
        </TabsContent>

        <TabsContent value="risks">
          {risks.length === 0 ? (
            <Empty text="No risks raised against this application." />
          ) : (
            <div className="space-y-3">
              {risks.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-foreground">{r.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{r.impact}</p>
                      <p className="mt-2 text-sm text-foreground"><span className="font-medium">Mitigation:</span> {r.mitigationPlan}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge label={r.severity} tone={riskTone[r.severity]} />
                      <StatusBadge label={r.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsPanel app={app} />
        </TabsContent>

        <TabsContent value="certifications">
          {certs.length === 0 ? (
            <Empty text="This application is not in any active certification campaign." />
          ) : (
            <SimpleTable
              head={["Campaign", "Type", "Status", "Owner"]}
              rows={certs.map(({ campaign, att }) => [
                <Link key={campaign.id} href="/certifications" className="font-medium text-foreground hover:text-primary">{campaign.name}</Link>,
                campaign.type,
                <StatusBadge key={`st-${campaign.id}`} label={att!.status} tone={certTone[att!.status]} />,
                findPerson(att!.ownerId)?.name ?? "—",
              ])}
              empty=""
            />
          )}
        </TabsContent>

        <TabsContent value="projects">
          {projects.length === 0 ? (
            <Empty text="No modernization or migration projects target this application." />
          ) : (
            <SimpleTable
              head={["Project", "Type", "Status", "Progress"]}
              rows={projects.map((p) => [
                <Link key={p.id} href={`/projects/${p.id}`} className="font-medium text-foreground hover:text-primary">{p.name}</Link>,
                p.type,
                <StatusBadge key={`st-${p.id}`} label={p.status} />,
                `${p.progress}%`,
              ])}
              empty=""
            />
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {tasks.length === 0 ? (
            <Empty text="No tasks scoped to this application. Use Assign Task to add one." />
          ) : (
            <SimpleTable
              head={["Task", "Assignee", "Status", "Priority", "Due"]}
              rows={tasks.map((t) => {
                const p = findPerson(t.assigneeId);
                return [
                  t.name,
                  <span key={`a-${t.id}`}>
                    {p?.name} <span className="text-xs text-muted-foreground">({p?.type})</span>
                  </span>,
                  <StatusBadge key={`s-${t.id}`} label={t.status} />,
                  <StatusBadge key={`p-${t.id}`} label={t.priority} tone={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "neutral"} />,
                  t.dueDate,
                ];
              })}
              empty=""
            />
          )}
        </TabsContent>

        <TabsContent value="consultants">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {consultants.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{c.initials}</div>
                  <div>
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.role} · {c.firm}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <StatusBadge label="Scoped access" tone="info" />
                  <span className="text-muted-foreground">${c.billRate}/hr</span>
                </div>
              </div>
            ))}
            {consultants.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <Empty text="No external consultants have been granted access to this application." />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-medium text-foreground">Activity feed</h3>
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {[...tasks]
                .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
                .map((t) => {
                  const p = findPerson(t.assigneeId);
                  return (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> due {t.dueDate}
                      </div>
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{p?.name}</span> — {t.name} ({t.status})
                      </div>
                    </li>
                  );
                })}
              {tasks.length === 0 && <li className="text-sm text-muted-foreground">No recorded activity yet.</li>}
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      <RecordFormDialog
        title={`Edit — ${app.name}`}
        description="Update core application attributes. Technologies, integrations, and assessments are managed in the tabs above."
        submitLabel="Save changes"
        fields={applicationEditFields}
        initialValues={applicationInitialValues(app)}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
      />

      <AiReadinessDrawer app={app} open={aiOpen} onOpenChange={setAiOpen} />
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

function Meter({ label, value, good }: { label: string; value: number; good: boolean }) {
  const color = good ? healthBarColor(value) : healthBarColor(100 - value);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}/100</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function CardList({ items, empty }: { items: { title: string; sub: string }[]; empty: string }) {
  if (items.length === 0) return <Empty text={empty} />;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="font-medium text-foreground">{it.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{it.sub}</div>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (rows.length === 0) return <Empty text={empty} />;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/40">
              {r.map((cell, j) => <td key={j} className="p-3 text-foreground">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Activity, AlertTriangle, Users } from "lucide-react";
import RecordFormDialog from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import { projectFields, projectInitialValues, projectPatch } from "@/components/apm/projectForm";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { wavesForProject } from "@/data/apm/migrations";
import { findApplication } from "@/data/apm/applications";
import { findPerson } from "@/data/apm/people";
import { money } from "@/components/consulting/format";
import { riskTone } from "@/components/apm/tone";

const wsTone = { "Not Started": "neutral", "In Progress": "info", Blocked: "danger", Complete: "success" } as const;
const msTone = { Done: "success", "On Track": "info", "At Risk": "warning", Slipped: "danger" } as const;
const healthTone = { Healthy: "success", "At Risk": "warning", Critical: "danger" } as const;

export default function ProjectDetail() {
  const [, params] = useRoute<{ id: string }>("/projects/:id");
  const { projects: projectStore, tasks: taskStore, risks: riskStore } = useApmData();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const project = params ? projectStore.items.find((p) => p.id === params.id) : undefined;

  if (!project) {
    return (
      <div className="space-y-4 p-8">
        <Link href="/projects">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back to Modernization Projects</Button>
        </Link>
        <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
          Project not found.
        </div>
      </div>
    );
  }

  const lead = findPerson(project.internalLeadId);
  const waves = wavesForProject(project.id);
  const tasks = taskStore.items.filter((t) => t.scope.type === "project" && t.scope.id === project.id);
  const risks = riskStore.items.filter((r) => r.scope.type === "project" && r.scope.id === project.id);
  const team = [project.internalLeadId, ...project.consultantIds].map((id) => findPerson(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const burnPct = project.budget ? Math.round((project.spend / project.budget) * 100) : 0;

  const handleEditSubmit = (values: Record<string, string>) => {
    projectStore.update(project.id, projectPatch(values, project));
    toast({ title: "Project updated", description: `${values.name || project.name} saved.` });
    setEditOpen(false);
  };

  const handleDelete = () => {
    projectStore.remove(project.id);
    toast({ title: "Project deleted", description: `${project.name} was removed.` });
    navigate("/projects");
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="-ml-2"><ArrowLeft className="mr-2 h-4 w-4" />Back to Modernization Projects</Button>
      </Link>

      <PageHeader
        title={project.name}
        description={`${project.type} · Lead ${lead?.name} · ${project.startDate} → ${project.endDate}`}
        badges={
          <>
            <StatusBadge label={project.status} tone="primary" />
            <StatusBadge label={project.health} tone={healthTone[project.health]} />
            <StatusBadge label={`${project.progress}% complete`} tone="info" />
          </>
        }
        actions={
          <>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Status update</Button>
            <RowActions
              entityName={project.name}
              entityKind="project"
              onEdit={() => setEditOpen(true)}
              onDelete={handleDelete}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Budget" value={project.budget / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Spend" value={project.spend / 1_000_000} prefix="$" suffix="M" subtitle={`${burnPct}% of budget`} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Progress" value={project.progress} suffix="%" icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Open Risks" value={risks.filter((r) => r.status !== "Closed").length} subtitle={`${team.length} on team`} icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workstreams">Workstreams</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="waves">Migration Waves</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h3 className="text-base font-medium text-foreground">Project summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{project.description}</p>
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applications in scope</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.applicationIds.length === 0 && <span className="text-sm text-muted-foreground">Portfolio-wide</span>}
                {project.applicationIds.map((id) => (
                  <Link key={id} href={`/applications/${id}`} className="rounded-md bg-muted px-2 py-1 text-xs text-foreground hover:text-primary">
                    {findApplication(id)?.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-medium text-foreground">Budget burn</h3>
            <div className="mt-4 space-y-3">
              <Bar label="Budget used" value={burnPct} accent="primary" />
              <Bar label="Schedule complete" value={project.progress} accent="success" />
            </div>
            <div className="mt-5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {project.progress > burnPct + 8
                ? "Ahead of burn — healthy margin."
                : burnPct > project.progress + 8
                  ? "Burning ahead of progress — watch budget."
                  : "Burn tracks schedule."}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workstreams">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="space-y-4">
              {project.workstreams.map((w) => (
                <div key={w.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{w.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Lead: {findPerson(w.leadId)?.name}</span>
                      <StatusBadge label={w.status} tone={wsTone[w.status]} />
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${w.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr><th className="p-3">Milestone</th><th className="p-3">Due</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {project.milestones.map((m) => (
                  <tr key={m.name} className="hover:bg-muted/40">
                    <td className="p-3 font-medium text-foreground">{m.name}</td>
                    <td className="p-3 text-muted-foreground">{m.due}</td>
                    <td className="p-3"><StatusBadge label={m.status} tone={msTone[m.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="waves">
          {waves.length === 0 ? (
            <Empty text="No migration waves under this project." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                  <tr><th className="p-3">Wave</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Progress</th><th className="p-3">Owner</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {waves.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/40">
                      <td className="p-3">
                        <Link href="/migrations" className="font-medium text-foreground hover:text-primary">{w.name}</Link>
                      </td>
                      <td className="p-3 text-muted-foreground">{w.type}</td>
                      <td className="p-3"><StatusBadge label={w.status} /></td>
                      <td className="p-3 text-muted-foreground">{w.progress}%</td>
                      <td className="p-3 text-muted-foreground">{findPerson(w.ownerId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {tasks.length === 0 ? (
            <Empty text="No tasks scoped to this project." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                  <tr><th className="p-3">Task</th><th className="p-3">Assignee</th><th className="p-3">Status</th><th className="p-3">Priority</th><th className="p-3">Due</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((t) => {
                    const p = findPerson(t.assigneeId);
                    return (
                      <tr key={t.id} className="hover:bg-muted/40">
                        <td className="p-3 font-medium text-foreground">{t.name}</td>
                        <td className="p-3 text-muted-foreground">{p?.name} <span className="text-xs">({p?.type})</span></td>
                        <td className="p-3"><StatusBadge label={t.status} /></td>
                        <td className="p-3"><StatusBadge label={t.priority} tone={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "neutral"} /></td>
                        <td className="p-3 text-muted-foreground">{t.dueDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {team.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{p.initials}</div>
                  <div>
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.role}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <StatusBadge label={p.type === "internal" ? "Internal" : `Consultant · ${p.firm}`} tone={p.type === "internal" ? "info" : "primary"} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks">
          {risks.length === 0 ? (
            <Empty text="No risks raised against this project." />
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
      </Tabs>

      <RecordFormDialog
        title={`Edit — ${project.name}`}
        description="Update core project attributes."
        submitLabel="Save changes"
        fields={projectFields}
        initialValues={projectInitialValues(project)}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

function Bar({ label, value, accent }: { label: string; value: number; accent: "primary" | "success" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${accent === "primary" ? "bg-primary" : "bg-success"}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

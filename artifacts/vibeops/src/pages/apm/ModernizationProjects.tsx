import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import {
  projectFields,
  projectInitialValues,
  projectPatch,
  newProject,
} from "@/components/apm/projectForm";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, AlertTriangle, Activity } from "lucide-react";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { PROJECT_TYPES } from "@/data/apm/projects";
import { findApplication } from "@/data/apm/applications";
import { findPerson } from "@/data/apm/people";
import { money } from "@/components/consulting/format";
import { cn } from "@/lib/utils";

const healthTone = { Healthy: "success", "At Risk": "warning", Critical: "danger" } as const;
const wsTone = { "Not Started": "neutral", "In Progress": "info", Blocked: "danger", Complete: "success" } as const;

export default function ModernizationProjects() {
  const { projects: projectStore } = useApmData();
  const projects = projectStore.items;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const editing = projects.find((p) => p.id === editId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (type && p.type !== type) return false;
      if (status && p.status !== status) return false;
      return true;
    });
  }, [projects, search, type, status]);

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpend = projects.reduce((s, p) => s + p.spend, 0);
  const atRisk = projects.filter((p) => p.health !== "Healthy").length;
  const inFlight = projects.filter((p) => p.status === "In Progress" || p.status === "At Risk").length;

  const handleCreate = (values: Record<string, string>) => {
    const project = newProject(values);
    projectStore.add(project);
    toast({ title: "Project created", description: `${project.name} added to the modernization portfolio.` });
  };

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    projectStore.update(editing.id, projectPatch(values, editing));
    toast({ title: "Project updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Modernization Projects"
        description="Cloud migration, AI upgrade, rationalization, tech-debt, and certification programs across the portfolio."
        actions={
          <RecordFormDialog
            title="New Modernization Project"
            description="Create a project tied to applications or capabilities. Workstreams and milestones can be added after."
            submitLabel="Create project"
            fields={projectFields}
            onSubmit={handleCreate}
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />New Project
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Projects" value={projects.length} subtitle={`${inFlight} in flight`} icon={<TrendingUp className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Total Budget" value={totalBudget / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Spend to Date" value={totalSpend / 1_000_000} prefix="$" suffix="M" subtitle={totalBudget ? `${Math.round((totalSpend / totalBudget) * 100)}% of budget` : undefined} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="At Risk" value={atRisk} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search projects…"
        summary={`${filtered.length} of ${projects.length} projects`}
        filters={
          <>
            <FilterSelect label="Type" value={type} onChange={setType} options={PROJECT_TYPES} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={["Proposed", "Planning", "In Progress", "At Risk", "On Hold", "Complete"]} />
          </>
        }
      />

      <div className="space-y-4">
        {filtered.map((p) => {
          const lead = findPerson(p.internalLeadId);
          const burnPct = p.budget ? Math.round((p.spend / p.budget) * 100) : 0;
          return (
            <div key={p.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/projects/${p.id}`} className="text-lg font-medium text-foreground hover:text-primary">
                      {p.name}
                    </Link>
                    <StatusBadge label={p.type} tone="info" />
                    <StatusBadge label={p.status} />
                    <StatusBadge label={p.health} tone={healthTone[p.health]} />
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">Lead:</span> {lead?.name}</span>
                    <span><span className="font-medium text-foreground">Consultants:</span> {p.consultantIds.length}</span>
                    <span>{p.startDate} → {p.endDate}</span>
                    <span>
                      <span className="font-medium text-foreground">Apps:</span>{" "}
                      {p.applicationIds.map((id) => findApplication(id)?.name).filter(Boolean).join(", ") || "Portfolio-wide"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="grid grid-cols-3 gap-4 text-right">
                    <Stat label="Budget" value={money(p.budget)} />
                    <Stat label="Spend" value={`${money(p.spend)} · ${burnPct}%`} />
                    <Stat label="Progress" value={`${p.progress}%`} />
                  </div>
                  <RowActions
                    entityName={p.name}
                    entityKind="project"
                    onView={() => navigate(`/projects/${p.id}`)}
                    onEdit={() => setEditId(p.id)}
                    onDelete={() => {
                      projectStore.remove(p.id);
                      toast({ title: "Project deleted", description: `${p.name} was removed.` });
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-border bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workstreams</div>
                  <div className="mt-3 space-y-3">
                    {p.workstreams.map((w) => (
                      <div key={w.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{w.name}</span>
                          <StatusBadge label={w.status} tone={wsTone[w.status]} />
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${w.progress}%` }} />
                        </div>
                      </div>
                    ))}
                    {p.workstreams.length === 0 && <div className="text-sm text-muted-foreground">No workstreams yet.</div>}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Milestones</div>
                  <ul className="mt-3 space-y-2">
                    {p.milestones.map((m) => (
                      <li key={m.name} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{m.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{m.due}</span>
                          <StatusBadge
                            label={m.status}
                            tone={m.status === "Done" ? "success" : m.status === "Slipped" ? "danger" : m.status === "At Risk" ? "warning" : "info"}
                          />
                        </span>
                      </li>
                    ))}
                    {p.milestones.length === 0 && <li className="text-sm text-muted-foreground">No milestones yet.</li>}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No projects match the current filters.
          </div>
        )}
      </div>

      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          description="Update core project attributes. Workstreams and milestones are managed on the detail page."
          submitLabel="Save changes"
          fields={projectFields}
          initialValues={projectInitialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold text-foreground")}>{value}</div>
    </div>
  );
}

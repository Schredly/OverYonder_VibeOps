import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, CheckCircle2, AlertTriangle, Clock, Plus } from "lucide-react";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { type MigrationWave, type WaveStatus } from "@/data/apm/migrations";
import { findProject } from "@/data/apm/projects";
import { findApplication } from "@/data/apm/applications";
import { findPerson, people } from "@/data/apm/people";

const STATUS_ORDER: WaveStatus[] = ["Planned", "In Progress", "Validating", "Blocked", "Complete"];
const WAVE_TYPES: MigrationWave["type"][] = ["Cloud Migration", "ServiceNow Migration", "Data Migration", "Decommission"];
const WAVE_RISKS: MigrationWave["riskLevel"][] = ["Low", "Medium", "High"];

const statusTone: Record<WaveStatus, "neutral" | "info" | "warning" | "danger" | "success"> = {
  Planned: "neutral",
  "In Progress": "info",
  Validating: "warning",
  Blocked: "danger",
  Complete: "success",
};
const riskTone = (r: MigrationWave["riskLevel"]) => (r === "High" ? "danger" : r === "Medium" ? "warning" : "success");

export default function MigrationWaves() {
  const { migrationWaves: waveStore, projects: projectStore } = useApmData();
  const waves = waveStore.items;
  const { toast } = useToast();
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const viewing = waves.find((w) => w.id === viewId) ?? null;
  const editing = waves.find((w) => w.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Wave name", required: true },
      { name: "project", label: "Project", type: "select", options: projectStore.items.map((p) => p.name) },
      { name: "type", label: "Type", type: "select", options: WAVE_TYPES },
      { name: "status", label: "Status", type: "select", options: STATUS_ORDER },
      { name: "owner", label: "Owner", type: "select", options: people.map((p) => p.name) },
      { name: "riskLevel", label: "Risk level", type: "select", options: WAVE_RISKS },
      { name: "startDate", label: "Start date", placeholder: "YYYY-MM-DD" },
      { name: "endDate", label: "End date", placeholder: "YYYY-MM-DD" },
      { name: "progress", label: "Progress (%)", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    [projectStore.items],
  );

  const initialValues = (w: MigrationWave): Record<string, string> => ({
    name: w.name,
    project: findProject(w.projectId)?.name ?? "",
    type: w.type,
    status: w.status,
    owner: findPerson(w.ownerId)?.name ?? "",
    riskLevel: w.riskLevel,
    startDate: w.startDate,
    endDate: w.endDate,
    progress: String(w.progress),
    notes: w.notes,
  });

  const patch = (values: Record<string, string>, w: MigrationWave): Partial<MigrationWave> => ({
    name: values.name || w.name,
    projectId: projectStore.items.find((p) => p.name === values.project)?.id ?? w.projectId,
    type: (values.type as MigrationWave["type"]) || w.type,
    status: (values.status as WaveStatus) || w.status,
    ownerId: people.find((p) => p.name === values.owner)?.id ?? w.ownerId,
    riskLevel: (values.riskLevel as MigrationWave["riskLevel"]) || w.riskLevel,
    startDate: values.startDate || w.startDate,
    endDate: values.endDate || w.endDate,
    progress: Number(values.progress) || w.progress,
    notes: values.notes || w.notes,
  });

  const handleCreate = (values: Record<string, string>) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const wave: MigrationWave = {
      id: `wave-${slug || Date.now()}`,
      name: values.name,
      projectId: projectStore.items.find((p) => p.name === values.project)?.id ?? "",
      type: (values.type as MigrationWave["type"]) || "Cloud Migration",
      status: (values.status as WaveStatus) || "Planned",
      applicationIds: [],
      ownerId: people.find((p) => p.name === values.owner)?.id ?? people[0].id,
      startDate: values.startDate || "",
      endDate: values.endDate || "",
      progress: Number(values.progress) || 0,
      riskLevel: (values.riskLevel as MigrationWave["riskLevel"]) || "Medium",
      notes: values.notes || "",
    };
    waveStore.add(wave);
    toast({ title: "Migration wave created", description: `${wave.name} added.` });
  };

  const inProgress = waves.filter((w) => w.status === "In Progress" || w.status === "Validating").length;
  const complete = waves.filter((w) => w.status === "Complete").length;
  const blocked = waves.filter((w) => w.status === "Blocked").length;
  const avgProgress = waves.length ? Math.round(waves.reduce((s, w) => s + w.progress, 0) / waves.length) : 0;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Migration Waves"
        description="Sequenced delivery waves for cloud migration, data migration, and decommissioning across modernization projects."
        actions={
          <RecordFormDialog
            title="New Migration Wave"
            description="Add a delivery wave and sequence it under a modernization project."
            submitLabel="Create wave"
            fields={fields}
            onSubmit={handleCreate}
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />New Wave
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Waves" value={waves.length} icon={<ArrowRightLeft className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Blocked" value={blocked} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Complete" value={complete} subtitle={`${avgProgress}% avg progress`} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => {
          const colWaves = waves.filter((w) => w.status === status);
          return (
            <div key={status} className="flex w-80 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">{status}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{colWaves.length}</span>
              </div>
              <div className="space-y-2">
                {colWaves.map((w) => {
                  const project = findProject(w.projectId);
                  return (
                    <div
                      key={w.id}
                      className="cursor-pointer rounded-md border border-border bg-white p-3 shadow-sm transition-colors hover:border-primary/40"
                      onClick={() => setViewId(w.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-tight text-foreground">{w.name}</div>
                        <div className="flex items-center gap-1">
                          <StatusBadge label={w.riskLevel} tone={riskTone(w.riskLevel)} />
                          <RowActions
                            entityName={w.name}
                            entityKind="wave"
                            onView={() => setViewId(w.id)}
                            onEdit={() => setEditId(w.id)}
                            onDelete={() => {
                              waveStore.remove(w.id);
                              toast({ title: "Wave deleted", description: `${w.name} was removed.` });
                            }}
                          />
                        </div>
                      </div>
                      {project && (
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 block text-xs text-muted-foreground hover:text-primary"
                        >
                          {project.name}
                        </Link>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">{w.type}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${w.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{w.progress}%</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {w.applicationIds.map((id) => (
                          <Link key={id} href={`/applications/${id}`} onClick={(e) => e.stopPropagation()} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground hover:text-primary">
                            {findApplication(id)?.name}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{findPerson(w.ownerId)?.name}</span>
                        <span>{w.endDate}</span>
                      </div>
                      {w.status === "Blocked" && (
                        <div className="mt-2 rounded bg-destructive/10 p-2 text-[11px] text-destructive">{w.notes}</div>
                      )}
                    </div>
                  );
                })}
                {colWaves.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</div>
                )}
              </div>
              <div className="mt-1">
                <StatusBadge label={status} tone={statusTone[status]} />
              </div>
            </div>
          );
        })}
      </div>

      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={findProject(viewing.projectId)?.name}
          entityKind="wave"
          badges={
            <>
              <StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />
              <StatusBadge label={`${viewing.riskLevel} risk`} tone={riskTone(viewing.riskLevel)} />
            </>
          }
          sections={[
            {
              heading: "Wave detail",
              fields: [
                { label: "Type", value: viewing.type },
                { label: "Owner", value: findPerson(viewing.ownerId)?.name ?? "—" },
                { label: "Start", value: viewing.startDate || "—" },
                { label: "End", value: viewing.endDate || "—" },
                { label: "Progress", value: `${viewing.progress}%` },
                { label: "Applications", value: viewing.applicationIds.length || "—" },
                { label: "Notes", value: viewing.notes || "—", full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            waveStore.remove(viewing.id);
            toast({ title: "Wave deleted", description: `${viewing.name} was removed.` });
          }}
        />
      )}

      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          submitLabel="Save changes"
          fields={fields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            waveStore.update(editing.id, patch(values, editing));
            toast({ title: "Wave updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  ListChecks,
  Activity,
  AlertTriangle,
  Clock,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import {
  APM_TASK_STATUSES,
  type ApmTask,
  type ApmTaskStatus,
  type TaskPriority,
} from "@/data/apm/tasks";
import type { Scope } from "@/data/apm/risks";
import { findPerson, people } from "@/data/apm/people";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { criticalityTone } from "@/components/apm/tone";
import { scopeHref, scopeLabel } from "@/components/apm/scopeLink";

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
const YES_NO = ["Yes", "No"] as const;

// Reference "today" for overdue math — kept in step with the APM mock data.
const TODAY = new Date("2026-05-16");

const statusTone: Record<ApmTaskStatus, "neutral" | "info" | "primary" | "danger" | "warning" | "success"> = {
  Backlog: "neutral",
  Planned: "info",
  "In Progress": "primary",
  Blocked: "danger",
  "In Review": "warning",
  Complete: "success",
};

const isOverdue = (t: ApmTask) => t.status !== "Complete" && new Date(t.dueDate) < TODAY;

export default function Tasks() {
  const { tasks: taskStore, applications, projects, migrationWaves, campaigns, capabilities } = useApmData();
  const tasks = taskStore.items;
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"board" | "table">("board");
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const viewing = tasks.find((t) => t.id === viewId) ?? null;
  const editing = tasks.find((t) => t.id === editId) ?? null;

  // Flatten every scopable record into one labelled picker list.
  const scopeChoices = useMemo(() => {
    const list: { label: string; scope: Scope }[] = [];
    applications.items.forEach((a) => list.push({ label: `[Application] ${a.name}`, scope: { type: "application", id: a.id, label: a.name } }));
    projects.items.forEach((p) => list.push({ label: `[Project] ${p.name}`, scope: { type: "project", id: p.id, label: p.name } }));
    migrationWaves.items.forEach((w) => list.push({ label: `[Migration Wave] ${w.name}`, scope: { type: "migration", id: w.id, label: w.name } }));
    campaigns.items.forEach((c) => list.push({ label: `[Certification] ${c.name}`, scope: { type: "certification", id: c.id, label: c.name } }));
    capabilities.items.forEach((c) => list.push({ label: `[Capability] ${c.name}`, scope: { type: "capability", id: c.id, label: c.name } }));
    return list;
  }, [applications.items, projects.items, migrationWaves.items, campaigns.items, capabilities.items]);

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Task name", required: true, full: true },
      { name: "scope", label: "Scope", type: "select", required: true, options: scopeChoices.map((c) => c.label) },
      { name: "assignee", label: "Assign to", type: "select", required: true, options: people.map((p) => p.name) },
      { name: "status", label: "Status", type: "select", options: APM_TASK_STATUSES },
      { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
      { name: "billable", label: "Billable", type: "select", options: YES_NO },
      { name: "estimatedHours", label: "Estimated hours", type: "number" },
      { name: "actualHours", label: "Actual hours", type: "number" },
      { name: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
      { name: "blocker", label: "Blocker (if any)", type: "textarea" },
    ],
    [scopeChoices],
  );

  const scopeLabelFor = (s: Scope) => `[${scopeLabel[s.type]}] ${s.label}`;

  const initialValues = (t: ApmTask): Record<string, string> => ({
    name: t.name,
    scope: scopeLabelFor(t.scope),
    assignee: findPerson(t.assigneeId)?.name ?? "",
    status: t.status,
    priority: t.priority,
    billable: t.billable ? "Yes" : "No",
    estimatedHours: String(t.estimatedHours),
    actualHours: String(t.actualHours),
    dueDate: t.dueDate,
    blocker: t.blocker ?? "",
  });

  const patch = (values: Record<string, string>, t: ApmTask): Partial<ApmTask> => ({
    name: values.name || t.name,
    scope: scopeChoices.find((c) => c.label === values.scope)?.scope ?? t.scope,
    assigneeId: people.find((p) => p.name === values.assignee)?.id ?? t.assigneeId,
    status: (values.status as ApmTaskStatus) || t.status,
    priority: (values.priority as TaskPriority) || t.priority,
    billable: values.billable === "Yes",
    estimatedHours: Number(values.estimatedHours) || t.estimatedHours,
    actualHours: Number(values.actualHours) || t.actualHours,
    dueDate: values.dueDate || t.dueDate,
    blocker: values.blocker || undefined,
  });

  const handleCreate = (values: Record<string, string>) => {
    const scope = scopeChoices.find((c) => c.label === values.scope)?.scope;
    if (!scope) return;
    const task: ApmTask = {
      id: `at-${Date.now()}`,
      name: values.name,
      scope,
      assigneeId: people.find((p) => p.name === values.assignee)?.id ?? people[0].id,
      status: (values.status as ApmTaskStatus) || "Backlog",
      priority: (values.priority as TaskPriority) || "Medium",
      billable: values.billable === "Yes",
      estimatedHours: Number(values.estimatedHours) || 0,
      actualHours: Number(values.actualHours) || 0,
      dueDate: values.dueDate || "",
      blocker: values.blocker || undefined,
    };
    taskStore.add(task);
    toast({ title: "Task created", description: `${task.name} added.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !`${t.name} ${t.scope.label}`.toLowerCase().includes(q)) return false;
      if (assignee && findPerson(t.assigneeId)?.type !== assignee.toLowerCase()) return false;
      if (priority && t.priority !== priority) return false;
      if (status && t.status !== status) return false;
      return true;
    });
  }, [tasks, search, assignee, priority, status]);

  const open = tasks.filter((t) => t.status !== "Complete");
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const blocked = tasks.filter((t) => t.status === "Blocked").length;
  const overdue = tasks.filter(isOverdue).length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Task Management"
        description="Every piece of work across the portfolio — scoped to applications, projects, migration waves, certifications, and capabilities, and assigned to internal staff or external consultants."
        actions={
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />New Task
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Open Tasks" value={open.length} subtitle={`of ${tasks.length} total`} icon={<ListChecks className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="In Progress" value={inProgress} icon={<Activity className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Blocked" value={blocked} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Overdue" value={overdue} subtitle="open & past due" trendType="bad" icon={<Clock className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search tasks, scope…"
        summary={`${filtered.length} of ${tasks.length} tasks`}
        filters={
          <>
            <FilterSelect label="Assignee" value={assignee} onChange={setAssignee} options={["Internal", "Consultant"]} />
            <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={APM_TASK_STATUSES} />
          </>
        }
        actions={
          <div className="relative flex rounded-md border border-border bg-white p-0.5">
            {(["board", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "board" ? <LayoutGrid className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
                {v}
              </button>
            ))}
          </div>
        }
      />

      {view === "board" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4"
        >
          {APM_TASK_STATUSES.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            return (
              <div key={col} className="flex w-80 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card/60 p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge label={col} tone={statusTone[col]} />
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => {
                    const person = findPerson(t.assigneeId);
                    const overdueCard = isOverdue(t);
                    return (
                      <div
                        key={t.id}
                        className="cursor-pointer rounded-md border border-border bg-white p-3 shadow-sm transition-colors hover:border-primary/40"
                        onClick={() => setViewId(t.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium leading-tight text-foreground">{t.name}</div>
                          <div className="flex items-center gap-1">
                            <StatusBadge label={t.priority} tone={criticalityTone[t.priority]} />
                            <RowActions
                              entityName={t.name}
                              entityKind="task"
                              onView={() => setViewId(t.id)}
                              onEdit={() => setEditId(t.id)}
                              onDelete={() => {
                                taskStore.remove(t.id);
                                toast({ title: "Task deleted", description: `${t.name} was removed.` });
                              }}
                            />
                          </div>
                        </div>
                        <Link
                          href={scopeHref(t.scope)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 block text-xs text-muted-foreground hover:text-primary"
                        >
                          <span className="uppercase tracking-wide">{scopeLabel[t.scope.type]}</span> · {t.scope.label}
                        </Link>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                              {person?.initials}
                            </span>
                            {person?.name}
                          </span>
                          <span className="font-mono">{t.actualHours}/{t.estimatedHours}h</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className={cn("text-muted-foreground", overdueCard && "font-medium text-destructive")}>
                            {overdueCard ? "Overdue · " : "Due "}{t.dueDate}
                          </span>
                          {t.billable && <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">Billable</span>}
                        </div>
                        {t.blocker && (
                          <div className="mt-2 rounded bg-destructive/10 p-2 text-[11px] text-destructive">{t.blocker}</div>
                        )}
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Task</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Scope</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Billable</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Due</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => {
                const person = findPerson(t.assigneeId);
                const overdueRow = isOverdue(t);
                return (
                  <tr key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(t.id)}>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{t.name}</div>
                      {t.blocker && <div className="mt-0.5 text-xs text-destructive">Blocked: {t.blocker}</div>}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {person?.name} <span className="text-xs">({person?.type})</span>
                    </td>
                    <td className="p-3">
                      <Link href={scopeHref(t.scope)} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary">
                        <span className="text-[11px] uppercase tracking-wide">{scopeLabel[t.scope.type]}</span>
                        <div className="text-foreground">{t.scope.label}</div>
                      </Link>
                    </td>
                    <td className="p-3"><StatusBadge label={t.status} tone={statusTone[t.status]} /></td>
                    <td className="p-3"><StatusBadge label={t.priority} tone={criticalityTone[t.priority]} /></td>
                    <td className="p-3 text-muted-foreground">{t.billable ? "Yes" : "—"}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{t.actualHours} / {t.estimatedHours}</td>
                    <td className={cn("p-3 text-muted-foreground", overdueRow && "font-medium text-destructive")}>{t.dueDate}</td>
                    <td className="p-3">
                      <RowActions
                        entityName={t.name}
                        entityKind="task"
                        onView={() => setViewId(t.id)}
                        onEdit={() => setEditId(t.id)}
                        onDelete={() => {
                          taskStore.remove(t.id);
                          toast({ title: "Task deleted", description: `${t.name} was removed.` });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">
              No tasks match the current filters.
            </div>
          )}
        </div>
      )}

      <RecordFormDialog
        title="New Task"
        description="Create a task and scope it to an application, project, migration wave, certification, or capability."
        submitLabel="Create task"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={`${scopeLabel[viewing.scope.type]} · ${viewing.scope.label}`}
          entityKind="task"
          badges={
            <>
              <StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />
              <StatusBadge label={viewing.priority} tone={criticalityTone[viewing.priority]} />
            </>
          }
          sections={[
            {
              heading: "Task detail",
              fields: [
                { label: "Assignee", value: findPerson(viewing.assigneeId)?.name ?? "—" },
                { label: "Billable", value: viewing.billable ? "Yes" : "No" },
                { label: "Estimated", value: `${viewing.estimatedHours}h` },
                { label: "Actual", value: `${viewing.actualHours}h` },
                { label: "Due date", value: viewing.dueDate || "—" },
                { label: "Overdue", value: isOverdue(viewing) ? "Yes" : "No" },
                { label: "Blocker", value: viewing.blocker ?? "—", full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            taskStore.remove(viewing.id);
            toast({ title: "Task deleted", description: `${viewing.name} was removed.` });
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
            taskStore.update(editing.id, patch(values, editing));
            toast({ title: "Task updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

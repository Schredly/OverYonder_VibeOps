import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Plus, ListIcon, LayoutGrid, ListTodo, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import {
  TASK_STATUSES,
  type ConsultingTask,
  type TaskStatus,
  type TaskPriority,
} from "@/data/consulting/tasks";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
const RISKS: ConsultingTask["risk"][] = ["None", "Low", "Medium", "High"];
const YES_NO = ["Yes", "No"] as const;

const priorityTone = (p: TaskPriority) => (p === "Critical" ? "danger" : p === "High" ? "warning" : "neutral");
const riskTone = (r: ConsultingTask["risk"]) =>
  r === "High" ? "danger" : r === "Medium" ? "warning" : r === "Low" ? "info" : "neutral";

export default function TaskDelivery() {
  const { tasks, engagements, consultants } = useConsultingData();
  const taskList = tasks.items;
  const { toast } = useToast();
  const [view, setView] = useState<"board" | "table">("board");
  const [search, setSearch] = useState("");
  const [engagement, setEngagement] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const consultantById = useMemo(() => Object.fromEntries(consultants.items.map((c) => [c.id, c])), [consultants.items]);
  const engagementById = useMemo(() => Object.fromEntries(engagements.items.map((e) => [e.id, e])), [engagements.items]);
  const viewing = taskList.find((t) => t.id === viewId) ?? null;
  const editing = taskList.find((t) => t.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Task name", required: true, full: true },
      { name: "engagement", label: "Engagement", type: "select", required: true, options: engagements.items.map((e) => e.name) },
      { name: "owner", label: "Owner", type: "select", options: consultants.items.map((c) => c.name) },
      { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
      { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
      { name: "risk", label: "Risk", type: "select", options: RISKS },
      { name: "billable", label: "Billable", type: "select", options: YES_NO },
      { name: "estimatedHours", label: "Estimated hours", type: "number" },
      { name: "actualHours", label: "Actual hours", type: "number" },
      { name: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
      { name: "blocker", label: "Blocker (if any)", type: "textarea" },
    ],
    [engagements.items, consultants.items],
  );

  const initialValues = (t: ConsultingTask): Record<string, string> => ({
    name: t.name,
    engagement: engagementById[t.engagementId]?.name ?? "",
    owner: consultantById[t.ownerId]?.name ?? "",
    status: t.status,
    priority: t.priority,
    risk: t.risk,
    billable: t.billable ? "Yes" : "No",
    estimatedHours: String(t.estimatedHours),
    actualHours: String(t.actualHours),
    dueDate: t.dueDate,
    blocker: t.blocker ?? "",
  });

  const patch = (values: Record<string, string>, t: ConsultingTask): Partial<ConsultingTask> => ({
    name: values.name || t.name,
    engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? t.engagementId,
    ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? t.ownerId,
    status: (values.status as TaskStatus) || t.status,
    priority: (values.priority as TaskPriority) || t.priority,
    risk: (values.risk as ConsultingTask["risk"]) || t.risk,
    billable: values.billable !== "No",
    estimatedHours: Number(values.estimatedHours) || t.estimatedHours,
    actualHours: Number(values.actualHours) || t.actualHours,
    dueDate: values.dueDate || t.dueDate,
    blocker: values.blocker || undefined,
  });

  const handleCreate = (values: Record<string, string>) => {
    const task: ConsultingTask = {
      id: `t-${Date.now()}`,
      name: values.name,
      engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? "",
      ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? "",
      status: (values.status as TaskStatus) || "Backlog",
      priority: (values.priority as TaskPriority) || "Medium",
      billable: values.billable !== "No",
      estimatedHours: Number(values.estimatedHours) || 0,
      actualHours: Number(values.actualHours) || 0,
      dueDate: values.dueDate || "",
      risk: (values.risk as ConsultingTask["risk"]) || "None",
      blocker: values.blocker || undefined,
    };
    tasks.add(task);
    toast({ title: "Task created", description: `${task.name} added.` });
  };

  const remove = (t: ConsultingTask) => {
    tasks.remove(t.id);
    toast({ title: "Task deleted", description: `${t.name} was removed.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return taskList.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (engagement && engagementById[t.engagementId]?.name !== engagement) return false;
      if (owner && consultantById[t.ownerId]?.name !== owner) return false;
      if (priority && t.priority !== priority) return false;
      return true;
    });
  }, [taskList, search, engagement, owner, priority, consultantById, engagementById]);

  const billable = taskList.filter((t) => t.billable);
  const blocked = taskList.filter((t) => t.status === "Blocked").length;
  const waitingClient = taskList.filter((t) => t.status === "Waiting for Client").length;
  const complete = taskList.filter((t) => t.status === "Complete").length;
  const billablePct = taskList.length ? Math.round((billable.length / taskList.length) * 100) : 0;

  const rowActions = (t: ConsultingTask) => (
    <RowActions
      entityName={t.name}
      entityKind="task"
      onView={() => setViewId(t.id)}
      onEdit={() => setEditId(t.id)}
      onDelete={() => remove(t)}
    />
  );

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Task Delivery"
        description="Consulting work execution across all engagements — kanban board, owners, and blockers."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Tasks" value={taskList.length} icon={<ListTodo className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Billable %" value={billablePct} suffix="%" trend={2} icon={<Clock className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Blocked / Waiting" value={blocked + waitingClient} subtitle={`${blocked} blocked · ${waitingClient} waiting`} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Completed" value={complete} subtitle="last 30d" icon={<CheckCircle2 className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search tasks…"
        summary={`${filtered.length} of ${taskList.length} tasks`}
        filters={
          <>
            <FilterSelect label="Engagement" value={engagement} onChange={setEngagement} options={engagements.items.map((e) => e.name)} />
            <FilterSelect label="Owner" value={owner} onChange={setOwner} options={consultants.items.map((c) => c.name)} />
            <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
          </>
        }
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border bg-white p-0.5">
            <button
              onClick={() => setView("board")}
              className={cn("rounded px-2 py-1 text-xs font-medium", view === "board" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn("rounded px-2 py-1 text-xs font-medium", view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TASK_STATUSES.map((s) => {
            const items = filtered.filter((t) => t.status === s);
            return (
              <div key={s} className="flex w-72 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card/60 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{s}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      className="cursor-pointer rounded-md border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                      onClick={() => setViewId(t.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-tight text-foreground">{t.name}</div>
                        <div className="flex items-center gap-1">
                          <StatusBadge label={t.priority} tone={priorityTone(t.priority)} />
                          {rowActions(t)}
                        </div>
                      </div>
                      <Link
                        href={`/consulting/engagements/${t.engagementId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 block text-xs text-muted-foreground hover:text-primary"
                      >
                        {engagementById[t.engagementId]?.name}
                      </Link>
                      {t.blocker && (
                        <div className="mt-2 rounded bg-destructive/10 p-2 text-[11px] text-destructive">{t.blocker}</div>
                      )}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {consultantById[t.ownerId]?.initials}
                          </span>
                          {consultantById[t.ownerId]?.name}
                        </span>
                        <span>{t.dueDate}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Task</th>
                <th className="p-3">Engagement</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Billable</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Due</th>
                <th className="p-3">Risk</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(t.id)}>
                  <td className="p-3 font-medium text-foreground">{t.name}</td>
                  <td className="p-3 text-muted-foreground">
                    <Link href={`/consulting/engagements/${t.engagementId}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">
                      {engagementById[t.engagementId]?.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{consultantById[t.ownerId]?.name}</td>
                  <td className="p-3"><StatusBadge label={t.status} /></td>
                  <td className="p-3"><StatusBadge label={t.priority} tone={priorityTone(t.priority)} /></td>
                  <td className="p-3 text-muted-foreground">{t.billable ? "Yes" : "—"}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{t.actualHours} / {t.estimatedHours}</td>
                  <td className="p-3 text-muted-foreground">{t.dueDate}</td>
                  <td className="p-3"><StatusBadge label={t.risk} tone={riskTone(t.risk)} /></td>
                  <td className="p-3">{rowActions(t)}</td>
                </tr>
              ))}
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
        description="Capture a new piece of consulting work and route it to an owner."
        submitLabel="Create task"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
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
            tasks.update(editing.id, patch(values, editing));
            toast({ title: "Task updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={engagementById[viewing.engagementId]?.name}
          entityKind="task"
          badges={
            <>
              <StatusBadge label={viewing.status} />
              <StatusBadge label={viewing.priority} tone={priorityTone(viewing.priority)} />
            </>
          }
          sections={[
            {
              heading: "Task detail",
              fields: [
                { label: "Owner", value: consultantById[viewing.ownerId]?.name ?? "—" },
                { label: "Risk", value: viewing.risk },
                { label: "Billable", value: viewing.billable ? "Yes" : "No" },
                { label: "Due", value: viewing.dueDate || "—" },
                { label: "Estimated", value: `${viewing.estimatedHours}h` },
                { label: "Actual", value: `${viewing.actualHours}h` },
                { label: "Blocker", value: viewing.blocker ?? "—", full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => remove(viewing)}
        />
      )}
    </div>
  );
}

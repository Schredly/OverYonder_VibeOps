import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Plus, Clock, DollarSign, CheckCircle2, FileClock } from "lucide-react";
import type { ConsultingTimeEntry } from "@/data/consulting/timeBilling";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money } from "@/components/consulting/format";

const TIME_STATUSES: ConsultingTimeEntry["status"][] = ["Draft", "Submitted", "Approved", "Billed"];
const YES_NO = ["Yes", "No"] as const;

const statusTone: Record<ConsultingTimeEntry["status"], "neutral" | "warning" | "info" | "success"> = {
  Draft: "neutral",
  Submitted: "warning",
  Approved: "info",
  Billed: "success",
};

export default function ConsultantTime() {
  const { timeEntries, consultants, engagements } = useConsultingData();
  const entries = timeEntries.items;
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [consultant, setConsultant] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const consultantById = useMemo(() => Object.fromEntries(consultants.items.map((c) => [c.id, c])), [consultants.items]);
  const engagementById = useMemo(() => Object.fromEntries(engagements.items.map((e) => [e.id, e])), [engagements.items]);
  const viewing = entries.find((t) => t.id === viewId) ?? null;
  const editing = entries.find((t) => t.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "consultant", label: "Consultant", type: "select", required: true, options: consultants.items.map((c) => c.name) },
      { name: "engagement", label: "Engagement", type: "select", required: true, options: engagements.items.map((e) => e.name) },
      { name: "date", label: "Date", placeholder: "YYYY-MM-DD", required: true },
      { name: "hours", label: "Hours", type: "number", required: true },
      { name: "rate", label: "Rate ($/hr)", type: "number" },
      { name: "billable", label: "Billable", type: "select", options: YES_NO },
      { name: "status", label: "Status", type: "select", options: TIME_STATUSES },
      { name: "note", label: "Note", type: "textarea" },
    ],
    [consultants.items, engagements.items],
  );

  const initialValues = (t: ConsultingTimeEntry): Record<string, string> => ({
    consultant: consultantById[t.consultantId]?.name ?? "",
    engagement: engagementById[t.engagementId]?.name ?? "",
    date: t.date,
    hours: String(t.hours),
    rate: String(t.rate),
    billable: t.billable ? "Yes" : "No",
    status: t.status,
    note: t.note,
  });

  const patch = (values: Record<string, string>, t: ConsultingTimeEntry): Partial<ConsultingTimeEntry> => ({
    consultantId: consultants.items.find((c) => c.name === values.consultant)?.id ?? t.consultantId,
    engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? t.engagementId,
    date: values.date || t.date,
    hours: Number(values.hours) || t.hours,
    rate: Number(values.rate) || t.rate,
    billable: values.billable !== "No",
    status: (values.status as ConsultingTimeEntry["status"]) || t.status,
    note: values.note || t.note,
  });

  const handleCreate = (values: Record<string, string>) => {
    const entry: ConsultingTimeEntry = {
      id: `ct-${Date.now()}`,
      consultantId: consultants.items.find((c) => c.name === values.consultant)?.id ?? "",
      engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? "",
      date: values.date || "",
      hours: Number(values.hours) || 0,
      rate: Number(values.rate) || 0,
      billable: values.billable !== "No",
      note: values.note || "",
      status: (values.status as ConsultingTimeEntry["status"]) || "Draft",
    };
    timeEntries.add(entry);
    toast({ title: "Time logged", description: `${entry.hours}h recorded.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((t) => {
      const cn = consultantById[t.consultantId]?.name ?? "";
      const en = engagementById[t.engagementId]?.name ?? "";
      if (q && !`${cn} ${en} ${t.note}`.toLowerCase().includes(q)) return false;
      if (consultant && cn !== consultant) return false;
      if (status && t.status !== status) return false;
      return true;
    });
  }, [entries, search, consultant, status, consultantById, engagementById]);

  const totalHours = entries.reduce((s, t) => s + t.hours, 0);
  const billableHours = entries.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0);
  const billableValue = entries.filter((t) => t.billable).reduce((s, t) => s + t.hours * t.rate, 0);
  const pendingApproval = entries.filter((t) => t.status === "Submitted").length;
  const unbilled = entries.filter((t) => t.billable && t.status !== "Billed").reduce((s, t) => s + t.hours * t.rate, 0);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Consultant Time"
        description="Time logged by consultants against engagements — billable hours, approvals, and unbilled value."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Log Time
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Hours Logged" value={totalHours} suffix="h" subtitle="this period" icon={<Clock className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Billable Value" value={billableValue / 1000} prefix="$" suffix="K" subtitle={`${billableHours}h billable`} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Pending Approval" value={pendingApproval} subtitle="submitted entries" icon={<FileClock className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Unbilled Value" value={unbilled / 1000} prefix="$" suffix="K" subtitle="approved, not yet billed" trendType="bad" icon={<CheckCircle2 className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search time entries…"
        summary={`${filtered.length} of ${entries.length} entries`}
        filters={
          <>
            <FilterSelect label="Consultant" value={consultant} onChange={setConsultant} options={consultants.items.map((c) => c.name)} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={TIME_STATUSES} />
          </>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Consultant</th>
              <th className="p-3">Engagement</th>
              <th className="p-3">Note</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Value</th>
              <th className="p-3">Billable</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(t.id)}>
                <td className="p-3 text-muted-foreground">{t.date}</td>
                <td className="p-3 font-medium text-foreground">{consultantById[t.consultantId]?.name}</td>
                <td className="p-3 text-muted-foreground">{engagementById[t.engagementId]?.name}</td>
                <td className="p-3 text-muted-foreground">{t.note}</td>
                <td className="p-3 font-medium text-foreground">{t.hours}h</td>
                <td className="p-3 text-muted-foreground">${t.rate}</td>
                <td className="p-3 font-medium text-foreground">{t.billable ? money(t.hours * t.rate) : "—"}</td>
                <td className="p-3 text-muted-foreground">{t.billable ? "Yes" : "—"}</td>
                <td className="p-3"><StatusBadge label={t.status} tone={statusTone[t.status]} /></td>
                <td className="p-3">
                  <RowActions
                    entityName={`${t.date} · ${consultantById[t.consultantId]?.name ?? ""}`}
                    entityKind="time entry"
                    onView={() => setViewId(t.id)}
                    onEdit={() => setEditId(t.id)}
                    onDelete={() => {
                      timeEntries.remove(t.id);
                      toast({ title: "Time entry deleted" });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">
            No time entries match the current filters.
          </div>
        )}
      </div>

      <RecordFormDialog
        title="Log Time"
        description="Record time against an engagement. Billable entries roll up into billing and revenue."
        submitLabel="Log time"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title="Edit time entry"
          submitLabel="Save changes"
          fields={fields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            timeEntries.update(editing.id, patch(values, editing));
            toast({ title: "Time entry updated" });
            setEditId(null);
          }}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={`${viewing.hours}h — ${viewing.date}`}
          subtitle={consultantById[viewing.consultantId]?.name}
          entityKind="time entry"
          badges={<StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />}
          sections={[
            {
              heading: "Time entry",
              fields: [
                { label: "Engagement", value: engagementById[viewing.engagementId]?.name ?? "—", full: true },
                { label: "Hours", value: `${viewing.hours}h` },
                { label: "Rate", value: `$${viewing.rate}/hr` },
                { label: "Billable", value: viewing.billable ? "Yes" : "No" },
                { label: "Value", value: viewing.billable ? money(viewing.hours * viewing.rate) : "—" },
                { label: "Note", value: viewing.note || "—", full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            timeEntries.remove(viewing.id);
            toast({ title: "Time entry deleted" });
          }}
        />
      )}
    </div>
  );
}

import { Fragment, useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, ShieldAlert, Activity, Flag } from "lucide-react";
import {
  RISK_TYPES,
  type DeliveryRisk,
  type RiskType,
  type RiskSeverity,
  type RiskLikelihood,
  type RiskStatus,
} from "@/data/consulting/risks";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const severities: RiskSeverity[] = ["Low", "Medium", "High", "Critical"];
const likelihoods: RiskLikelihood[] = ["Unlikely", "Possible", "Likely", "Almost Certain"];
const RISK_STATUSES: RiskStatus[] = ["Open", "Mitigating", "Accepted", "Closed", "Escalated"];

const severityTone: Record<RiskSeverity, "neutral" | "info" | "warning" | "danger"> = {
  Low: "neutral",
  Medium: "info",
  High: "warning",
  Critical: "danger",
};
const statusTone: Record<RiskStatus, "warning" | "info" | "neutral" | "success" | "danger"> = {
  Open: "warning",
  Mitigating: "info",
  Accepted: "neutral",
  Closed: "success",
  Escalated: "danger",
};

export default function DeliveryRisksPage() {
  const { risks, engagements, consultants } = useConsultingData();
  const riskList = risks.items;
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const engagementById = useMemo(() => Object.fromEntries(engagements.items.map((e) => [e.id, e])), [engagements.items]);
  const consultantById = useMemo(() => Object.fromEntries(consultants.items.map((c) => [c.id, c])), [consultants.items]);
  const viewing = riskList.find((r) => r.id === viewId) ?? null;
  const editing = riskList.find((r) => r.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "title", label: "Risk title", required: true, full: true },
      { name: "engagement", label: "Engagement", type: "select", required: true, options: engagements.items.map((e) => e.name) },
      { name: "type", label: "Type", type: "select", required: true, options: RISK_TYPES },
      { name: "severity", label: "Severity", type: "select", required: true, options: severities },
      { name: "likelihood", label: "Likelihood", type: "select", required: true, options: likelihoods },
      { name: "status", label: "Status", type: "select", options: RISK_STATUSES },
      { name: "owner", label: "Owner", type: "select", options: consultants.items.map((c) => c.name) },
      { name: "raisedDate", label: "Raised date", placeholder: "YYYY-MM-DD" },
      { name: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD" },
      { name: "impact", label: "Impact", type: "textarea", required: true },
      { name: "mitigationPlan", label: "Mitigation plan", type: "textarea" },
    ],
    [engagements.items, consultants.items],
  );

  const initialValues = (r: DeliveryRisk): Record<string, string> => ({
    title: r.title,
    engagement: engagementById[r.engagementId]?.name ?? "",
    type: r.type,
    severity: r.severity,
    likelihood: r.likelihood,
    status: r.status,
    owner: consultantById[r.ownerId]?.name ?? "",
    raisedDate: r.raisedDate,
    dueDate: r.dueDate ?? "",
    impact: r.impact,
    mitigationPlan: r.mitigationPlan,
  });

  const patch = (values: Record<string, string>, r: DeliveryRisk): Partial<DeliveryRisk> => ({
    title: values.title || r.title,
    engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? r.engagementId,
    type: (values.type as RiskType) || r.type,
    severity: (values.severity as RiskSeverity) || r.severity,
    likelihood: (values.likelihood as RiskLikelihood) || r.likelihood,
    status: (values.status as RiskStatus) || r.status,
    ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? r.ownerId,
    raisedDate: values.raisedDate || r.raisedDate,
    dueDate: values.dueDate || undefined,
    impact: values.impact || r.impact,
    mitigationPlan: values.mitigationPlan || r.mitigationPlan,
  });

  const handleCreate = (values: Record<string, string>) => {
    const risk: DeliveryRisk = {
      id: `r-${Date.now()}`,
      title: values.title,
      engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? "",
      type: (values.type as RiskType) || "Technical",
      severity: (values.severity as RiskSeverity) || "Medium",
      likelihood: (values.likelihood as RiskLikelihood) || "Possible",
      impact: values.impact || "—",
      ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? "",
      mitigationPlan: values.mitigationPlan || "—",
      status: (values.status as RiskStatus) || "Open",
      raisedDate: values.raisedDate || "",
      dueDate: values.dueDate || undefined,
    };
    risks.add(risk);
    toast({ title: "Risk logged", description: `${risk.title} added to the register.` });
  };

  const remove = (r: DeliveryRisk) => {
    risks.remove(r.id);
    toast({ title: "Risk deleted", description: `${r.title} was removed.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return riskList.filter((r) => {
      if (q && !`${r.title} ${r.impact}`.toLowerCase().includes(q)) return false;
      if (type && r.type !== type) return false;
      if (severity && r.severity !== severity) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [riskList, search, type, severity, status]);

  const open = riskList.filter((r) => r.status !== "Closed").length;
  const escalated = riskList.filter((r) => r.status === "Escalated").length;
  const critical = riskList.filter((r) => r.severity === "Critical").length;
  const mitigating = riskList.filter((r) => r.status === "Mitigating").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Delivery Risks"
        description="Cross-engagement risk register, severity × likelihood heatmap, and escalation status."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Risk
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Open Risks" value={open} icon={<AlertTriangle className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Critical" value={critical} icon={<ShieldAlert className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Escalated" value={escalated} subtitle="awaiting executive cover" icon={<Flag className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="In Mitigation" value={mitigating} icon={<Activity className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Severity × likelihood heatmap</h3>
        </div>
        <div className="p-6">
          <Heatmap risks={filtered} />
        </div>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search risks…"
        summary={`${filtered.length} of ${riskList.length} risks`}
        filters={
          <>
            <FilterSelect label="Type" value={type} onChange={setType} options={RISK_TYPES} />
            <FilterSelect label="Severity" value={severity} onChange={setSeverity} options={severities} />
            <FilterSelect label="Status" value={status} onChange={setStatus} options={RISK_STATUSES} />
          </>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Risk</th>
              <th className="p-3">Engagement</th>
              <th className="p-3">Type</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Likelihood</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Status</th>
              <th className="p-3">Raised</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(r.id)}>
                <td className="p-3">
                  <div className="font-medium text-foreground">{r.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{r.impact}</div>
                </td>
                <td className="p-3 text-muted-foreground">
                  <Link href={`/consulting/engagements/${r.engagementId}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">
                    {engagementById[r.engagementId]?.name}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{r.type}</td>
                <td className="p-3"><StatusBadge label={r.severity} tone={severityTone[r.severity]} /></td>
                <td className="p-3 text-muted-foreground">{r.likelihood}</td>
                <td className="p-3 text-muted-foreground">{consultantById[r.ownerId]?.name}</td>
                <td className="p-3"><StatusBadge label={r.status} tone={statusTone[r.status]} /></td>
                <td className="p-3 text-muted-foreground">{r.raisedDate}</td>
                <td className="p-3">
                  <RowActions
                    entityName={r.title}
                    entityKind="risk"
                    onView={() => setViewId(r.id)}
                    onEdit={() => setEditId(r.id)}
                    onDelete={() => remove(r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">
            No risks match the current filters.
          </div>
        )}
      </div>

      <RecordFormDialog
        title="New Risk"
        description="Capture a delivery risk so it can be triaged and routed for mitigation."
        submitLabel="Log risk"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.title}`}
          submitLabel="Save changes"
          fields={fields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            risks.update(editing.id, patch(values, editing));
            toast({ title: "Risk updated", description: `${values.title || editing.title} saved.` });
            setEditId(null);
          }}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.title}
          subtitle={engagementById[viewing.engagementId]?.name}
          entityKind="risk"
          badges={
            <>
              <StatusBadge label={viewing.severity} tone={severityTone[viewing.severity]} />
              <StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />
            </>
          }
          sections={[
            {
              heading: "Risk detail",
              fields: [
                { label: "Type", value: viewing.type },
                { label: "Likelihood", value: viewing.likelihood },
                { label: "Owner", value: consultantById[viewing.ownerId]?.name ?? "—" },
                { label: "Raised", value: viewing.raisedDate || "—" },
                { label: "Due", value: viewing.dueDate ?? "—" },
                { label: "Impact", value: viewing.impact, full: true },
                { label: "Mitigation plan", value: viewing.mitigationPlan, full: true },
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

function Heatmap({ risks }: { risks: DeliveryRisk[] }) {
  const counts: Record<string, number> = {};
  risks.forEach((r) => {
    const key = `${r.severity}::${r.likelihood}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  const cellTone = (sev: string, like: string) => {
    const score = severities.indexOf(sev as RiskSeverity) * likelihoods.indexOf(like as RiskLikelihood);
    if (score >= 6) return "bg-destructive/15 text-destructive border-destructive/30";
    if (score >= 3) return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-success/10 text-success border-success/30";
  };
  return (
    <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] gap-2 text-xs">
      <div />
      {likelihoods.map((l) => (
        <div key={l} className="px-2 py-1 text-center font-medium text-muted-foreground">{l}</div>
      ))}
      {[...severities].reverse().map((sev) => (
        <Fragment key={sev}>
          <div className="px-2 py-3 font-medium text-muted-foreground">{sev}</div>
          {likelihoods.map((like) => {
            const c = counts[`${sev}::${like}`] ?? 0;
            return (
              <div
                key={`${sev}-${like}`}
                className={cn(
                  "flex h-14 items-center justify-center rounded-md border text-base font-semibold",
                  c > 0 ? cellTone(sev, like) : "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {c > 0 ? c : "·"}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

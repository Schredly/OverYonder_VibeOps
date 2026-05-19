import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, DollarSign, Activity, Users } from "lucide-react";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import { findEngagement } from "@/data/consulting/engagements";
import { findClient } from "@/data/consulting/clients";
import type { Program } from "@/data/consulting/programs";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money } from "@/components/consulting/format";
import { cn } from "@/lib/utils";

const RISK_SCORES: Program["riskScore"][] = ["Low", "Medium", "High"];
const HEALTHS: Program["health"][] = ["Healthy", "At Risk", "Critical"];
const healthTone = { Healthy: "success", "At Risk": "warning", Critical: "danger" } as const;

export default function AITransformationPrograms() {
  const { programs, consultants } = useConsultingData();
  const programList = programs.items;
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const editing = programList.find((p) => p.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Program name", required: true, full: true },
      { name: "sponsor", label: "Executive sponsor", required: true },
      { name: "owner", label: "Executive owner", type: "select", options: consultants.items.map((c) => c.name) },
      { name: "health", label: "Health", type: "select", options: HEALTHS },
      { name: "riskScore", label: "Risk score", type: "select", options: RISK_SCORES },
      { name: "startDate", label: "Start date", placeholder: "YYYY-MM-DD" },
      { name: "endDate", label: "End date", placeholder: "YYYY-MM-DD" },
      { name: "totalRevenue", label: "Total revenue ($)", type: "number" },
      { name: "totalBudget", label: "Total budget ($)", type: "number" },
      { name: "margin", label: "Margin (%)", type: "number" },
      { name: "adoption", label: "Adoption (%)", type: "number" },
      { name: "satisfaction", label: "Satisfaction (0-100)", type: "number" },
      { name: "executiveAlignment", label: "Executive alignment (0-100)", type: "number" },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
    [consultants.items],
  );

  const initialValues = (p: Program): Record<string, string> => ({
    name: p.name,
    sponsor: p.sponsor,
    owner: consultants.items.find((c) => c.id === p.executiveOwnerId)?.name ?? "",
    health: p.health,
    riskScore: p.riskScore,
    startDate: p.startDate,
    endDate: p.endDate,
    totalRevenue: String(p.totalRevenue),
    totalBudget: String(p.totalBudget),
    margin: String(p.margin),
    adoption: String(p.adoption),
    satisfaction: String(p.satisfaction),
    executiveAlignment: String(p.executiveAlignment),
    description: p.description,
  });

  const patch = (values: Record<string, string>, p: Program): Partial<Program> => ({
    name: values.name || p.name,
    sponsor: values.sponsor || p.sponsor,
    executiveOwnerId: consultants.items.find((c) => c.name === values.owner)?.id ?? p.executiveOwnerId,
    health: (values.health as Program["health"]) || p.health,
    riskScore: (values.riskScore as Program["riskScore"]) || p.riskScore,
    startDate: values.startDate || p.startDate,
    endDate: values.endDate || p.endDate,
    totalRevenue: Number(values.totalRevenue) || p.totalRevenue,
    totalBudget: Number(values.totalBudget) || p.totalBudget,
    margin: Number(values.margin) || p.margin,
    adoption: Number(values.adoption) || p.adoption,
    satisfaction: Number(values.satisfaction) || p.satisfaction,
    executiveAlignment: Number(values.executiveAlignment) || p.executiveAlignment,
    description: values.description || p.description,
  });

  const handleCreate = (values: Record<string, string>) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const program: Program = {
      id: `prog-${slug || Date.now()}`,
      name: values.name,
      sponsor: values.sponsor,
      executiveOwnerId: consultants.items.find((c) => c.name === values.owner)?.id ?? "",
      clientIds: [],
      engagementIds: [],
      workstreams: [],
      startDate: values.startDate || "",
      endDate: values.endDate || "",
      totalRevenue: Number(values.totalRevenue) || 0,
      totalBudget: Number(values.totalBudget) || 0,
      margin: Number(values.margin) || 0,
      adoption: Number(values.adoption) || 0,
      riskScore: (values.riskScore as Program["riskScore"]) || "Low",
      health: (values.health as Program["health"]) || "Healthy",
      satisfaction: Number(values.satisfaction) || 0,
      executiveAlignment: Number(values.executiveAlignment) || 0,
      description: values.description || "—",
    };
    programs.add(program);
    toast({ title: "Program created", description: `${program.name} added.` });
  };

  const totalRevenue = programList.reduce((s, p) => s + p.totalRevenue, 0);
  const avgMargin = programList.length ? Math.round(programList.reduce((s, p) => s + p.margin, 0) / programList.length) : 0;
  const avgAdoption = programList.length ? Math.round(programList.reduce((s, p) => s + p.adoption, 0) / programList.length) : 0;
  const atRisk = programList.filter((p) => p.health !== "Healthy").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="AI Transformation Programs"
        description="Multi-engagement transformation programs spanning workstreams, executives, and KPIs."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Programs" value={programList.length} icon={<Briefcase className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Program Revenue" value={totalRevenue / 1_000_000} prefix="$" suffix="M" trend={11} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Avg Margin" value={avgMargin} suffix="%" trend={2} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Avg Adoption" value={avgAdoption} suffix="%" subtitle={`${atRisk} programs at risk`} icon={<Users className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="space-y-4">
        {programList.map((p) => {
          const engs = p.engagementIds.map((id) => findEngagement(id)).filter((e): e is NonNullable<typeof e> => Boolean(e));
          const owner = consultants.items.find((c) => c.id === p.executiveOwnerId);
          return (
            <div key={p.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-foreground">{p.name}</h3>
                    <StatusBadge label={p.health} tone={healthTone[p.health]} />
                    <StatusBadge label={`Risk: ${p.riskScore}`} tone={p.riskScore === "High" ? "danger" : p.riskScore === "Medium" ? "warning" : "success"} />
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">Sponsor:</span> {p.sponsor}</span>
                    <span><span className="font-medium text-foreground">Owner:</span> {owner?.name}</span>
                    <span>{p.startDate} → {p.endDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="grid grid-cols-3 gap-4 text-right">
                    <Stat label="Revenue" value={money(p.totalRevenue)} />
                    <Stat label="Margin" value={`${p.margin}%`} />
                    <Stat label="Adoption" value={`${p.adoption}%`} />
                  </div>
                  <RowActions
                    entityName={p.name}
                    entityKind="program"
                    onEdit={() => setEditId(p.id)}
                    onDelete={() => {
                      programs.remove(p.id);
                      toast({ title: "Program deleted", description: `${p.name} was removed.` });
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-md border border-border bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">KPIs</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <ProgressRow label="Executive alignment" value={p.executiveAlignment} accent="success" />
                    <ProgressRow label="Satisfaction" value={p.satisfaction} accent="primary" />
                    <ProgressRow label="Adoption" value={p.adoption} accent="primary" />
                  </div>
                </div>

                <div className="rounded-md border border-border bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workstreams</div>
                  <ul className="mt-3 space-y-2 text-sm text-foreground">
                    {p.workstreams.map((w) => (
                      <li key={w} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {w}
                      </li>
                    ))}
                    {p.workstreams.length === 0 && <li className="text-muted-foreground">No workstreams yet.</li>}
                  </ul>
                </div>

                <div className="rounded-md border border-border bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engagements ({engs.length})</div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {engs.map((e) => (
                      <li key={e.id} className="flex items-center justify-between">
                        <Link href={`/consulting/engagements/${e.id}`} className="text-foreground hover:text-primary">
                          {e.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{findClient(e.clientId)?.name}</span>
                      </li>
                    ))}
                    {engs.length === 0 && <li className="text-muted-foreground">No engagements linked yet.</li>}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {programList.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No programs yet. Create one to get started.
          </div>
        )}
      </div>

      <RecordFormDialog
        title="New Program"
        description="Stand up a new transformation program. Engagements and workstreams can be wired in later."
        submitLabel="Create program"
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
            programs.update(editing.id, patch(values, editing));
            toast({ title: "Program updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ProgressRow({ label, value, accent }: { label: string; value: number; accent: "primary" | "success" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", accent === "primary" ? "bg-primary" : "bg-success")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Activity, Target, LayoutGrid, ListIcon } from "lucide-react";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import {
  PROPOSAL_STAGES,
  PRACTICE_AREAS,
  type Proposal,
  type ProposalStage,
  type PracticeArea,
} from "@/data/consulting/proposals";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money } from "@/components/consulting/format";
import { cn } from "@/lib/utils";

const stageVisible = PROPOSAL_STAGES.filter((s) => s !== "Closed Won" && s !== "Closed Lost");

const stageTone: Record<ProposalStage, "neutral" | "info" | "primary" | "warning" | "success" | "danger"> = {
  Discovery: "neutral",
  Qualification: "info",
  Solutioning: "info",
  "Proposal Submitted": "primary",
  "Executive Review": "primary",
  Negotiation: "warning",
  "Closed Won": "success",
  "Closed Lost": "danger",
};

const probTone = (p: number) => (p >= 70 ? "success" : p >= 40 ? "warning" : "neutral");

export default function ProposalPipeline() {
  const { proposals, consultants } = useConsultingData();
  const proposalList = proposals.items;
  const { toast } = useToast();
  const [view, setView] = useState<"board" | "table">("board");
  const [search, setSearch] = useState("");
  const [practice, setPractice] = useState("");
  const [stage, setStage] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const consultantById = useMemo(() => Object.fromEntries(consultants.items.map((c) => [c.id, c])), [consultants.items]);
  const viewing = proposalList.find((p) => p.id === viewId) ?? null;
  const editing = proposalList.find((p) => p.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Proposal name", required: true, full: true },
      { name: "clientName", label: "Client", required: true },
      { name: "practiceArea", label: "Practice area", type: "select", required: true, options: PRACTICE_AREAS },
      { name: "value", label: "Value ($)", type: "number", required: true },
      { name: "stage", label: "Stage", type: "select", required: true, options: PROPOSAL_STAGES },
      { name: "probability", label: "Probability (%)", type: "number" },
      { name: "expectedClose", label: "Expected close", placeholder: "YYYY-MM-DD" },
      { name: "owner", label: "Owner", type: "select", options: consultants.items.map((c) => c.name) },
      { name: "ageDays", label: "Age (days in stage)", type: "number" },
      { name: "nextStep", label: "Next step", type: "textarea" },
    ],
    [consultants.items],
  );

  const initialValues = (p: Proposal): Record<string, string> => ({
    name: p.name,
    clientName: p.clientName,
    practiceArea: p.practiceArea,
    value: String(p.value),
    stage: p.stage,
    probability: String(p.probability),
    expectedClose: p.expectedClose,
    owner: consultantById[p.ownerId]?.name ?? "",
    ageDays: String(p.ageDays),
    nextStep: p.nextStep,
  });

  const patch = (values: Record<string, string>, p: Proposal): Partial<Proposal> => ({
    name: values.name || p.name,
    clientName: values.clientName || p.clientName,
    practiceArea: (values.practiceArea as PracticeArea) || p.practiceArea,
    value: Number(values.value) || p.value,
    stage: (values.stage as ProposalStage) || p.stage,
    probability: Number(values.probability) || p.probability,
    expectedClose: values.expectedClose || p.expectedClose,
    ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? p.ownerId,
    ageDays: Number(values.ageDays) || p.ageDays,
    nextStep: values.nextStep || p.nextStep,
  });

  const handleCreate = (values: Record<string, string>) => {
    const proposal: Proposal = {
      id: `p-${Date.now()}`,
      name: values.name,
      clientName: values.clientName,
      practiceArea: (values.practiceArea as PracticeArea) || "AI Strategy",
      value: Number(values.value) || 0,
      probability: Number(values.probability) || 0,
      stage: (values.stage as ProposalStage) || "Discovery",
      expectedClose: values.expectedClose || "",
      ownerId: consultants.items.find((c) => c.name === values.owner)?.id ?? "",
      nextStep: values.nextStep || "",
      ageDays: Number(values.ageDays) || 0,
    };
    proposals.add(proposal);
    toast({ title: "Proposal created", description: `${proposal.name} added to the pipeline.` });
  };

  const remove = (p: Proposal) => {
    proposals.remove(p.id);
    toast({ title: "Proposal deleted", description: `${p.name} was removed.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proposalList.filter((p) => {
      if (q && !`${p.name} ${p.clientName}`.toLowerCase().includes(q)) return false;
      if (practice && p.practiceArea !== practice) return false;
      if (stage && p.stage !== stage) return false;
      return true;
    });
  }, [proposalList, search, practice, stage]);

  const open = proposalList.filter((p) => p.stage !== "Closed Won" && p.stage !== "Closed Lost");
  const totalPipeline = open.reduce((s, p) => s + p.value, 0);
  const weighted = open.reduce((s, p) => s + (p.value * p.probability) / 100, 0);
  const wonYTD = proposalList.filter((p) => p.stage === "Closed Won").reduce((s, p) => s + p.value, 0);
  const winRate = (() => {
    const closed = proposalList.filter((p) => p.stage === "Closed Won" || p.stage === "Closed Lost");
    if (closed.length === 0) return 0;
    return Math.round((proposalList.filter((p) => p.stage === "Closed Won").length / closed.length) * 100);
  })();

  const rowActions = (p: Proposal) => (
    <RowActions
      entityName={p.name}
      entityKind="proposal"
      onView={() => setViewId(p.id)}
      onEdit={() => setEditId(p.id)}
      onDelete={() => remove(p)}
    />
  );

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Proposal Pipeline"
        description="Open consulting opportunities, weighted forecast, and aging across stages."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Open Pipeline" value={totalPipeline / 1_000_000} prefix="$" suffix="M" trend={6.5} icon={<DollarSign className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Weighted Pipeline" value={weighted / 1_000_000} prefix="$" suffix="M" subtitle="probability-adjusted" trend={4.1} icon={<Target className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Won YTD" value={wonYTD / 1_000_000} prefix="$" suffix="M" trend={18} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Win Rate" value={winRate} suffix="%" subtitle={`${open.length} open`} trend={3} icon={<Activity className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search proposals or clients…"
        summary={`${filtered.length} of ${proposalList.length} proposals`}
        filters={
          <>
            <FilterSelect label="Practice" value={practice} onChange={setPractice} options={PRACTICE_AREAS} />
            <FilterSelect label="Stage" value={stage} onChange={setStage} options={PROPOSAL_STAGES} />
          </>
        }
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border bg-white p-0.5">
            <button onClick={() => setView("board")} className={cn("rounded px-2 py-1 text-xs font-medium", view === "board" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("table")} className={cn("rounded px-2 py-1 text-xs font-medium", view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageVisible.map((s, i) => {
            const items = filtered.filter((p) => p.stage === s);
            const stageValue = items.reduce((sum, p) => sum + p.value, 0);
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex w-80 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card/60 p-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">{s}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{money(stageValue)} total</div>
                </div>
                <div className="space-y-2">
                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-md border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                      onClick={() => setViewId(p.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium leading-tight text-foreground">{p.name}</div>
                        <div className="flex items-center gap-1">
                          <StatusBadge label={`${p.probability}%`} tone={probTone(p.probability)} />
                          {rowActions(p)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{p.clientName}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-foreground">{money(p.value)}</div>
                        <div className="text-xs text-muted-foreground">{consultantById[p.ownerId]?.initials ?? "—"}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Close {p.expectedClose}</span>
                        <span className={p.ageDays > 45 ? "text-amber-600" : ""}>{p.ageDays}d in stage</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Proposal</th>
                <th className="p-3">Client</th>
                <th className="p-3">Practice</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Value</th>
                <th className="p-3">Prob.</th>
                <th className="p-3">Expected close</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Age</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(p.id)}>
                  <td className="p-3 font-medium text-foreground">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.clientName}</td>
                  <td className="p-3 text-muted-foreground">{p.practiceArea}</td>
                  <td className="p-3"><StatusBadge label={p.stage} tone={stageTone[p.stage]} /></td>
                  <td className="p-3 font-medium text-foreground">{money(p.value)}</td>
                  <td className="p-3 text-muted-foreground">{p.probability}%</td>
                  <td className="p-3 text-muted-foreground">{p.expectedClose}</td>
                  <td className="p-3 text-muted-foreground">{consultantById[p.ownerId]?.name ?? "—"}</td>
                  <td className={`p-3 ${p.ageDays > 45 ? "font-medium text-amber-600" : "text-muted-foreground"}`}>{p.ageDays}d</td>
                  <td className="p-3">{rowActions(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">
              No proposals match the current filters.
            </div>
          )}
        </div>
      )}

      <RecordFormDialog
        title="New Proposal"
        description="Create a new opportunity. Stage and probability can be refined as the deal matures."
        submitLabel="Create proposal"
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
            proposals.update(editing.id, patch(values, editing));
            toast({ title: "Proposal updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={viewing.clientName}
          entityKind="proposal"
          badges={
            <>
              <StatusBadge label={viewing.stage} tone={stageTone[viewing.stage]} />
              <StatusBadge label={`${viewing.probability}%`} tone={probTone(viewing.probability)} />
            </>
          }
          sections={[
            {
              heading: "Opportunity",
              fields: [
                { label: "Practice area", value: viewing.practiceArea },
                { label: "Value", value: money(viewing.value) },
                { label: "Owner", value: consultantById[viewing.ownerId]?.name ?? "—" },
                { label: "Expected close", value: viewing.expectedClose || "—" },
                { label: "Age in stage", value: `${viewing.ageDays}d` },
                { label: "Next step", value: viewing.nextStep || "—", full: true },
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

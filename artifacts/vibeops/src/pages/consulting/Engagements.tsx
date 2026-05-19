import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, DollarSign, AlertTriangle, Activity } from "lucide-react";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import {
  ENGAGEMENT_PHASES,
  ENGAGEMENT_TYPES,
  type Engagement,
  type EngagementType,
  type EngagementPhase,
  type Health,
} from "@/data/consulting/engagements";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money } from "@/components/consulting/format";

const HEALTHS: Health[] = ["Healthy", "At Risk", "Critical"];
const healthTone = { Healthy: "success", "At Risk": "warning", Critical: "danger" } as const;
const phaseTone = {
  Discovery: "info",
  Assessment: "info",
  Architecture: "info",
  Pilot: "warning",
  Delivery: "primary",
  Adoption: "primary",
  Optimization: "success",
  "Managed Services": "success",
} as const;

export default function Engagements() {
  const { engagements, clients, consultants } = useConsultingData();
  const engagementList = engagements.items;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [phase, setPhase] = useState("");
  const [health, setHealth] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const consultantById = useMemo(() => Object.fromEntries(consultants.items.map((c) => [c.id, c])), [consultants.items]);
  const clientById = useMemo(() => Object.fromEntries(clients.items.map((c) => [c.id, c])), [clients.items]);
  const editing = engagementList.find((e) => e.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Engagement name", required: true, full: true },
      { name: "client", label: "Client", type: "select", required: true, options: clients.items.map((c) => c.name) },
      { name: "type", label: "Type", type: "select", required: true, options: ENGAGEMENT_TYPES },
      { name: "phase", label: "Phase", type: "select", required: true, options: ENGAGEMENT_PHASES },
      { name: "deliveryManager", label: "Delivery manager", type: "select", options: consultants.items.map((c) => c.name) },
      { name: "health", label: "Health", type: "select", options: HEALTHS },
      { name: "budget", label: "Budget ($)", type: "number" },
      { name: "revenueRecognized", label: "Revenue recognized ($)", type: "number" },
      { name: "margin", label: "Margin (%)", type: "number" },
      { name: "progress", label: "Progress (%)", type: "number" },
      { name: "riskCount", label: "Open risks", type: "number" },
      { name: "startDate", label: "Start date", placeholder: "YYYY-MM-DD" },
      { name: "endDate", label: "End date", placeholder: "YYYY-MM-DD" },
      { name: "executiveSummary", label: "Executive summary", type: "textarea" },
    ],
    [clients.items, consultants.items],
  );

  const initialValues = (e: Engagement): Record<string, string> => ({
    name: e.name,
    client: clientById[e.clientId]?.name ?? "",
    type: e.type,
    phase: e.phase,
    deliveryManager: consultantById[e.deliveryManagerId]?.name ?? "",
    health: e.health,
    budget: String(e.budget),
    revenueRecognized: String(e.revenueRecognized),
    margin: String(e.margin),
    progress: String(e.progress),
    riskCount: String(e.riskCount),
    startDate: e.startDate,
    endDate: e.endDate,
    executiveSummary: e.executiveSummary,
  });

  const patch = (values: Record<string, string>, e: Engagement): Partial<Engagement> => ({
    name: values.name || e.name,
    clientId: clients.items.find((c) => c.name === values.client)?.id ?? e.clientId,
    type: (values.type as EngagementType) || e.type,
    phase: (values.phase as EngagementPhase) || e.phase,
    deliveryManagerId: consultants.items.find((c) => c.name === values.deliveryManager)?.id ?? e.deliveryManagerId,
    health: (values.health as Health) || e.health,
    budget: Number(values.budget) || e.budget,
    revenueRecognized: Number(values.revenueRecognized) || e.revenueRecognized,
    margin: Number(values.margin) || e.margin,
    progress: Number(values.progress) || e.progress,
    riskCount: Number(values.riskCount) || e.riskCount,
    startDate: values.startDate || e.startDate,
    endDate: values.endDate || e.endDate,
    executiveSummary: values.executiveSummary || e.executiveSummary,
  });

  const handleCreate = (values: Record<string, string>) => {
    const engagement: Engagement = {
      id: `eng-${Date.now()}`,
      name: values.name,
      clientId: clients.items.find((c) => c.name === values.client)?.id ?? "",
      type: (values.type as EngagementType) || "AI Strategy",
      phase: (values.phase as EngagementPhase) || "Discovery",
      deliveryManagerId: consultants.items.find((c) => c.name === values.deliveryManager)?.id ?? "",
      teamIds: [],
      budget: Number(values.budget) || 0,
      revenueRecognized: Number(values.revenueRecognized) || 0,
      margin: Number(values.margin) || 0,
      health: (values.health as Health) || "Healthy",
      startDate: values.startDate || "",
      endDate: values.endDate || "",
      progress: Number(values.progress) || 0,
      riskCount: Number(values.riskCount) || 0,
      aiPlatforms: [],
      applications: [],
      executiveSummary: values.executiveSummary || "",
      milestones: [],
      deliverables: [],
      activity: [],
    };
    engagements.add(engagement);
    toast({ title: "Engagement created", description: `${engagement.name} added.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return engagementList.filter((e) => {
      const dm = consultantById[e.deliveryManagerId]?.name ?? "";
      const cn = clientById[e.clientId]?.name ?? "";
      if (q && !`${e.name} ${cn} ${dm} ${e.type}`.toLowerCase().includes(q)) return false;
      if (type && e.type !== type) return false;
      if (phase && e.phase !== phase) return false;
      if (health && e.health !== health) return false;
      return true;
    });
  }, [engagementList, search, type, phase, health, consultantById, clientById]);

  const totalRevenue = engagementList.reduce((s, e) => s + e.revenueRecognized, 0);
  const totalBudget = engagementList.reduce((s, e) => s + e.budget, 0);
  const avgMargin = engagementList.length
    ? Math.round(engagementList.reduce((s, e) => s + e.margin, 0) / engagementList.length)
    : 0;
  const atRisk = engagementList.filter((e) => e.health !== "Healthy").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Consulting Engagements"
        description="Active delivery engagements across clients, with phase, health, and financial posture."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Engagement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Engagements" value={engagementList.length} icon={<Briefcase className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Revenue Recognized" value={totalRevenue / 1_000_000} prefix="$" suffix="M" trend={9.2} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Avg Margin" value={avgMargin} suffix="%" trend={2.1} icon={<Activity className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="At-Risk Engagements" value={atRisk} subtitle={`Total budget ${money(totalBudget)}`} trend={1} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search engagements, clients, delivery manager…"
        summary={`${filtered.length} of ${engagementList.length} engagements`}
        filters={
          <>
            <FilterSelect label="Type" value={type} onChange={setType} options={ENGAGEMENT_TYPES} />
            <FilterSelect label="Phase" value={phase} onChange={setPhase} options={ENGAGEMENT_PHASES} />
            <FilterSelect label="Health" value={health} onChange={setHealth} options={HEALTHS} />
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-muted-foreground">Engagement</TableHead>
              <TableHead className="text-muted-foreground">Client</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Phase</TableHead>
              <TableHead className="text-muted-foreground">Delivery Mgr</TableHead>
              <TableHead className="text-muted-foreground">Budget</TableHead>
              <TableHead className="text-muted-foreground">Margin</TableHead>
              <TableHead className="text-muted-foreground">Health</TableHead>
              <TableHead className="text-muted-foreground">Progress</TableHead>
              <TableHead className="text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow
                key={e.id}
                className="cursor-pointer border-border transition-colors hover:bg-muted/40"
                onClick={() => navigate(`/consulting/engagements/${e.id}`)}
              >
                <TableCell>
                  <Link
                    href={`/consulting/engagements/${e.id}`}
                    onClick={(ev) => ev.stopPropagation()}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {e.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Link href={`/consulting/clients/${e.clientId}`} onClick={(ev) => ev.stopPropagation()} className="hover:text-primary">
                    {clientById[e.clientId]?.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.type}</TableCell>
                <TableCell><StatusBadge label={e.phase} tone={phaseTone[e.phase]} /></TableCell>
                <TableCell className="text-muted-foreground">{consultantById[e.deliveryManagerId]?.name}</TableCell>
                <TableCell className="font-medium text-foreground">{money(e.budget)}</TableCell>
                <TableCell className={`font-medium ${e.margin >= 30 ? "text-success" : e.margin >= 20 ? "text-foreground" : "text-destructive"}`}>{e.margin}%</TableCell>
                <TableCell><StatusBadge label={e.health} tone={healthTone[e.health]} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{e.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <RowActions
                    entityName={e.name}
                    entityKind="engagement"
                    onView={() => navigate(`/consulting/engagements/${e.id}`)}
                    onEdit={() => setEditId(e.id)}
                    onDelete={() => {
                      engagements.remove(e.id);
                      toast({ title: "Engagement deleted", description: `${e.name} was removed.` });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                  No engagements match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <RecordFormDialog
        title="New Engagement"
        description="Start a new client engagement. Team, milestones, and deliverables are managed on the detail page."
        submitLabel="Create engagement"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          description="Update core engagement attributes."
          submitLabel="Save changes"
          fields={fields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            engagements.update(editing.id, patch(values, editing));
            toast({ title: "Engagement updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, AppWindow, DollarSign, AlertTriangle, Sparkles } from "lucide-react";
import NewApplicationDialog from "@/components/apm/NewApplicationDialog";
import RecordFormDialog from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import {
  applicationEditFields,
  applicationInitialValues,
  applicationPatch,
} from "@/components/apm/applicationForm";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import {
  DISPOSITIONS,
  LIFECYCLE_STAGES,
  CRITICALITIES,
  type BusinessApplication,
} from "@/data/apm/applications";
import { findCapability } from "@/data/apm/capabilities";
import { findPerson } from "@/data/apm/people";
import { money } from "@/components/consulting/format";
import { dispositionTone, criticalityTone, riskTone, lifecycleTone, healthBarColor } from "@/components/apm/tone";

export default function ApplicationPortfolio() {
  const { applications: appStore } = useApmData();
  const applications = appStore.items;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [disposition, setDisposition] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [criticality, setCriticality] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const editing = applications.find((a) => a.id === editId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (q && !`${a.name} ${a.businessUnit} ${a.vendor}`.toLowerCase().includes(q)) return false;
      if (disposition && a.disposition !== disposition) return false;
      if (lifecycle && a.lifecycleStage !== lifecycle) return false;
      if (criticality && a.businessCriticality !== criticality) return false;
      return true;
    });
  }, [applications, search, disposition, lifecycle, criticality]);

  const groups = useMemo(() => {
    if (!groupBy) return [{ key: "", apps: filtered }];
    const map = new Map<string, typeof filtered>();
    for (const a of filtered) {
      const key =
        groupBy === "Disposition" ? a.disposition :
        groupBy === "Lifecycle" ? a.lifecycleStage :
        groupBy === "Criticality" ? a.businessCriticality :
        a.businessUnit;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return [...map.entries()].map(([key, apps]) => ({ key, apps }));
  }, [filtered, groupBy]);

  const totalCost = applications.reduce((s, a) => s + a.annualCost, 0);
  const atRisk = applications.filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical").length;
  const aiCandidates = applications.filter((a) => a.aiReadiness === "High").length;

  const handleEditSubmit = (values: Record<string, string>) => {
    if (!editing) return;
    appStore.update(editing.id, applicationPatch(values, editing));
    toast({ title: "Application updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  const handleDelete = (app: BusinessApplication) => {
    appStore.remove(app.id);
    toast({ title: "Application deleted", description: `${app.name} was removed from the portfolio.` });
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Application Portfolio"
        description="Every business application — ownership, lifecycle, cost, risk, and modernization disposition."
        actions={
          <NewApplicationDialog
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Applications" value={applications.length} icon={<AppWindow className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Annual Run Cost" value={totalCost / 1_000_000} prefix="$" suffix="M" icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="At Risk" value={atRisk} subtitle="High or Critical" trend={2} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="AI Candidates" value={aiCandidates} subtitle="high AI readiness" icon={<Sparkles className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search applications, business unit, vendor…"
        summary={`${filtered.length} of ${applications.length} applications`}
        filters={
          <>
            <FilterSelect label="Disposition" value={disposition} onChange={setDisposition} options={DISPOSITIONS} />
            <FilterSelect label="Lifecycle" value={lifecycle} onChange={setLifecycle} options={LIFECYCLE_STAGES} />
            <FilterSelect label="Criticality" value={criticality} onChange={setCriticality} options={CRITICALITIES} />
            <FilterSelect label="Group by" value={groupBy} onChange={setGroupBy} options={["Disposition", "Lifecycle", "Criticality", "Business Unit"]} />
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {groups.map((group) => (
          <div key={group.key || "all"} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {group.key && (
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="text-sm font-medium text-foreground">{group.key}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{group.apps.length}</span>
              </div>
            )}
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Application</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Capability</th>
                  <th className="p-3">Lifecycle</th>
                  <th className="p-3">Criticality</th>
                  <th className="p-3">Annual Cost</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Tech Debt</th>
                  <th className="p-3">Disposition</th>
                  <th className="p-3">Health</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.apps.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => navigate(`/applications/${a.id}`)}
                  >
                    <td className="p-3">
                      <Link
                        href={`/applications/${a.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {a.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{a.businessUnit} · {a.vendor}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{findPerson(a.ownerId)?.name ?? "Unassigned"}</td>
                    <td className="p-3 text-muted-foreground">{findCapability(a.capabilityIds[0])?.name ?? "—"}</td>
                    <td className="p-3"><StatusBadge label={a.lifecycleStage} tone={lifecycleTone[a.lifecycleStage]} /></td>
                    <td className="p-3"><StatusBadge label={a.businessCriticality} tone={criticalityTone[a.businessCriticality]} /></td>
                    <td className="p-3 font-medium text-foreground">{money(a.annualCost)}</td>
                    <td className="p-3"><StatusBadge label={a.riskLevel} tone={riskTone[a.riskLevel]} /></td>
                    <td className="p-3 text-muted-foreground">{a.techDebtScore}</td>
                    <td className="p-3"><StatusBadge label={a.disposition} tone={dispositionTone[a.disposition]} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${healthBarColor(a.healthScore)}`} style={{ width: `${a.healthScore}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{a.healthScore}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <RowActions
                        entityName={a.name}
                        entityKind="application"
                        onView={() => navigate(`/applications/${a.id}`)}
                        onEdit={() => setEditId(a.id)}
                        onDelete={() => handleDelete(a)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No applications match the current filters.
          </div>
        )}
      </motion.div>

      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          description="Update core application attributes. Technologies, integrations, and assessments are managed on the detail page."
          submitLabel="Save changes"
          fields={applicationEditFields}
          initialValues={applicationInitialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

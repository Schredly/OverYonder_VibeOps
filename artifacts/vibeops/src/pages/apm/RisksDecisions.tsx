import { Fragment, useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, ShieldAlert, Gavel, CheckCircle2 } from "lucide-react";
import {
  RISK_TYPES,
  type ApmRisk,
  type ApmDecision,
  type Scope,
  type RiskType,
  type RiskSeverity,
  type RiskLikelihood,
  type RiskStatus,
  type DecisionStatus,
} from "@/data/apm/risks";
import { findPerson, internalUsers } from "@/data/apm/people";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { riskTone } from "@/components/apm/tone";
import { scopeHref, scopeLabel } from "@/components/apm/scopeLink";
import { cn } from "@/lib/utils";

const severities: RiskSeverity[] = ["Low", "Medium", "High", "Critical"];
const likelihoods: RiskLikelihood[] = ["Unlikely", "Possible", "Likely", "Almost Certain"];
const RISK_STATUSES: RiskStatus[] = ["Open", "Mitigating", "Accepted", "Closed", "Escalated"];
const DECISION_STATUSES: DecisionStatus[] = ["Proposed", "Under Review", "Approved", "Rejected", "Deferred"];

const decisionTone: Record<DecisionStatus, "neutral" | "warning" | "success" | "danger" | "info"> = {
  Proposed: "neutral",
  "Under Review": "warning",
  Approved: "success",
  Rejected: "danger",
  Deferred: "info",
};

export default function RisksDecisions() {
  const { risks: riskStore, decisions: decisionStore, applications, projects, migrationWaves, campaigns, capabilities } = useApmData();
  const risks = riskStore.items;
  const decisions = decisionStore.items;
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [riskViewId, setRiskViewId] = useState<string | null>(null);
  const [riskEditId, setRiskEditId] = useState<string | null>(null);
  const [riskCreate, setRiskCreate] = useState(false);
  const [decisionEditId, setDecisionEditId] = useState<string | null>(null);
  const [decisionCreate, setDecisionCreate] = useState(false);

  const riskViewing = risks.find((r) => r.id === riskViewId) ?? null;
  const riskEditing = risks.find((r) => r.id === riskEditId) ?? null;
  const decisionEditing = decisions.find((d) => d.id === decisionEditId) ?? null;

  // Every record a risk or decision can be scoped to.
  const scopeChoices = useMemo(() => {
    const list: { label: string; scope: Scope }[] = [
      { label: "[Portfolio] Core Portfolio", scope: { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" } },
    ];
    applications.items.forEach((a) => list.push({ label: `[Application] ${a.name}`, scope: { type: "application", id: a.id, label: a.name } }));
    projects.items.forEach((p) => list.push({ label: `[Project] ${p.name}`, scope: { type: "project", id: p.id, label: p.name } }));
    migrationWaves.items.forEach((w) => list.push({ label: `[Migration Wave] ${w.name}`, scope: { type: "migration", id: w.id, label: w.name } }));
    campaigns.items.forEach((c) => list.push({ label: `[Certification] ${c.name}`, scope: { type: "certification", id: c.id, label: c.name } }));
    capabilities.items.forEach((c) => list.push({ label: `[Capability] ${c.name}`, scope: { type: "capability", id: c.id, label: c.name } }));
    return list;
  }, [applications.items, projects.items, migrationWaves.items, campaigns.items, capabilities.items]);

  const scopeLabelFor = (s: Scope) => `[${scopeLabel[s.type]}] ${s.label}`;
  const resolveScope = (label: string, fallback: Scope) =>
    scopeChoices.find((c) => c.label === label)?.scope ?? fallback;

  const riskFields = useMemo<FormField[]>(
    () => [
      { name: "title", label: "Risk title", required: true, full: true },
      { name: "scope", label: "Scope", type: "select", required: true, options: scopeChoices.map((c) => c.label) },
      { name: "type", label: "Type", type: "select", required: true, options: RISK_TYPES },
      { name: "severity", label: "Severity", type: "select", required: true, options: severities },
      { name: "likelihood", label: "Likelihood", type: "select", required: true, options: likelihoods },
      { name: "status", label: "Status", type: "select", options: RISK_STATUSES },
      { name: "owner", label: "Owner", type: "select", options: internalUsers.map((u) => u.name) },
      { name: "raisedDate", label: "Raised date", placeholder: "YYYY-MM-DD" },
      { name: "impact", label: "Impact", type: "textarea", required: true },
      { name: "mitigationPlan", label: "Mitigation plan", type: "textarea" },
    ],
    [scopeChoices],
  );

  const decisionFields = useMemo<FormField[]>(
    () => [
      { name: "title", label: "Decision", required: true, full: true },
      { name: "scope", label: "Scope", type: "select", required: true, options: scopeChoices.map((c) => c.label) },
      { name: "status", label: "Status", type: "select", required: true, options: DECISION_STATUSES },
      { name: "owner", label: "Owner", type: "select", options: internalUsers.map((u) => u.name) },
      { name: "date", label: "Date", placeholder: "YYYY-MM-DD" },
      { name: "rationale", label: "Rationale", type: "textarea", required: true },
    ],
    [scopeChoices],
  );

  const riskInitial = (r: ApmRisk): Record<string, string> => ({
    title: r.title,
    scope: scopeLabelFor(r.scope),
    type: r.type,
    severity: r.severity,
    likelihood: r.likelihood,
    status: r.status,
    owner: findPerson(r.ownerId)?.name ?? "",
    raisedDate: r.raisedDate,
    impact: r.impact,
    mitigationPlan: r.mitigationPlan,
  });

  const decisionInitial = (d: ApmDecision): Record<string, string> => ({
    title: d.title,
    scope: scopeLabelFor(d.scope),
    status: d.status,
    owner: findPerson(d.ownerId)?.name ?? "",
    date: d.date,
    rationale: d.rationale,
  });

  const createRisk = (values: Record<string, string>) => {
    const risk: ApmRisk = {
      id: `risk-${Date.now()}`,
      title: values.title,
      scope: resolveScope(values.scope, { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" }),
      type: (values.type as RiskType) || "Operational",
      severity: (values.severity as RiskSeverity) || "Medium",
      likelihood: (values.likelihood as RiskLikelihood) || "Possible",
      impact: values.impact || "—",
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? internalUsers[0].id,
      mitigationPlan: values.mitigationPlan || "—",
      status: (values.status as RiskStatus) || "Open",
      raisedDate: values.raisedDate || "",
    };
    riskStore.add(risk);
    toast({ title: "Risk logged", description: `${risk.title} added to the register.` });
  };

  const editRisk = (values: Record<string, string>) => {
    if (!riskEditing) return;
    riskStore.update(riskEditing.id, {
      title: values.title || riskEditing.title,
      scope: resolveScope(values.scope, riskEditing.scope),
      type: (values.type as RiskType) || riskEditing.type,
      severity: (values.severity as RiskSeverity) || riskEditing.severity,
      likelihood: (values.likelihood as RiskLikelihood) || riskEditing.likelihood,
      status: (values.status as RiskStatus) || riskEditing.status,
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? riskEditing.ownerId,
      raisedDate: values.raisedDate || riskEditing.raisedDate,
      impact: values.impact || riskEditing.impact,
      mitigationPlan: values.mitigationPlan || riskEditing.mitigationPlan,
    });
    toast({ title: "Risk updated", description: `${values.title || riskEditing.title} saved.` });
    setRiskEditId(null);
  };

  const createDecision = (values: Record<string, string>) => {
    const decision: ApmDecision = {
      id: `dec-${Date.now()}`,
      title: values.title,
      scope: resolveScope(values.scope, { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" }),
      status: (values.status as DecisionStatus) || "Proposed",
      rationale: values.rationale || "—",
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? internalUsers[0].id,
      date: values.date || "",
    };
    decisionStore.add(decision);
    toast({ title: "Decision logged", description: `${decision.title} recorded.` });
  };

  const editDecision = (values: Record<string, string>) => {
    if (!decisionEditing) return;
    decisionStore.update(decisionEditing.id, {
      title: values.title || decisionEditing.title,
      scope: resolveScope(values.scope, decisionEditing.scope),
      status: (values.status as DecisionStatus) || decisionEditing.status,
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? decisionEditing.ownerId,
      date: values.date || decisionEditing.date,
      rationale: values.rationale || decisionEditing.rationale,
    });
    toast({ title: "Decision updated", description: `${values.title || decisionEditing.title} saved.` });
    setDecisionEditId(null);
  };

  const filteredRisks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return risks.filter((r) => {
      if (q && !`${r.title} ${r.scope.label}`.toLowerCase().includes(q)) return false;
      if (type && r.type !== type) return false;
      if (severity && r.severity !== severity) return false;
      return true;
    });
  }, [risks, search, type, severity]);

  const openRisks = risks.filter((r) => r.status !== "Closed").length;
  const critical = risks.filter((r) => r.severity === "Critical").length;
  const escalated = risks.filter((r) => r.status === "Escalated").length;
  const approvedDecisions = decisions.filter((d) => d.status === "Approved").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Risks & Decisions"
        description="One register for technology and delivery risk, and one log for architecture and portfolio decisions."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Open Risks" value={openRisks} icon={<AlertTriangle className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Critical" value={critical} trendType="bad" icon={<ShieldAlert className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Escalated" value={escalated} subtitle="needs executive cover" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Decisions Logged" value={decisions.length} subtitle={`${approvedDecisions} approved`} icon={<Gavel className="h-5 w-5" />} delay={0.2} />
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="decisions">Decision Log</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <FilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search risks…"
            summary={`${filteredRisks.length} of ${risks.length} risks`}
            filters={
              <>
                <FilterSelect label="Type" value={type} onChange={setType} options={RISK_TYPES} />
                <FilterSelect label="Severity" value={severity} onChange={setSeverity} options={severities} />
              </>
            }
            actions={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRiskCreate(true)}>
                <Plus className="mr-2 h-4 w-4" />Log Risk
              </Button>
            }
          />
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Scope</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Likelihood</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRisks.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setRiskViewId(r.id)}>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{r.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{r.impact}</div>
                    </td>
                    <td className="p-3">
                      <Link href={scopeHref(r.scope)} onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-primary">
                        <span className="text-[11px] uppercase tracking-wide">{scopeLabel[r.scope.type]}</span>
                        <div className="text-foreground">{r.scope.label}</div>
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.type}</td>
                    <td className="p-3"><StatusBadge label={r.severity} tone={riskTone[r.severity]} /></td>
                    <td className="p-3 text-muted-foreground">{r.likelihood}</td>
                    <td className="p-3 text-muted-foreground">{findPerson(r.ownerId)?.name}</td>
                    <td className="p-3"><StatusBadge label={r.status} /></td>
                    <td className="p-3">
                      <RowActions
                        entityName={r.title}
                        entityKind="risk"
                        onView={() => setRiskViewId(r.id)}
                        onEdit={() => setRiskEditId(r.id)}
                        onDelete={() => {
                          riskStore.remove(r.id);
                          toast({ title: "Risk deleted", description: `${r.title} was removed.` });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRisks.length === 0 && (
              <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">No risks match the current filters.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-medium text-foreground">Severity × likelihood</h3>
            <Heatmap risks={risks} />
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDecisionCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />Log Decision
            </Button>
          </div>
          <div className="space-y-3">
            {decisions.map((d) => (
              <div key={d.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">{d.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{d.rationale}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <Link href={scopeHref(d.scope)} className="hover:text-primary">{scopeLabel[d.scope.type]}: {d.scope.label}</Link>
                      <span>·</span>
                      <span>{findPerson(d.ownerId)?.name}</span>
                      <span>·</span>
                      <span>{d.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={d.status} tone={decisionTone[d.status]} />
                    <RowActions
                      entityName={d.title}
                      entityKind="decision"
                      onEdit={() => setDecisionEditId(d.id)}
                      onDelete={() => {
                        decisionStore.remove(d.id);
                        toast({ title: "Decision deleted", description: `${d.title} was removed.` });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {decisions.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No decisions logged yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Risk create / edit */}
      <RecordFormDialog
        title="New Risk"
        description="Capture a portfolio or delivery risk for triage."
        submitLabel="Log risk"
        fields={riskFields}
        open={riskCreate}
        onOpenChange={setRiskCreate}
        onSubmit={createRisk}
      />
      {riskEditing && (
        <RecordFormDialog
          key={riskEditing.id}
          title={`Edit — ${riskEditing.title}`}
          submitLabel="Save changes"
          fields={riskFields}
          initialValues={riskInitial(riskEditing)}
          open={riskEditId !== null}
          onOpenChange={(o) => !o && setRiskEditId(null)}
          onSubmit={editRisk}
        />
      )}

      {/* Decision create / edit */}
      <RecordFormDialog
        title="New Decision"
        description="Record an architecture or portfolio decision and its rationale."
        submitLabel="Log decision"
        fields={decisionFields}
        open={decisionCreate}
        onOpenChange={setDecisionCreate}
        onSubmit={createDecision}
      />
      {decisionEditing && (
        <RecordFormDialog
          key={decisionEditing.id}
          title={`Edit — ${decisionEditing.title}`}
          submitLabel="Save changes"
          fields={decisionFields}
          initialValues={decisionInitial(decisionEditing)}
          open={decisionEditId !== null}
          onOpenChange={(o) => !o && setDecisionEditId(null)}
          onSubmit={editDecision}
        />
      )}

      {riskViewing && (
        <DetailDrawer
          open={riskViewId !== null}
          onOpenChange={(o) => !o && setRiskViewId(null)}
          title={riskViewing.title}
          subtitle={`${scopeLabel[riskViewing.scope.type]} · ${riskViewing.scope.label}`}
          entityKind="risk"
          badges={
            <>
              <StatusBadge label={riskViewing.severity} tone={riskTone[riskViewing.severity]} />
              <StatusBadge label={riskViewing.status} />
            </>
          }
          sections={[
            {
              heading: "Risk detail",
              fields: [
                { label: "Type", value: riskViewing.type },
                { label: "Likelihood", value: riskViewing.likelihood },
                { label: "Owner", value: findPerson(riskViewing.ownerId)?.name ?? "—" },
                { label: "Raised", value: riskViewing.raisedDate || "—" },
                { label: "Impact", value: riskViewing.impact, full: true },
                { label: "Mitigation plan", value: riskViewing.mitigationPlan, full: true },
              ],
            },
          ]}
          onEdit={() => {
            setRiskEditId(riskViewing.id);
            setRiskViewId(null);
          }}
          onDelete={() => {
            riskStore.remove(riskViewing.id);
            toast({ title: "Risk deleted", description: `${riskViewing.title} was removed.` });
          }}
        />
      )}
    </div>
  );
}

function Heatmap({ risks }: { risks: ApmRisk[] }) {
  const sevs: RiskSeverity[] = ["Low", "Medium", "High", "Critical"];
  const likes: RiskLikelihood[] = ["Unlikely", "Possible", "Likely", "Almost Certain"];
  const counts: Record<string, number> = {};
  risks.forEach((r) => {
    const key = `${r.severity}::${r.likelihood}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });
  const tone = (sev: string, like: string) => {
    const score = sevs.indexOf(sev as RiskSeverity) * likes.indexOf(like as RiskLikelihood);
    if (score >= 6) return "bg-destructive/15 text-destructive border-destructive/30";
    if (score >= 3) return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-success/10 text-success border-success/30";
  };
  return (
    <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] gap-2 text-xs">
      <div />
      {likes.map((l) => (
        <div key={l} className="px-2 py-1 text-center font-medium text-muted-foreground">{l}</div>
      ))}
      {[...sevs].reverse().map((sev) => (
        <Fragment key={sev}>
          <div className="px-2 py-3 font-medium text-muted-foreground">{sev}</div>
          {likes.map((like) => {
            const c = counts[`${sev}::${like}`] ?? 0;
            return (
              <div
                key={`${sev}-${like}`}
                className={cn(
                  "flex h-14 items-center justify-center rounded-md border text-base font-semibold",
                  c > 0 ? tone(sev, like) : "border-border bg-muted/40 text-muted-foreground",
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

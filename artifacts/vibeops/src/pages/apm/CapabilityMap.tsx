import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Layers, AppWindow, AlertTriangle, Sparkles, Plus } from "lucide-react";
import type { Capability } from "@/data/apm/capabilities";
import type { BusinessApplication } from "@/data/apm/applications";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { dispositionTone, riskTone, healthBarColor } from "@/components/apm/tone";
import { money } from "@/components/consulting/format";

const TOP_LEVEL = "(Top-level capability)";

export default function CapabilityMap() {
  const { capabilities: capStore, applications } = useApmData();
  const capabilities = capStore.items;
  const apps = applications.items;
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const topLevel = capabilities.filter((c) => c.level === 1);
  const childrenOf = (id: string) => capabilities.filter((c) => c.parentId === id);
  const appsFor = (capId: string) => apps.filter((a) => a.capabilityIds.includes(capId));
  const editing = capabilities.find((c) => c.id === editId) ?? null;
  const viewing = capabilities.find((c) => c.id === viewId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "name", label: "Capability name", required: true, full: true },
      { name: "parent", label: "Parent capability", type: "select", options: [TOP_LEVEL, ...topLevel.map((c) => c.name)] },
      { name: "description", label: "Description", type: "textarea" },
    ],
    [topLevel],
  );

  const parentIdFor = (parentName: string) =>
    parentName && parentName !== TOP_LEVEL ? capabilities.find((c) => c.name === parentName)?.id ?? null : null;

  const handleCreate = (values: Record<string, string>) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const parentId = parentIdFor(values.parent);
    const cap: Capability = {
      id: `cap-${slug || Date.now()}`,
      name: values.name,
      parentId,
      level: parentId ? 2 : 1,
      description: values.description || "—",
    };
    capStore.add(cap);
    toast({ title: "Capability added", description: `${cap.name} added to the map.` });
  };

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    const parentId = parentIdFor(values.parent);
    capStore.update(editing.id, {
      name: values.name || editing.name,
      parentId,
      level: parentId ? 2 : 1,
      description: values.description || editing.description,
    });
    toast({ title: "Capability updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  const initialValues = (c: Capability): Record<string, string> => ({
    name: c.name,
    parent: c.parentId ? capabilities.find((p) => p.id === c.parentId)?.name ?? TOP_LEVEL : TOP_LEVEL,
    description: c.description,
  });

  const remove = (c: Capability) => {
    capStore.remove(c.id);
    toast({ title: "Capability deleted", description: `${c.name} was removed.` });
  };

  const totalApps = apps.length;
  const mappedApps = new Set(apps.flatMap((a) => (a.capabilityIds.length ? [a.id] : []))).size;
  const aiCandidates = apps.filter((a) => a.aiReadiness === "High").length;
  const atRisk = apps.filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Capability Map"
        description="A lightweight business capability view — capabilities, the applications that realize them, and where risk and modernization concentrate."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Capability
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Capabilities" value={capabilities.length} icon={<Layers className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Mapped Applications" value={mappedApps} subtitle={`of ${totalApps}`} icon={<AppWindow className="h-5 w-5" />} delay={0.1} />
        <KpiCard
          title="Capabilities With Risk"
          value={topLevel.filter((c) => {
            const ids = [c.id, ...childrenOf(c.id).map((x) => x.id)];
            return apps.some((a) => a.capabilityIds.some((cid) => ids.includes(cid)) && (a.riskLevel === "High" || a.riskLevel === "Critical"));
          }).length}
          subtitle={`${atRisk} apps at risk`}
          trendType="bad"
          icon={<AlertTriangle className="h-5 w-5" />}
          delay={0.15}
        />
        <KpiCard title="AI Candidates" value={aiCandidates} subtitle="high AI readiness" icon={<Sparkles className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="space-y-5">
        {topLevel.map((cap) => {
          const children = childrenOf(cap.id);
          const directApps = appsFor(cap.id);
          const childIds = children.map((c) => c.id);
          const allApps = apps.filter((a) => a.capabilityIds.some((cid) => cid === cap.id || childIds.includes(cid)));
          const capCost = allApps.reduce((s, a) => s + a.annualCost, 0);
          const capRisk = allApps.filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical").length;
          const capAi = allApps.filter((a) => a.aiReadiness === "High").length;

          return (
            <div key={cap.id} className="rounded-lg border border-border bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <button onClick={() => setViewId(cap.id)} className="text-base font-medium text-foreground hover:text-primary">
                      {cap.name}
                    </button>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{cap.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{allApps.length} apps</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{money(capCost)}/yr</span>
                  {capRisk > 0 && <StatusBadge label={`${capRisk} at risk`} tone="danger" />}
                  {capAi > 0 && <StatusBadge label={`${capAi} AI-ready`} tone="success" />}
                  <RowActions
                    entityName={cap.name}
                    entityKind="capability"
                    onView={() => setViewId(cap.id)}
                    onEdit={() => setEditId(cap.id)}
                    onDelete={() => remove(cap)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <CapabilityGroup
                    key={child.id}
                    name={child.name}
                    apps={appsFor(child.id)}
                    actions={
                      <RowActions
                        entityName={child.name}
                        entityKind="capability"
                        onView={() => setViewId(child.id)}
                        onEdit={() => setEditId(child.id)}
                        onDelete={() => remove(child)}
                      />
                    }
                  />
                ))}
                {directApps.length > 0 && <CapabilityGroup name="Directly mapped" apps={directApps} />}
              </div>
            </div>
          );
        })}
      </div>

      <RecordFormDialog
        title="New Capability"
        description="Add a business capability. Choose a parent to make it a sub-capability."
        submitLabel="Add capability"
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
          onSubmit={handleEdit}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={viewing.level === 1 ? "Top-level capability" : `Sub-capability of ${capabilities.find((c) => c.id === viewing.parentId)?.name ?? "—"}`}
          entityKind="capability"
          sections={[
            {
              fields: [
                { label: "Level", value: `L${viewing.level}` },
                { label: "Applications", value: appsFor(viewing.id).length || "—" },
                { label: "Description", value: viewing.description, full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => remove(viewing)}
        >
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applications</div>
            <div className="flex flex-wrap gap-1.5">
              {appsFor(viewing.id).map((a) => (
                <Link key={a.id} href={`/applications/${a.id}`} className="rounded bg-muted px-2 py-0.5 text-xs text-foreground hover:text-primary">
                  {a.name}
                </Link>
              ))}
              {appsFor(viewing.id).length === 0 && <span className="text-xs text-muted-foreground">No applications mapped.</span>}
            </div>
          </div>
        </DetailDrawer>
      )}
    </div>
  );
}

function CapabilityGroup({
  name,
  apps,
  actions,
}: {
  name: string;
  apps: BusinessApplication[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{name}</div>
        {actions}
      </div>
      <div className="space-y-2">
        {apps.map((a) => (
          <Link key={a.id} href={`/applications/${a.id}`} className="block rounded-md border border-border p-2.5 transition-colors hover:bg-muted/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{a.name}</span>
              <StatusBadge label={a.disposition} tone={dispositionTone[a.disposition]} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${healthBarColor(a.healthScore)}`} style={{ width: `${a.healthScore}%` }} />
              </div>
              <StatusBadge label={a.riskLevel} tone={riskTone[a.riskLevel]} />
            </div>
          </Link>
        ))}
        {apps.length === 0 && (
          <div className="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
            No applications
          </div>
        )}
      </div>
    </div>
  );
}

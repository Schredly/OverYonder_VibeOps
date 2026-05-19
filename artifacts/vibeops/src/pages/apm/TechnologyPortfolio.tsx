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
import { Cpu, ShieldAlert, Sparkles, RefreshCw, Plus } from "lucide-react";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import {
  type Technology,
  type TechKind,
  type StandardStatus,
  type TechLifecycle,
} from "@/data/apm/technologies";
import { applicationsForTechnology } from "@/data/apm/applications";

const KINDS: TechKind[] = ["Standard", "Product"];
const STANDARD_STATUSES: StandardStatus[] = ["Approved", "Emerging", "Non-Standard", "Retired"];
const LIFECYCLE_STATUSES: TechLifecycle[] = [
  "Current",
  "Mainstream",
  "Declining",
  "End of Life",
  "End of Support",
];
const YES_NO = ["Yes", "No"] as const;

const standardTone: Record<StandardStatus, "success" | "info" | "warning" | "danger"> = {
  Approved: "success",
  Emerging: "info",
  "Non-Standard": "warning",
  Retired: "danger",
};

function lifecycleTone(s: TechLifecycle) {
  if (/End of/.test(s)) return "danger" as const;
  if (s === "Declining") return "warning" as const;
  return "success" as const;
}

const techFields: FormField[] = [
  { name: "name", label: "Technology name", required: true },
  { name: "category", label: "Category", required: true, placeholder: "Database, Language / Runtime…" },
  { name: "vendor", label: "Vendor" },
  { name: "kind", label: "Kind", type: "select", options: KINDS },
  { name: "standardStatus", label: "Standard status", type: "select", options: STANDARD_STATUSES },
  { name: "lifecycleStatus", label: "Lifecycle", type: "select", options: LIFECYCLE_STATUSES },
  { name: "eolDate", label: "EOL / EOS date", placeholder: "YYYY-MM-DD" },
  { name: "aiUpgradeCandidate", label: "AI upgrade candidate", type: "select", options: YES_NO },
  { name: "replacementCandidate", label: "Replacement candidate", type: "select", options: YES_NO },
];

function techInitialValues(t: Technology): Record<string, string> {
  return {
    name: t.name,
    category: t.category,
    vendor: t.vendor,
    kind: t.kind,
    standardStatus: t.standardStatus,
    lifecycleStatus: t.lifecycleStatus,
    eolDate: t.eolDate ?? "",
    aiUpgradeCandidate: t.aiUpgradeCandidate ? "Yes" : "No",
    replacementCandidate: t.replacementCandidate ? "Yes" : "No",
  };
}

function techPatch(values: Record<string, string>, t: Technology): Partial<Technology> {
  return {
    name: values.name || t.name,
    category: values.category || t.category,
    vendor: values.vendor || t.vendor,
    kind: (values.kind as TechKind) || t.kind,
    standardStatus: (values.standardStatus as StandardStatus) || t.standardStatus,
    lifecycleStatus: (values.lifecycleStatus as TechLifecycle) || t.lifecycleStatus,
    eolDate: values.eolDate || undefined,
    aiUpgradeCandidate: values.aiUpgradeCandidate === "Yes",
    replacementCandidate: values.replacementCandidate === "Yes",
  };
}

function newTechnology(values: Record<string, string>): Technology {
  const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `tech-${slug || Date.now()}`,
    name: values.name,
    category: values.category || "Uncategorized",
    vendor: values.vendor || "—",
    kind: (values.kind as TechKind) || "Product",
    standardStatus: (values.standardStatus as StandardStatus) || "Emerging",
    lifecycleStatus: (values.lifecycleStatus as TechLifecycle) || "Current",
    eolDate: values.eolDate || undefined,
    usedByAppIds: [],
    aiUpgradeCandidate: values.aiUpgradeCandidate === "Yes",
    replacementCandidate: values.replacementCandidate === "Yes",
  };
}

export default function TechnologyPortfolio() {
  const { technologies: techStore } = useApmData();
  const technologies = techStore.items;
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [standard, setStandard] = useState("");
  const [category, setCategory] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(technologies.map((t) => t.category))), [technologies]);
  const viewing = technologies.find((t) => t.id === viewId) ?? null;
  const editing = technologies.find((t) => t.id === editId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return technologies.filter((t) => {
      if (q && !`${t.name} ${t.vendor} ${t.category}`.toLowerCase().includes(q)) return false;
      if (standard && t.standardStatus !== standard) return false;
      if (category && t.category !== category) return false;
      return true;
    });
  }, [technologies, search, standard, category]);

  const eolRisk = technologies.filter((t) => /End of/.test(t.lifecycleStatus)).length;
  const nonStandard = technologies.filter((t) => t.standardStatus === "Non-Standard" || t.standardStatus === "Retired").length;
  const aiUpgrade = technologies.filter((t) => t.aiUpgradeCandidate).length;
  const replace = technologies.filter((t) => t.replacementCandidate).length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Technology Portfolio"
        description="Technology standards and products — approval status, lifecycle, end-of-life risk, and where each is used."
        actions={
          <RecordFormDialog
            title="New Technology"
            description="Register a technology standard or product in the portfolio."
            submitLabel="Add technology"
            fields={techFields}
            onSubmit={(values) => {
              const tech = newTechnology(values);
              techStore.add(tech);
              toast({ title: "Technology added", description: `${tech.name} is now tracked.` });
            }}
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />New Technology
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Technologies Tracked" value={technologies.length} icon={<Cpu className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="EOL / EOS Risk" value={eolRisk} subtitle="unsupported" trend={1} trendDirection="up" trendType="bad" icon={<ShieldAlert className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="AI Upgrade Candidates" value={aiUpgrade} icon={<Sparkles className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Replacement Candidates" value={replace} subtitle={`${nonStandard} non-standard`} icon={<RefreshCw className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search technologies, vendors…"
        summary={`${filtered.length} of ${technologies.length}`}
        filters={
          <>
            <FilterSelect label="Standard" value={standard} onChange={setStandard} options={STANDARD_STATUSES} />
            <FilterSelect label="Category" value={category} onChange={setCategory} options={categories} />
          </>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Technology</th>
              <th className="p-3">Category</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">Standard</th>
              <th className="p-3">Lifecycle</th>
              <th className="p-3">EOL/EOS</th>
              <th className="p-3">Used by</th>
              <th className="p-3">Flags</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => {
              const apps = applicationsForTechnology(t.id);
              return (
                <tr key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(t.id)}>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.kind}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{t.category}</td>
                  <td className="p-3 text-muted-foreground">{t.vendor}</td>
                  <td className="p-3"><StatusBadge label={t.standardStatus} tone={standardTone[t.standardStatus]} /></td>
                  <td className="p-3"><StatusBadge label={t.lifecycleStatus} tone={lifecycleTone(t.lifecycleStatus)} /></td>
                  <td className="p-3 text-muted-foreground">{t.eolDate ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {apps.slice(0, 3).map((a) => (
                        <Link key={a.id} href={`/applications/${a.id}`} onClick={(e) => e.stopPropagation()} className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground hover:text-primary">
                          {a.name}
                        </Link>
                      ))}
                      {apps.length > 3 && <span className="px-1 text-xs text-muted-foreground">+{apps.length - 3}</span>}
                      {apps.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {t.aiUpgradeCandidate && <StatusBadge label="AI upgrade" tone="primary" />}
                      {t.replacementCandidate && <StatusBadge label="Replace" tone="danger" />}
                      {!t.aiUpgradeCandidate && !t.replacementCandidate && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <RowActions
                      entityName={t.name}
                      entityKind="technology"
                      onView={() => setViewId(t.id)}
                      onEdit={() => setEditId(t.id)}
                      onDelete={() => {
                        techStore.remove(t.id);
                        toast({ title: "Technology deleted", description: `${t.name} was removed.` });
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
            No technologies match the current filters.
          </div>
        )}
      </div>

      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={`${viewing.category} · ${viewing.vendor}`}
          entityKind="technology"
          badges={
            <>
              <StatusBadge label={viewing.standardStatus} tone={standardTone[viewing.standardStatus]} />
              <StatusBadge label={viewing.lifecycleStatus} tone={lifecycleTone(viewing.lifecycleStatus)} />
            </>
          }
          sections={[
            {
              heading: "Profile",
              fields: [
                { label: "Kind", value: viewing.kind },
                { label: "Category", value: viewing.category },
                { label: "Vendor", value: viewing.vendor },
                { label: "EOL / EOS", value: viewing.eolDate ?? "—" },
                { label: "AI upgrade candidate", value: viewing.aiUpgradeCandidate ? "Yes" : "No" },
                { label: "Replacement candidate", value: viewing.replacementCandidate ? "Yes" : "No" },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            techStore.remove(viewing.id);
            toast({ title: "Technology deleted", description: `${viewing.name} was removed.` });
          }}
        >
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Used by applications
            </div>
            <div className="flex flex-wrap gap-1.5">
              {applicationsForTechnology(viewing.id).map((a) => (
                <Link key={a.id} href={`/applications/${a.id}`} className="rounded bg-muted px-2 py-0.5 text-xs text-foreground hover:text-primary">
                  {a.name}
                </Link>
              ))}
              {applicationsForTechnology(viewing.id).length === 0 && (
                <span className="text-xs text-muted-foreground">Not currently used by any application.</span>
              )}
            </div>
          </div>
        </DetailDrawer>
      )}

      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          submitLabel="Save changes"
          fields={techFields}
          initialValues={techInitialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            techStore.update(editing.id, techPatch(values, editing));
            toast({ title: "Technology updated", description: `${values.name || editing.name} saved.` });
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

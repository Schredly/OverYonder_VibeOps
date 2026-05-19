import { useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import { Button } from "@/components/ui/button";
import { Plus, BadgeCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
  CERT_TYPES,
  type AttestationStatus,
  type CertificationCampaign,
  type CertType,
} from "@/data/apm/certifications";
import { findApplication } from "@/data/apm/applications";
import { findPerson, internalUsers } from "@/data/apm/people";
import { certTone } from "@/components/apm/tone";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_STATUSES: CertificationCampaign["status"][] = ["Active", "Closing", "Complete", "Draft"];

const campaignFields: FormField[] = [
  { name: "name", label: "Campaign name", required: true, full: true },
  { name: "type", label: "Type", type: "select", required: true, options: CERT_TYPES },
  { name: "status", label: "Status", type: "select", options: CAMPAIGN_STATUSES },
  { name: "owner", label: "Campaign owner", type: "select", options: internalUsers.map((u) => u.name) },
  { name: "dueDate", label: "Due date", placeholder: "YYYY-MM-DD", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

function completion(statuses: AttestationStatus[]) {
  if (statuses.length === 0) return 0;
  return Math.round((statuses.filter((s) => s === "Certified").length / statuses.length) * 100);
}

export default function CertificationCenter() {
  const { campaigns: campaignStore } = useApmData();
  const campaigns = campaignStore.items;
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(campaigns[0]?.id ?? null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const campaign = campaigns.find((c) => c.id === activeId) ?? campaigns[0] ?? null;
  const editing = campaigns.find((c) => c.id === editId) ?? null;

  const allAtt = campaigns.flatMap((c) => c.attestations);
  const certified = allAtt.filter((a) => a.status === "Certified").length;
  const overdue = allAtt.filter((a) => a.status === "Overdue").length;
  const inProgress = allAtt.filter((a) => a.status === "In Progress").length;

  const handleCreate = (values: Record<string, string>) => {
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const created: CertificationCampaign = {
      id: `cert-${slug || Date.now()}`,
      name: values.name,
      type: (values.type as CertType) || "Owner Validation",
      description: values.description || "—",
      dueDate: values.dueDate || "",
      status: (values.status as CertificationCampaign["status"]) || "Draft",
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? internalUsers[0].id,
      attestations: [],
    };
    campaignStore.add(created);
    setActiveId(created.id);
    toast({ title: "Campaign launched", description: `${created.name} created.` });
  };

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    campaignStore.update(editing.id, {
      name: values.name || editing.name,
      type: (values.type as CertType) || editing.type,
      status: (values.status as CertificationCampaign["status"]) || editing.status,
      ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? editing.ownerId,
      dueDate: values.dueDate || editing.dueDate,
      description: values.description || editing.description,
    });
    toast({ title: "Campaign updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  const handleDelete = (c: CertificationCampaign) => {
    campaignStore.remove(c.id);
    if (activeId === c.id) setActiveId(campaigns.find((x) => x.id !== c.id)?.id ?? null);
    toast({ title: "Campaign deleted", description: `${c.name} was removed.` });
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Certification Center"
        description="Campaigns for application owner attestation — owner, lifecycle, risk, AI readiness, data sensitivity, and vendor review."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New Campaign
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Campaigns" value={campaigns.filter((c) => c.status === "Active" || c.status === "Closing").length} icon={<BadgeCheck className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Attestations Certified" value={certified} subtitle={`of ${allAtt.length}`} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Overdue" value={overdue} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {campaigns.map((c) => {
            const pct = completion(c.attestations.map((a) => a.status));
            return (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-colors ${
                  campaign?.id === c.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <StatusBadge label={c.status} tone={c.status === "Complete" ? "success" : c.status === "Draft" ? "neutral" : "primary"} />
                    <RowActions
                      entityName={c.name}
                      entityKind="campaign"
                      onView={() => setActiveId(c.id)}
                      onEdit={() => setEditId(c.id)}
                      onDelete={() => handleDelete(c)}
                    />
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{c.type} · due {c.dueDate}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No campaigns yet.
            </div>
          )}
        </div>

        {campaign ? (
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-foreground">{campaign.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-foreground">{completion(campaign.attestations.map((a) => a.status))}%</div>
                  <div className="text-xs text-muted-foreground">
                    certified · owner {findPerson(campaign.ownerId)?.name}
                  </div>
                </div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Application</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Consultant assist</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaign.attestations.map((att) => (
                  <tr key={att.appId} className="hover:bg-muted/40">
                    <td className="p-3">
                      <Link href={`/applications/${att.appId}`} className="font-medium text-foreground hover:text-primary">
                        {findApplication(att.appId)?.name ?? att.appId}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{findPerson(att.ownerId)?.name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{att.consultantId ? findPerson(att.consultantId)?.name : "—"}</td>
                    <td className="p-3"><StatusBadge label={att.status} tone={certTone[att.status]} /></td>
                    <td className="p-3 text-muted-foreground">{att.completedDate ?? "—"}</td>
                  </tr>
                ))}
                {campaign.attestations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      No attestations in this campaign yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Create a certification campaign to get started.
          </div>
        )}
      </div>

      <RecordFormDialog
        title="New Certification Campaign"
        description="Launch an attestation campaign across the application portfolio."
        submitLabel="Launch campaign"
        fields={campaignFields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          submitLabel="Save changes"
          fields={campaignFields}
          initialValues={{
            name: editing.name,
            type: editing.type,
            status: editing.status,
            owner: findPerson(editing.ownerId)?.name ?? "",
            dueDate: editing.dueDate,
            description: editing.description,
          }}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

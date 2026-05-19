import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import { internalUsers } from "@/data/apm/people";
import { topLevelCapabilities, capabilities } from "@/data/apm/capabilities";
import {
  CRITICALITIES,
  DISPOSITIONS,
  LIFECYCLE_STAGES,
  type BusinessApplication,
  type Criticality,
  type Disposition,
  type LifecycleStage,
} from "@/data/apm/applications";

interface NewApplicationDialogProps {
  trigger: ReactNode;
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function NewApplicationDialog({ trigger }: NewApplicationDialogProps) {
  const { applications } = useApmData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "",
    description: "",
    ownerId: internalUsers[0].id,
    businessUnit: "",
    capabilityId: topLevelCapabilities[0].id,
    lifecycleStage: "Production" as LifecycleStage,
    businessCriticality: "Medium" as Criticality,
    disposition: "Tolerate" as Disposition,
    annualCost: "",
    vendor: "",
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `app-${Date.now()}`;
    const app: BusinessApplication = {
      id: `app-${id}`,
      name: f.name,
      description: f.description || "—",
      ownerId: f.ownerId,
      businessUnit: f.businessUnit || "Unassigned",
      capabilityIds: [f.capabilityId],
      lifecycleStage: f.lifecycleStage,
      businessCriticality: f.businessCriticality,
      annualCost: Number(f.annualCost.replace(/[$,]/g, "")) || 0,
      healthScore: 75,
      riskLevel: "Medium",
      techDebtScore: 30,
      aiReadiness: "Not Assessed",
      cloudReadiness: "On-Prem",
      disposition: f.disposition,
      certStatus: "Not Started",
      technologyIds: [],
      vendor: f.vendor || "In-House",
      hostingModel: "On-Prem",
      userCount: 0,
      consultantIds: [],
      services: [],
      integrations: [],
      dataObjects: [],
    };
    applications.add(app);
    toast({ title: "Application added", description: `${app.name} is now in the portfolio.` });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Business Application</DialogTitle>
          <DialogDescription>
            Register an application in the portfolio. Technologies, integrations,
            and assessments can be added from the application detail page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6 py-2">
          <Section title="Identity">
            <Field label="Application name" required>
              <input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Order Hub" className={inputClass} />
            </Field>
            <Field label="Business unit">
              <input value={f.businessUnit} onChange={(e) => set("businessUnit", e.target.value)} placeholder="Commercial, Finance, …" className={inputClass} />
            </Field>
            <Field label="Description" full>
              <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="What this application does" className={inputClass} />
            </Field>
          </Section>

          <Section title="Ownership & capability">
            <Field label="Internal owner">
              <select value={f.ownerId} onChange={(e) => set("ownerId", e.target.value)} className={inputClass}>
                {internalUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
                ))}
              </select>
            </Field>
            <Field label="Primary capability">
              <select value={f.capabilityId} onChange={(e) => set("capabilityId", e.target.value)} className={inputClass}>
                {capabilities.map((c) => (
                  <option key={c.id} value={c.id}>{c.level === 2 ? "— " : ""}{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Vendor">
              <input value={f.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="In-House, SAP, …" className={inputClass} />
            </Field>
            <Field label="Annual cost ($)">
              <input value={f.annualCost} onChange={(e) => set("annualCost", e.target.value)} placeholder="500,000" className={inputClass} />
            </Field>
          </Section>

          <Section title="Lifecycle & strategy">
            <Field label="Lifecycle stage">
              <select value={f.lifecycleStage} onChange={(e) => set("lifecycleStage", e.target.value as LifecycleStage)} className={inputClass}>
                {LIFECYCLE_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Business criticality">
              <select value={f.businessCriticality} onChange={(e) => set("businessCriticality", e.target.value as Criticality)} className={inputClass}>
                {CRITICALITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Disposition">
              <select value={f.disposition} onChange={(e) => set("disposition", e.target.value as Disposition)} className={inputClass}>
                {DISPOSITIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </Section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Add application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <label className={`space-y-1.5 text-sm ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-1 text-foreground">
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
      </div>
      {children}
    </label>
  );
}

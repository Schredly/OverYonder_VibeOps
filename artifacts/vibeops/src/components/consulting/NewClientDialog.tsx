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
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import type { Client, Region, StrategicTier, AIMaturity, RenewalRisk } from "@/data/consulting/clients";

const REGIONS: Region[] = ["AMER", "EMEA", "APAC", "LATAM"];
const TIERS: StrategicTier[] = ["Platinum", "Gold", "Silver", "Emerging"];
const MATURITIES: AIMaturity[] = ["Exploring", "Piloting", "Scaling", "Industrialized"];
const RISKS: RenewalRisk[] = ["Low", "Medium", "High"];

interface NewClientDialogProps {
  trigger: ReactNode;
}

interface FormState {
  name: string;
  industry: string;
  region: Region;
  accountOwner: string;
  executiveSponsor: string;
  arr: string;
  strategicTier: StrategicTier;
  aiMaturity: AIMaturity;
  renewalRisk: RenewalRisk;
}

const blank: FormState = {
  name: "",
  industry: "",
  region: "AMER",
  accountOwner: "",
  executiveSponsor: "",
  arr: "",
  strategicTier: "Gold",
  aiMaturity: "Piloting",
  renewalRisk: "Low",
};

export default function NewClientDialog({ trigger }: NewClientDialogProps) {
  const { clients } = useConsultingData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arr = Number(form.arr.replace(/[$,]/g, ""));
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `client-${Date.now()}`;
    const client: Client = {
      id,
      name: form.name,
      industry: form.industry || "Other",
      region: form.region,
      accountOwner: form.accountOwner || "Unassigned",
      executiveSponsor: form.executiveSponsor || "TBD",
      arr: Number.isFinite(arr) ? arr : 0,
      activeEngagements: 0,
      healthScore: 75,
      renewalRisk: form.renewalRisk,
      expansionOpportunity: 0,
      strategicTier: form.strategicTier,
      aiMaturity: form.aiMaturity,
      deliveryRisk: "Healthy",
      lastExecutiveReview: new Date().toISOString().slice(0, 10),
      logo: form.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "??",
      stakeholders: [],
    };
    clients.add(client);
    toast({
      title: "Client added",
      description: `${client.name} has been added to the portfolio.`,
    });
    setForm(blank);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>
            Add a new enterprise account to the consulting portfolio. You can refine
            stakeholders, ARR, and engagements after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <Section title="Account">
            <Field label="Client name" required>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Atlas Federal Bank"
                className={inputClass}
              />
            </Field>
            <Field label="Industry">
              <input
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="Banking, Healthcare, …"
                className={inputClass}
              />
            </Field>
            <Field label="Region">
              <select value={form.region} onChange={(e) => update("region", e.target.value as Region)} className={inputClass}>
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Strategic tier">
              <select
                value={form.strategicTier}
                onChange={(e) => update("strategicTier", e.target.value as StrategicTier)}
                className={inputClass}
              >
                {TIERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Sponsorship & sizing">
            <Field label="Account owner">
              <input
                value={form.accountOwner}
                onChange={(e) => update("accountOwner", e.target.value)}
                placeholder="Partner name"
                className={inputClass}
              />
            </Field>
            <Field label="Executive sponsor (client)">
              <input
                value={form.executiveSponsor}
                onChange={(e) => update("executiveSponsor", e.target.value)}
                placeholder="e.g. Maria Chen, CIO"
                className={inputClass}
              />
            </Field>
            <Field label="ARR ($)">
              <input
                value={form.arr}
                onChange={(e) => update("arr", e.target.value)}
                placeholder="2,500,000"
                className={inputClass}
              />
            </Field>
            <Field label="Renewal risk">
              <select value={form.renewalRisk} onChange={(e) => update("renewalRisk", e.target.value as RenewalRisk)} className={inputClass}>
                {RISKS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="AI posture">
            <Field label="AI maturity">
              <select
                value={form.aiMaturity}
                onChange={(e) => update("aiMaturity", e.target.value as AIMaturity)}
                className={inputClass}
              >
                {MATURITIES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </Section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm">
      <div className="flex items-center gap-1 text-foreground">
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
      </div>
      {children}
    </label>
  );
}

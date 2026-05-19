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
import { Plus, Building2, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import NewClientDialog from "@/components/consulting/NewClientDialog";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money, pct } from "@/components/consulting/format";
import type {
  Client,
  StrategicTier,
  Region,
  RenewalRisk,
  AIMaturity,
  DeliveryRiskLevel,
} from "@/data/consulting/clients";

const tierTone = {
  Platinum: "primary",
  Gold: "warning",
  Silver: "neutral",
  Emerging: "info",
} as const;

const REGIONS: Region[] = ["AMER", "EMEA", "APAC", "LATAM"];
const TIERS: StrategicTier[] = ["Platinum", "Gold", "Silver", "Emerging"];
const RENEWAL_RISKS: RenewalRisk[] = ["Low", "Medium", "High"];
const AI_MATURITIES: AIMaturity[] = ["Exploring", "Piloting", "Scaling", "Industrialized"];
const DELIVERY_RISKS: DeliveryRiskLevel[] = ["Healthy", "At Risk", "Critical"];

const clientFields: FormField[] = [
  { name: "name", label: "Client name", required: true, full: true },
  { name: "industry", label: "Industry" },
  { name: "region", label: "Region", type: "select", options: REGIONS },
  { name: "accountOwner", label: "Account owner" },
  { name: "executiveSponsor", label: "Executive sponsor" },
  { name: "strategicTier", label: "Strategic tier", type: "select", options: TIERS },
  { name: "aiMaturity", label: "AI maturity", type: "select", options: AI_MATURITIES },
  { name: "arr", label: "ARR ($)", type: "number" },
  { name: "expansionOpportunity", label: "Expansion opportunity ($)", type: "number" },
  { name: "activeEngagements", label: "Active engagements", type: "number" },
  { name: "healthScore", label: "Health score (0-100)", type: "number" },
  { name: "renewalRisk", label: "Renewal risk", type: "select", options: RENEWAL_RISKS },
  { name: "deliveryRisk", label: "Delivery risk", type: "select", options: DELIVERY_RISKS },
];

export default function ClientPortfolio() {
  const { clients } = useConsultingData();
  const items = clients.items;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [region, setRegion] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const editing = items.find((c) => c.id === editId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (q && !`${c.name} ${c.industry} ${c.accountOwner}`.toLowerCase().includes(q)) return false;
      if (tier && c.strategicTier !== tier) return false;
      if (region && c.region !== region) return false;
      return true;
    });
  }, [items, search, tier, region]);

  const totalArr = items.reduce((s, c) => s + c.arr, 0);
  const totalExpansion = items.reduce((s, c) => s + c.expansionOpportunity, 0);
  const atRisk = items.filter((c) => c.renewalRisk !== "Low").length;
  const platinum = items.filter((c) => c.strategicTier === "Platinum").length;

  const initialValues = (c: Client): Record<string, string> => ({
    name: c.name,
    industry: c.industry,
    region: c.region,
    accountOwner: c.accountOwner,
    executiveSponsor: c.executiveSponsor,
    strategicTier: c.strategicTier,
    aiMaturity: c.aiMaturity,
    arr: String(c.arr),
    expansionOpportunity: String(c.expansionOpportunity),
    activeEngagements: String(c.activeEngagements),
    healthScore: String(c.healthScore),
    renewalRisk: c.renewalRisk,
    deliveryRisk: c.deliveryRisk,
  });

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    clients.update(editing.id, {
      name: values.name || editing.name,
      industry: values.industry || editing.industry,
      region: (values.region as Region) || editing.region,
      accountOwner: values.accountOwner || editing.accountOwner,
      executiveSponsor: values.executiveSponsor || editing.executiveSponsor,
      strategicTier: (values.strategicTier as StrategicTier) || editing.strategicTier,
      aiMaturity: (values.aiMaturity as AIMaturity) || editing.aiMaturity,
      arr: Number(values.arr) || editing.arr,
      expansionOpportunity: Number(values.expansionOpportunity) || editing.expansionOpportunity,
      activeEngagements: Number(values.activeEngagements) || editing.activeEngagements,
      healthScore: Number(values.healthScore) || editing.healthScore,
      renewalRisk: (values.renewalRisk as RenewalRisk) || editing.renewalRisk,
      deliveryRisk: (values.deliveryRisk as DeliveryRiskLevel) || editing.deliveryRisk,
    });
    toast({ title: "Client updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Client Portfolio"
        description="Enterprise consulting clients, ARR, expansion potential, and account health."
        actions={
          <NewClientDialog
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Active Clients" value={items.length} icon={<Building2 className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Portfolio ARR" value={totalArr / 1_000_000} prefix="$" suffix="M" trend={6.4} icon={<DollarSign className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Expansion Pipeline" value={totalExpansion / 1_000_000} prefix="$" suffix="M" subtitle="identified" trend={11.2} icon={<TrendingUp className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Renewal Risk" value={atRisk} subtitle={`Platinum: ${platinum}`} trend={1} trendDirection="down" trendType="bad" icon={<Briefcase className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search clients, industry, account owner…"
        summary={`${filtered.length} of ${items.length} clients`}
        filters={
          <>
            <FilterSelect label="Tier" value={tier} onChange={setTier} options={TIERS} />
            <FilterSelect label="Region" value={region} onChange={setRegion} options={REGIONS} />
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
              <TableHead className="text-muted-foreground">Client</TableHead>
              <TableHead className="text-muted-foreground">Tier</TableHead>
              <TableHead className="text-muted-foreground">Industry</TableHead>
              <TableHead className="text-muted-foreground">Owner</TableHead>
              <TableHead className="text-muted-foreground">ARR</TableHead>
              <TableHead className="text-muted-foreground">Engagements</TableHead>
              <TableHead className="text-muted-foreground">Health</TableHead>
              <TableHead className="text-muted-foreground">Renewal Risk</TableHead>
              <TableHead className="text-muted-foreground">Expansion</TableHead>
              <TableHead className="text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer border-border transition-colors hover:bg-muted/40"
                onClick={() => navigate(`/consulting/clients/${c.id}`)}
              >
                <TableCell>
                  <Link
                    href={`/consulting/clients/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {c.logo}
                    </div>
                    <div>
                      <div className="font-medium text-foreground hover:text-primary">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.region} · {c.aiMaturity}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge label={c.strategicTier} tone={tierTone[c.strategicTier as StrategicTier]} />
                </TableCell>
                <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                <TableCell className="text-muted-foreground">{c.accountOwner}</TableCell>
                <TableCell className="font-medium text-foreground">{money(c.arr)}</TableCell>
                <TableCell className="text-muted-foreground">{c.activeEngagements}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          c.healthScore >= 80 ? "bg-success" : c.healthScore >= 65 ? "bg-amber-500" : "bg-destructive"
                        }`}
                        style={{ width: `${c.healthScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground">{c.healthScore}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge label={c.renewalRisk} tone={c.renewalRisk === "High" ? "danger" : c.renewalRisk === "Medium" ? "warning" : "success"} />
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {c.expansionOpportunity > 0 ? money(c.expansionOpportunity) : "—"}
                </TableCell>
                <TableCell>
                  <RowActions
                    entityName={c.name}
                    entityKind="client"
                    onView={() => navigate(`/consulting/clients/${c.id}`)}
                    onEdit={() => setEditId(c.id)}
                    onDelete={() => {
                      clients.remove(c.id);
                      toast({ title: "Client deleted", description: `${c.name} was removed.` });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                  No clients match the current filters. Try clearing search or filter values
                  ({pct(0)} match).
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          description="Update core client attributes. Stakeholders are managed on the client detail page."
          submitLabel="Save changes"
          fields={clientFields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

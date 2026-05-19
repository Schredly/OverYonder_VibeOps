import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ConsultingInvoice } from "@/data/consulting/timeBilling";
import { useConsultingData } from "@/context/ConsultingDataContext";
import { useToast } from "@/hooks/use-toast";
import { money } from "@/components/consulting/format";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const INVOICE_STATUSES: ConsultingInvoice["status"][] = ["Draft", "Sent", "Paid", "Overdue"];
const statusTone: Record<ConsultingInvoice["status"], "neutral" | "info" | "success" | "danger"> = {
  Draft: "neutral",
  Sent: "info",
  Paid: "success",
  Overdue: "danger",
};

export default function Billing() {
  const { invoices, clients, engagements, timeEntries } = useConsultingData();
  const invoiceList = invoices.items;
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const clientById = useMemo(() => Object.fromEntries(clients.items.map((c) => [c.id, c])), [clients.items]);
  const engagementById = useMemo(() => Object.fromEntries(engagements.items.map((e) => [e.id, e])), [engagements.items]);
  const viewing = invoiceList.find((i) => i.id === viewId) ?? null;
  const editing = invoiceList.find((i) => i.id === editId) ?? null;

  const fields = useMemo<FormField[]>(
    () => [
      { name: "invoiceNumber", label: "Invoice number", required: true },
      { name: "client", label: "Client", type: "select", required: true, options: clients.items.map((c) => c.name) },
      { name: "engagement", label: "Engagement", type: "select", options: engagements.items.map((e) => e.name) },
      { name: "period", label: "Period", placeholder: "Apr 2026" },
      { name: "hours", label: "Hours", type: "number" },
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "issued", label: "Issued", placeholder: "YYYY-MM-DD" },
      { name: "due", label: "Due", placeholder: "YYYY-MM-DD" },
      { name: "status", label: "Status", type: "select", options: INVOICE_STATUSES },
    ],
    [clients.items, engagements.items],
  );

  const initialValues = (inv: ConsultingInvoice): Record<string, string> => ({
    invoiceNumber: inv.invoiceNumber,
    client: clientById[inv.clientId]?.name ?? "",
    engagement: engagementById[inv.engagementId]?.name ?? "",
    period: inv.period,
    hours: String(inv.hours),
    amount: String(inv.amount),
    issued: inv.issued,
    due: inv.due,
    status: inv.status,
  });

  const patch = (values: Record<string, string>, inv: ConsultingInvoice): Partial<ConsultingInvoice> => ({
    invoiceNumber: values.invoiceNumber || inv.invoiceNumber,
    clientId: clients.items.find((c) => c.name === values.client)?.id ?? inv.clientId,
    engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? inv.engagementId,
    period: values.period || inv.period,
    hours: Number(values.hours) || inv.hours,
    amount: Number(values.amount) || inv.amount,
    issued: values.issued || inv.issued,
    due: values.due || inv.due,
    status: (values.status as ConsultingInvoice["status"]) || inv.status,
  });

  const handleCreate = (values: Record<string, string>) => {
    const inv: ConsultingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: values.invoiceNumber,
      clientId: clients.items.find((c) => c.name === values.client)?.id ?? "",
      engagementId: engagements.items.find((e) => e.name === values.engagement)?.id ?? "",
      period: values.period || "",
      hours: Number(values.hours) || 0,
      amount: Number(values.amount) || 0,
      issued: values.issued || "",
      due: values.due || "",
      status: (values.status as ConsultingInvoice["status"]) || "Draft",
    };
    invoices.add(inv);
    toast({ title: "Invoice created", description: `${inv.invoiceNumber} added.` });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoiceList.filter((inv) => {
      const cn = clientById[inv.clientId]?.name ?? "";
      if (q && !`${inv.invoiceNumber} ${cn}`.toLowerCase().includes(q)) return false;
      if (status && inv.status !== status) return false;
      return true;
    });
  }, [invoiceList, search, status, clientById]);

  const invoiced = invoiceList.reduce((s, i) => s + i.amount, 0);
  const paid = invoiceList.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const overdue = invoiceList.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);
  const unbilled = timeEntries.items
    .filter((t) => t.billable && t.status !== "Billed")
    .reduce((s, t) => s + t.hours * t.rate, 0);

  const byClient = clients.items
    .map((c) => ({
      name: c.name,
      value: invoiceList.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.amount, 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const palette = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Billing"
        description="Invoices, accounts receivable, unbilled time, and revenue by client."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export AR report
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />New Invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Invoiced" value={invoiced / 1_000_000} prefix="$" suffix="M" icon={<FileText className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Collected" value={paid / 1_000_000} prefix="$" suffix="M" subtitle={invoiced ? `${Math.round((paid / invoiced) * 100)}% of invoiced` : undefined} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Overdue AR" value={overdue / 1000} prefix="$" suffix="K" trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Unbilled Time" value={unbilled / 1000} prefix="$" suffix="K" subtitle="ready to invoice" icon={<DollarSign className="h-5 w-5" />} delay={0.2} />
      </div>

      <ChartCard title="Revenue by Client" subtitle="Invoiced to date">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byClient} layout="vertical" margin={{ top: 0, right: 24, left: 24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={150} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [money(v), "Invoiced"]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {byClient.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search invoices, clients…"
        summary={`${filtered.length} of ${invoiceList.length} invoices`}
        filters={<FilterSelect label="Status" value={status} onChange={setStatus} options={INVOICE_STATUSES} />}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Client</th>
              <th className="p-3">Engagement</th>
              <th className="p-3">Period</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Issued</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((inv) => (
              <tr key={inv.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(inv.id)}>
                <td className="p-3 font-medium text-foreground">{inv.invoiceNumber}</td>
                <td className="p-3 text-muted-foreground">{clientById[inv.clientId]?.name}</td>
                <td className="p-3 text-muted-foreground">{engagementById[inv.engagementId]?.name}</td>
                <td className="p-3 text-muted-foreground">{inv.period}</td>
                <td className="p-3 text-muted-foreground">{inv.hours}h</td>
                <td className="p-3 font-medium text-foreground">{money(inv.amount)}</td>
                <td className="p-3 text-muted-foreground">{inv.issued}</td>
                <td className="p-3 text-muted-foreground">{inv.due}</td>
                <td className="p-3"><StatusBadge label={inv.status} tone={statusTone[inv.status]} /></td>
                <td className="p-3">
                  <RowActions
                    entityName={inv.invoiceNumber}
                    entityKind="invoice"
                    onView={() => setViewId(inv.id)}
                    onEdit={() => setEditId(inv.id)}
                    onDelete={() => {
                      invoices.remove(inv.id);
                      toast({ title: "Invoice deleted", description: `${inv.invoiceNumber} was removed.` });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="border-t border-border p-12 text-center text-sm text-muted-foreground">
            No invoices match the current filters.
          </div>
        )}
      </div>

      <RecordFormDialog
        title="New Invoice"
        description="Raise an invoice for a client engagement."
        submitLabel="Create invoice"
        fields={fields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.invoiceNumber}`}
          submitLabel="Save changes"
          fields={fields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={(values) => {
            invoices.update(editing.id, patch(values, editing));
            toast({ title: "Invoice updated", description: `${values.invoiceNumber || editing.invoiceNumber} saved.` });
            setEditId(null);
          }}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.invoiceNumber}
          subtitle={clientById[viewing.clientId]?.name}
          entityKind="invoice"
          badges={<StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />}
          sections={[
            {
              heading: "Invoice",
              fields: [
                { label: "Engagement", value: engagementById[viewing.engagementId]?.name ?? "—", full: true },
                { label: "Period", value: viewing.period || "—" },
                { label: "Hours", value: `${viewing.hours}h` },
                { label: "Amount", value: money(viewing.amount) },
                { label: "Issued", value: viewing.issued || "—" },
                { label: "Due", value: viewing.due || "—" },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            invoices.remove(viewing.id);
            toast({ title: "Invoice deleted", description: `${viewing.invoiceNumber} was removed.` });
          }}
        />
      )}
    </div>
  );
}

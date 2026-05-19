import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Link2,
  Settings2,
} from "lucide-react";

interface SyncTarget {
  name: string;
  records: number;
  lastSync: string;
  status: "Synced" | "Pending Review" | "Conflicts" | "Not Configured";
  conflicts: number;
}

const syncTargets: SyncTarget[] = [
  { name: "Business Applications", records: 14, lastSync: "2026-05-14 02:10", status: "Synced", conflicts: 0 },
  { name: "Application Services", records: 31, lastSync: "2026-05-14 02:10", status: "Synced", conflicts: 0 },
  { name: "Business Capabilities", records: 12, lastSync: "2026-05-14 02:11", status: "Pending Review", conflicts: 0 },
  { name: "Technologies", records: 14, lastSync: "2026-05-14 02:11", status: "Conflicts", conflicts: 3 },
  { name: "Services / CIs", records: 86, lastSync: "2026-05-14 02:12", status: "Synced", conflicts: 0 },
  { name: "Owners (Users)", records: 13, lastSync: "2026-05-14 02:12", status: "Conflicts", conflicts: 2 },
  { name: "Lifecycle & Cost", records: 14, lastSync: "2026-05-13 02:10", status: "Pending Review", conflicts: 0 },
  { name: "Risk & Relationships", records: 47, lastSync: "2026-05-13 02:11", status: "Not Configured", conflicts: 0 },
];

const conflicts = [
  { record: "Java 17 (LTS)", field: "Lifecycle status", local: "Current", remote: "Mainstream", target: "Technologies" },
  { record: "SQL Server 2014", field: "Standard status", local: "Non-Standard", remote: "Approved", target: "Technologies" },
  { record: "Adobe Flash Components", field: "End-of-life date", local: "2020-12-31", remote: "(empty)", target: "Technologies" },
  { record: "Omar Hassan", field: "Owned applications", local: "3 apps", remote: "2 apps", target: "Owners (Users)" },
  { record: "James Park", field: "Email", local: "james.park@northwind.example", remote: "j.park@northwind.example", target: "Owners (Users)" },
];

const statusTone = {
  Synced: "success",
  "Pending Review": "warning",
  Conflicts: "danger",
  "Not Configured": "neutral",
} as const;

export default function ServiceNowSync() {
  const { toast } = useToast();
  const [connected] = useState(true);

  const synced = syncTargets.filter((t) => t.status === "Synced").length;
  const totalConflicts = syncTargets.reduce((s, t) => s + t.conflicts, 0);
  const pending = syncTargets.filter((t) => t.status === "Pending Review").length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="ServiceNow Sync"
        description="Import and reconcile portfolio data from ServiceNow CMDB & APM — or maintain it manually if ServiceNow is not in use."
        badges={
          connected ? (
            <StatusBadge label="Connected" tone="success" />
          ) : (
            <StatusBadge label="Not connected" tone="neutral" />
          )
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Integration settings
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => toast({ title: "Sync started", description: "Pulling latest records from ServiceNow. This is a stub — wired to a real connector in Phase 3." })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync now
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Sync Targets" value={syncTargets.length} icon={<Database className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Synced" value={synced} subtitle="up to date" icon={<CheckCircle2 className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Pending Review" value={pending} icon={<Link2 className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Conflicts" value={totalConflicts} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Sync targets</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            What VibeOps imports from ServiceNow. Targets can be enabled individually; records can also be entered manually.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Target</th>
              <th className="p-3">Records</th>
              <th className="p-3">Last sync</th>
              <th className="p-3">Conflicts</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {syncTargets.map((t) => (
              <tr key={t.name} className="hover:bg-muted/40">
                <td className="p-3 font-medium text-foreground">{t.name}</td>
                <td className="p-3 text-muted-foreground">{t.records}</td>
                <td className="p-3 text-muted-foreground">{t.status === "Not Configured" ? "—" : t.lastSync}</td>
                <td className="p-3 text-muted-foreground">{t.conflicts > 0 ? t.conflicts : "—"}</td>
                <td className="p-3"><StatusBadge label={t.status} tone={statusTone[t.status]} /></td>
                <td className="p-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: `${t.name}`, description: t.status === "Not Configured" ? "Configure this target in integration settings." : "Re-sync queued (stub)." })}
                  >
                    {t.status === "Not Configured" ? "Configure" : "Re-sync"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Records needing review</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Field-level conflicts between VibeOps and ServiceNow. Choose which source wins per record.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Record</th>
              <th className="p-3">Target</th>
              <th className="p-3">Field</th>
              <th className="p-3">VibeOps value</th>
              <th className="p-3">ServiceNow value</th>
              <th className="p-3 text-right">Resolve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {conflicts.map((c, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="p-3 font-medium text-foreground">{c.record}</td>
                <td className="p-3 text-muted-foreground">{c.target}</td>
                <td className="p-3 text-muted-foreground">{c.field}</td>
                <td className="p-3"><span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{c.local}</span></td>
                <td className="p-3"><span className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{c.remote}</span></td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Kept VibeOps value", description: `${c.record} · ${c.field}` })}>Keep ours</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Took ServiceNow value", description: `${c.record} · ${c.field}` })}>Take theirs</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        <span className="font-medium text-foreground">No ServiceNow?</span> Every sync target can be maintained manually —
        applications, capabilities, technologies, and ownership are all editable directly in VibeOps. The connector is
        optional and can be enabled later in Phase 3.
      </div>
    </div>
  );
}

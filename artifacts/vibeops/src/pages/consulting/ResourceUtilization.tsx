import { useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import FilterBar, { FilterSelect } from "@/components/consulting/FilterBar";
import { Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { consultants, type Consultant } from "@/data/consulting/consultants";
import { engagements } from "@/data/consulting/engagements";
import { cn } from "@/lib/utils";

const practices = Array.from(new Set(consultants.map((c) => c.practice)));
const regions = Array.from(new Set(consultants.map((c) => c.region)));

function utilTone(actual: number, target: number) {
  if (actual >= target + 8) return "danger"; // overallocated
  if (actual >= target - 5) return "success"; // healthy
  if (actual >= target - 15) return "warning"; // underutilized
  return "danger";
}

export default function ResourceUtilization() {
  const [search, setSearch] = useState("");
  const [practice, setPractice] = useState("");
  const [region, setRegion] = useState("");

  const engagementById = useMemo(() => Object.fromEntries(engagements.map((e) => [e.id, e])), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return consultants.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (practice && c.practice !== practice) return false;
      if (region && c.region !== region) return false;
      return true;
    });
  }, [search, practice, region]);

  const avgUtil = Math.round(consultants.reduce((s, c) => s + c.utilizationActual, 0) / consultants.length);
  const overallocated = consultants.filter((c) => c.utilizationActual >= c.utilizationTarget + 8).length;
  const underutilized = consultants.filter((c) => c.utilizationActual < c.utilizationTarget - 10).length;
  const totalCapacity = Math.round(consultants.reduce((s, c) => s + c.futureCapacity, 0) / consultants.length);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Resource Utilization"
        description="Consultant allocation, billable utilization, bench, and margin contribution."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Avg Utilization" value={avgUtil} suffix="%" trend={2} icon={<Activity className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Overallocated" value={overallocated} subtitle="≥ target + 8%" trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Underutilized" value={underutilized} subtitle="< target - 10%" trend={1} trendDirection="down" trendType="good" icon={<TrendingUp className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Avg 60d Capacity" value={totalCapacity} suffix="%" subtitle="open in next 60d" icon={<Users className="h-5 w-5" />} delay={0.2} />
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search consultants…"
        summary={`${filtered.length} of ${consultants.length} consultants`}
        filters={
          <>
            <FilterSelect label="Practice" value={practice} onChange={setPractice} options={practices} />
            <FilterSelect label="Region" value={region} onChange={setRegion} options={regions} />
          </>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Consultant</th>
              <th className="p-3">Level</th>
              <th className="p-3">Practice</th>
              <th className="p-3">Region</th>
              <th className="p-3">Bill rate</th>
              <th className="p-3">Target</th>
              <th className="p-3">Utilization</th>
              <th className="p-3">60d capacity</th>
              <th className="p-3">Engagements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => <UtilRow key={c.id} c={c} engagementById={engagementById} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UtilRow({ c, engagementById }: { c: Consultant; engagementById: Record<string, any> }) {
  const tone = utilTone(c.utilizationActual, c.utilizationTarget);
  const barColor =
    tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-amber-500" : "bg-success";
  return (
    <tr className="hover:bg-muted/40">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {c.initials}
          </div>
          <div>
            <div className="font-medium text-foreground">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.skills.slice(0, 2).join(" · ")}</div>
          </div>
        </div>
      </td>
      <td className="p-3 text-muted-foreground">{c.level}</td>
      <td className="p-3 text-muted-foreground">{c.practice}</td>
      <td className="p-3 text-muted-foreground">{c.region}</td>
      <td className="p-3 font-mono text-sm text-foreground">${c.billRate}/hr</td>
      <td className="p-3 text-muted-foreground">{c.utilizationTarget}%</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", barColor)} style={{ width: `${Math.min(100, c.utilizationActual)}%` }} />
          </div>
          <StatusBadge label={`${c.utilizationActual}%`} tone={tone} />
        </div>
      </td>
      <td className="p-3 text-muted-foreground">{c.futureCapacity}%</td>
      <td className="p-3 text-xs text-muted-foreground">
        {c.currentEngagements.map((id) => engagementById[id]?.name).filter(Boolean).join(", ") || "—"}
      </td>
    </tr>
  );
}

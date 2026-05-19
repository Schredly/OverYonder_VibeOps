import { useState } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  AppWindow,
  AlertTriangle,
  UserX,
  BadgeCheck,
  Sparkles,
  ArrowRightLeft,
  Wrench,
  Clock,
  ChevronDown,
  ChevronRight,
  Handshake,
} from "lucide-react";
import { applications, LIFECYCLE_STAGES } from "@/data/apm/applications";
import { capabilities, topLevelCapabilities } from "@/data/apm/capabilities";
import { projects } from "@/data/apm/projects";
import { apmTasks } from "@/data/apm/tasks";
import { findPerson } from "@/data/apm/people";
import { dispositionTone, healthBarColor } from "@/components/apm/tone";
import {
  projectDeliveries,
  deliverySummary,
  deliveryStatusTone,
  type ProjectDelivery,
  type SideDelivery,
} from "@/data/apm/projectDelivery";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
} as const;

const chartColors = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function SideCell({ side }: { side: SideDelivery }) {
  if (side.workstreams.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div>
      <StatusBadge label={side.status} tone={deliveryStatusTone[side.status]} />
      <div className="mt-1 text-xs text-muted-foreground">
        {side.progress !== null
          ? `${side.progress}% delivered · ${side.startedCount} workstream${side.startedCount === 1 ? "" : "s"}`
          : "Not yet started"}
      </div>
    </div>
  );
}

function ProjectDeliveryRow({ d }: { d: ProjectDelivery }) {
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <>
      <tr className="cursor-pointer hover:bg-muted/40" onClick={() => setOpen((v) => !v)}>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Chevron className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <Link
                href={`/projects/${d.project.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-foreground hover:text-primary"
              >
                {d.project.name}
              </Link>
              <div className="text-xs text-muted-foreground">
                {d.project.type} · Lead {d.internalLeadName}
              </div>
            </div>
          </div>
        </td>
        <td className="p-3">
          <StatusBadge label={d.overallStatus} tone={deliveryStatusTone[d.overallStatus]} />
          <div className="mt-1 text-xs text-muted-foreground">
            {d.overallProgress}% done · {d.plannedProgress}% planned
          </div>
        </td>
        <td className="p-3">
          <SideCell side={d.internal} />
        </td>
        <td className="p-3">
          {d.partnerFirms.length === 0 ? (
            <span className="text-sm text-muted-foreground">In-house — no partner</span>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Handshake className="h-3.5 w-3.5 text-muted-foreground" />
                {d.partnerFirms.join(", ")}
              </div>
              <div className="mt-1.5">
                <SideCell side={d.consultant} />
              </div>
            </div>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/30">
          <td colSpan={4} className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Workstreams
            </div>
            <div className="mt-2 space-y-2">
              {d.project.workstreams.map((w) => {
                const lead = findPerson(w.leadId);
                const isConsultant = lead?.type === "consultant";
                return (
                  <div
                    key={w.name}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card p-3"
                  >
                    <StatusBadge
                      label={isConsultant ? "Partner" : "Internal"}
                      tone={isConsultant ? "primary" : "info"}
                    />
                    <span className="font-medium text-foreground">{w.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {lead?.name ?? w.leadId} · {w.status}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${w.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{w.progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function EnterpriseDashboard() {
  const totalApps = applications.length;
  const appsAtRisk = applications.filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical").length;
  const appsNoOwner = applications.filter((a) => !a.ownerId || !findPerson(a.ownerId)).length;
  const certNeeded = applications.filter((a) => a.certStatus === "Due" || a.certStatus === "Overdue" || a.certStatus === "Not Started").length;
  const aiCandidates = applications.filter((a) => a.aiReadiness === "High").length;
  const migrationCandidates = applications.filter((a) => a.disposition === "Migrate" || a.disposition === "Replace").length;
  const avgTechDebt = Math.round(applications.reduce((s, a) => s + a.techDebtScore, 0) / totalApps);
  const today = new Date("2026-05-15");
  const consultantTasksOverdue = apmTasks.filter(
    (t) => findPerson(t.assigneeId)?.type === "consultant" && t.status !== "Complete" && new Date(t.dueDate) < today,
  ).length;

  // Lifecycle distribution
  const lifecycleData = LIFECYCLE_STAGES.map((stage) => ({
    name: stage,
    value: applications.filter((a) => a.lifecycleStage === stage).length,
  }));

  // Criticality distribution
  const criticalityData = ["Critical", "High", "Medium", "Low"].map((c) => ({
    name: c,
    value: applications.filter((a) => a.businessCriticality === c).length,
  }));

  // Risk by capability (top-level)
  const riskByCapability = topLevelCapabilities
    .map((cap) => {
      const childIds = capabilities.filter((c) => c.parentId === cap.id).map((c) => c.id);
      const ids = [cap.id, ...childIds];
      const apps = applications.filter((a) => a.capabilityIds.some((cid) => ids.includes(cid)));
      const atRisk = apps.filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical").length;
      return { name: cap.name, atRisk, total: apps.length };
    })
    .filter((d) => d.total > 0);

  // Disposition mix
  const dispositionData = ["Tolerate", "Invest", "Migrate", "Modernize", "Replace", "Retire"].map((d) => ({
    name: d,
    value: applications.filter((a) => a.disposition === d).length,
  }));

  const watchlist = applications
    .filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical")
    .sort((a, b) => b.techDebtScore - a.techDebtScore)
    .slice(0, 6);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Executive Dashboard"
        description="CIO view of the application portfolio — health, risk, modernization, and consultant delivery."
        badges={
          <>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">APM Lite</Badge>
            <Badge className="bg-success/10 text-success hover:bg-success/15">{projects.filter((p) => p.status === "In Progress").length} projects in flight</Badge>
          </>
        }
        actions={
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Portfolio insights
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Applications" value={totalApps} href="/applications" icon={<AppWindow className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Applications at Risk" value={appsAtRisk} href="/applications" subtitle="High or Critical" trend={2} trendDirection="down" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Apps Without Owner" value={appsNoOwner} href="/certifications" subtitle="needs assignment" icon={<UserX className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Certification Needed" value={certNeeded} href="/certifications" subtitle="due, overdue, or not started" icon={<BadgeCheck className="h-5 w-5" />} delay={0.2} />
        <KpiCard title="AI Modernization Candidates" value={aiCandidates} href="/applications" subtitle="high AI readiness" trend={3} icon={<Sparkles className="h-5 w-5" />} delay={0.25} />
        <KpiCard title="Migration Candidates" value={migrationCandidates} href="/migrations" subtitle="migrate or replace" icon={<ArrowRightLeft className="h-5 w-5" />} delay={0.3} />
        <KpiCard title="Avg Tech Debt" value={avgTechDebt} href="/technology" suffix="/100" trend={4} trendDirection="down" trendType="good" icon={<Wrench className="h-5 w-5" />} delay={0.35} />
        <KpiCard title="Consultant Tasks Overdue" value={consultantTasksOverdue} href="/consultant-workspace" subtitle="across engagements" trend={1} trendDirection="up" trendType="bad" icon={<Clock className="h-5 w-5" />} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Risk by Capability" subtitle="Applications at risk per business capability" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskByCapability} layout="vertical" margin={{ top: 0, right: 16, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" name="Total apps" fill="hsl(var(--muted))" radius={[0, 6, 6, 0]} barSize={14} />
              <Bar dataKey="atRisk" name="At risk" fill="hsl(var(--destructive))" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lifecycle Stage" subtitle="Portfolio distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={lifecycleData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {lifecycleData.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Business Criticality" subtitle="Applications by criticality">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={criticalityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disposition Mix" subtitle="Strategic intent across the portfolio">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dispositionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                {dispositionData.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Modernization Progress" subtitle="Active projects % complete">
          <div className="space-y-4 pt-2">
            {projects
              .filter((p) => p.status === "In Progress" || p.status === "At Risk")
              .map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/projects/${p.id}`} className="font-medium text-foreground hover:text-primary">
                      {p.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </ChartCard>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="text-base font-medium text-foreground">Project delivery — internal teams & partners</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {deliverySummary.activeProjects} active projects · {deliverySummary.partnerProjects} with a consulting partner ·{" "}
              {deliverySummary.internalOffTrack} internal off-track · {deliverySummary.partnerOffTrack} partner off-track.
              Expand a row to see workstreams.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline" size="sm">All projects</Button>
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Project</th>
              <th className="p-3">Overall</th>
              <th className="p-3">Internal team</th>
              <th className="p-3">Consulting partner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projectDeliveries.map((d) => (
              <ProjectDeliveryRow key={d.project.id} d={d} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h3 className="text-base font-medium text-foreground">Application risk watchlist</h3>
            <p className="mt-1 text-sm text-muted-foreground">Highest-debt applications carrying High or Critical risk.</p>
          </div>
          <Link href="/applications">
            <Button variant="outline" size="sm">View full portfolio</Button>
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Application</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Criticality</th>
              <th className="p-3">Risk</th>
              <th className="p-3">Tech Debt</th>
              <th className="p-3">Disposition</th>
              <th className="p-3">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {watchlist.map((a) => (
              <tr key={a.id} className="hover:bg-muted/40">
                <td className="p-3">
                  <Link href={`/applications/${a.id}`} className="font-medium text-foreground hover:text-primary">
                    {a.name}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{findPerson(a.ownerId)?.name ?? "Unassigned"}</td>
                <td className="p-3"><StatusBadge label={a.businessCriticality} tone={a.businessCriticality === "Critical" ? "danger" : a.businessCriticality === "High" ? "warning" : "neutral"} /></td>
                <td className="p-3"><StatusBadge label={a.riskLevel} tone={a.riskLevel === "Critical" ? "danger" : "warning"} /></td>
                <td className="p-3 font-medium text-foreground">{a.techDebtScore}</td>
                <td className="p-3"><StatusBadge label={a.disposition} tone={dispositionTone[a.disposition]} /></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${healthBarColor(a.healthScore)}`} style={{ width: `${a.healthScore}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{a.healthScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

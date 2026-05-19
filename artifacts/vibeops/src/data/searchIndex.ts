/**
 * Global command-palette search index.
 *
 * A flat, denormalized list of every searchable record across both operating
 * modes (enterprise APM/EA + consulting). Built once at module load from the
 * mock data sources — there is no API yet. The palette fuzzy-matches against
 * this index; see `hooks/useGlobalSearch.ts`.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  AppWindow,
  ArrowRightLeft,
  BadgeCheck,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  ClipboardCheck,
  Compass,
  Cpu,
  FileText,
  FolderKanban,
  Gavel,
  Layers,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
  User,
  Users2,
} from "lucide-react";
import { statusToTone } from "@/components/dashboard/StatusBadge";
import { tenantOf } from "@/lib/tenantScope";

import { applications, findApplication } from "@/data/apm/applications";
import { capabilities } from "@/data/apm/capabilities";
import { technologies } from "@/data/apm/technologies";
import { apmRisks, apmDecisions } from "@/data/apm/risks";
import { apmTasks } from "@/data/apm/tasks";
import { assessments } from "@/data/apm/assessments";
import { migrationWaves } from "@/data/apm/migrations";
import { projects, findProject } from "@/data/apm/projects";
import { people } from "@/data/apm/people";

import { clients } from "@/data/consulting/clients";
import { engagements, findEngagement } from "@/data/consulting/engagements";
import { consultants } from "@/data/consulting/consultants";
import { proposals } from "@/data/consulting/proposals";
import { programs } from "@/data/consulting/programs";
import { deliveryRisks } from "@/data/consulting/risks";
import { consultingTasks } from "@/data/consulting/tasks";

export type SearchTone = "success" | "primary" | "warning" | "danger" | "neutral" | "info";

export type SearchSection = "enterprise" | "consulting" | "system";

/** A single searchable record or destination. */
export interface SearchEntry {
  /** Unique, namespaced id (`kind:recordId`). */
  id: string;
  section: SearchSection;
  /** Result group heading, e.g. "Applications". */
  group: string;
  /** Human-readable record type, shown as a small badge. */
  kind: string;
  title: string;
  subtitle: string;
  /** Health / risk / lifecycle indicator label. */
  status?: string;
  tone: SearchTone;
  /** Wouter route this entry navigates to. */
  to: string;
  icon: LucideIcon;
  /** Extra lowercased text folded into the fuzzy match. */
  keywords: string;
  /** Owning tenant, or `undefined` for shared records (pages, taxonomy). */
  tenantId?: string;
}

/** A command the palette can run rather than a record to open. */
export interface QuickAction {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** `navigate` jumps to `to`; `switch-mode` flips the operating mode. */
  type: "navigate" | "switch-mode";
  to?: string;
  keywords: string;
}

/** Critical → red, High → amber, Medium → blue, Low → green. */
const riskTone: Record<string, SearchTone> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "success",
};

const techTone: Record<string, SearchTone> = {
  Approved: "success",
  Emerging: "info",
  "Non-Standard": "warning",
  Retired: "neutral",
};

// --- Enterprise (APM / EA) -------------------------------------------------

const applicationEntries: SearchEntry[] = applications.map((a) => ({
  id: `app:${a.id}`,
  section: "enterprise",
  group: "Applications",
  kind: "Application",
  title: a.name,
  subtitle: `${a.businessUnit} · ${a.vendor}`,
  status: `${a.riskLevel} Risk`,
  tone: riskTone[a.riskLevel] ?? "neutral",
  to: `/applications/${a.id}`,
  icon: AppWindow,
  keywords: `${a.id} ${a.description} ${a.disposition} ${a.lifecycleStage} ${a.hostingModel} ${a.cloudReadiness} ${a.aiReadiness}`.toLowerCase(),
}));

const capabilityEntries: SearchEntry[] = capabilities.map((c) => ({
  id: `cap:${c.id}`,
  section: "enterprise",
  group: "Capabilities",
  kind: "Capability",
  title: c.name,
  subtitle: c.description,
  status: `Level ${c.level}`,
  tone: "neutral",
  to: "/capabilities",
  icon: Layers,
  keywords: `${c.id} business capability domain`.toLowerCase(),
}));

const technologyEntries: SearchEntry[] = technologies.map((t) => ({
  id: `tech:${t.id}`,
  section: "enterprise",
  group: "Technologies",
  kind: "Technology",
  title: t.name,
  subtitle: `${t.category} · ${t.vendor}`,
  status: t.standardStatus,
  tone: techTone[t.standardStatus] ?? "neutral",
  to: "/technology",
  icon: Cpu,
  keywords: `${t.id} ${t.kind} ${t.lifecycleStatus} standard`.toLowerCase(),
}));

const projectEntries: SearchEntry[] = projects.map((p) => ({
  id: `proj:${p.id}`,
  section: "enterprise",
  group: "Projects",
  kind: "Project",
  title: p.name,
  subtitle: p.type,
  status: p.health,
  tone: statusToTone(p.health),
  to: `/projects/${p.id}`,
  icon: FolderKanban,
  keywords: `${p.id} ${p.status} ${p.description} modernization`.toLowerCase(),
}));

const migrationEntries: SearchEntry[] = migrationWaves.map((w) => {
  const project = findProject(w.projectId);
  return {
    id: `wave:${w.id}`,
    section: "enterprise",
    group: "Migration Programs",
    kind: "Migration Wave",
    title: w.name,
    subtitle: project?.name ?? w.type,
    status: w.status,
    tone: statusToTone(w.status),
    to: "/migrations",
    icon: ArrowRightLeft,
    keywords: `${w.id} ${w.type} ${w.notes} migration wave`.toLowerCase(),
  };
});

const riskEntries: SearchEntry[] = apmRisks.map((r) => ({
  id: `apmrisk:${r.id}`,
  section: "enterprise",
  group: "Risks",
  kind: "Risk",
  title: r.title,
  subtitle: r.scope.label,
  status: r.severity,
  tone: riskTone[r.severity] ?? "neutral",
  to: "/risks",
  icon: AlertTriangle,
  keywords: `${r.id} ${r.type} ${r.status} ${r.impact}`.toLowerCase(),
}));

const decisionEntries: SearchEntry[] = apmDecisions.map((d) => ({
  id: `decision:${d.id}`,
  section: "enterprise",
  group: "Governance Items",
  kind: "Decision",
  title: d.title,
  subtitle: d.scope.label,
  status: d.status,
  tone: statusToTone(d.status),
  to: "/risks",
  icon: Gavel,
  keywords: `${d.id} ${d.rationale} governance decision`.toLowerCase(),
}));

const assessmentEntries: SearchEntry[] = assessments.map((a) => {
  const app = findApplication(a.appId);
  return {
    id: `assess:${a.id}`,
    section: "enterprise",
    group: "Assessments",
    kind: "Assessment",
    title: `${a.type} — ${app?.name ?? a.appId}`,
    subtitle: a.recommendation,
    status: a.status,
    tone: statusToTone(a.status),
    to: "/assessments",
    icon: ClipboardCheck,
    keywords: `${a.id} ${a.type} ${a.notes} ai readiness`.toLowerCase(),
  };
});

const apmTaskEntries: SearchEntry[] = apmTasks.map((t) => ({
  id: `apmtask:${t.id}`,
  section: "enterprise",
  group: "Tasks",
  kind: "Task",
  title: t.name,
  subtitle: t.scope.label,
  status: t.status,
  tone: statusToTone(t.status),
  to: "/tasks",
  icon: ListChecks,
  keywords: `${t.id} ${t.priority} task`.toLowerCase(),
}));

// --- Consulting ------------------------------------------------------------

const clientEntries: SearchEntry[] = clients.map((c) => ({
  id: `client:${c.id}`,
  section: "consulting",
  group: "Clients",
  kind: "Client",
  title: c.name,
  subtitle: `${c.industry} · ${c.region}`,
  status: c.deliveryRisk,
  tone: statusToTone(c.deliveryRisk),
  to: `/consulting/clients/${c.id}`,
  icon: Building2,
  keywords: `${c.id} ${c.strategicTier} ${c.accountOwner} ${c.aiMaturity}`.toLowerCase(),
}));

const engagementEntries: SearchEntry[] = engagements.map((e) => {
  const client = clients.find((c) => c.id === e.clientId);
  return {
    id: `eng:${e.id}`,
    section: "consulting",
    group: "Engagements",
    kind: "Engagement",
    title: e.name,
    subtitle: client?.name ?? e.clientId,
    status: e.health,
    tone: statusToTone(e.health),
    to: `/consulting/engagements/${e.id}`,
    icon: Briefcase,
    keywords: `${e.id} ${e.type} ${e.phase} engagement`.toLowerCase(),
  };
});

const proposalEntries: SearchEntry[] = proposals.map((p) => ({
  id: `proposal:${p.id}`,
  section: "consulting",
  group: "Proposals",
  kind: "Proposal",
  title: p.name,
  subtitle: `${p.clientName} · ${p.practiceArea}`,
  status: p.stage,
  tone: statusToTone(p.stage),
  to: "/consulting/proposals",
  icon: FileText,
  keywords: `${p.id} ${p.nextStep} proposal pipeline`.toLowerCase(),
}));

const programEntries: SearchEntry[] = programs.map((p) => ({
  id: `program:${p.id}`,
  section: "consulting",
  group: "Programs",
  kind: "Program",
  title: p.name,
  subtitle: p.sponsor,
  status: p.health,
  tone: statusToTone(p.health),
  to: "/consulting/programs",
  icon: Boxes,
  keywords: `${p.id} ${p.description} ai transformation program`.toLowerCase(),
}));

const consultantEntries: SearchEntry[] = consultants.map((c) => ({
  id: `consultant:${c.id}`,
  section: "consulting",
  group: "Consultants",
  kind: "Consultant",
  title: c.name,
  subtitle: `${c.level} · ${c.practice}`,
  status: `${c.utilizationActual}% util`,
  tone: c.utilizationActual > c.utilizationTarget ? "warning" : "success",
  to: "/consulting/utilization",
  icon: Users2,
  keywords: `${c.id} ${c.region} ${c.skills.join(" ")} consultant`.toLowerCase(),
}));

const deliveryRiskEntries: SearchEntry[] = deliveryRisks.map((r) => {
  const engagement = findEngagement(r.engagementId);
  return {
    id: `delrisk:${r.id}`,
    section: "consulting",
    group: "Delivery Risks",
    kind: "Delivery Risk",
    title: r.title,
    subtitle: engagement?.name ?? r.engagementId,
    status: r.severity,
    tone: riskTone[r.severity] ?? "neutral",
    to: "/consulting/risks",
    icon: AlertTriangle,
    keywords: `${r.id} ${r.type} ${r.status} ${r.impact}`.toLowerCase(),
  };
});

const consultingTaskEntries: SearchEntry[] = consultingTasks.map((t) => {
  const engagement = findEngagement(t.engagementId);
  return {
    id: `ctask:${t.id}`,
    section: "consulting",
    group: "Tasks",
    kind: "Delivery Task",
    title: t.name,
    subtitle: engagement?.name ?? t.engagementId,
    status: t.status,
    tone: statusToTone(t.status),
    to: "/consulting/tasks",
    icon: ListChecks,
    keywords: `${t.id} ${t.priority} delivery task`.toLowerCase(),
  };
});

// --- System (users + navigation) ------------------------------------------

const userEntries: SearchEntry[] = people.map((p) => ({
  id: `person:${p.id}`,
  section: "system",
  group: "Users",
  kind: "User",
  title: p.name,
  subtitle: `${p.role}${p.firm ? ` · ${p.firm}` : ""}`,
  status: p.type === "consultant" ? "External" : "Internal",
  tone: p.type === "consultant" ? "info" : "neutral",
  to: "/admin",
  icon: User,
  keywords: `${p.id} ${p.email} ${p.role} user`.toLowerCase(),
}));

interface PageDef {
  title: string;
  to: string;
  group: "Dashboards" | "Reports" | "Pages";
  mode: "Enterprise" | "Consulting";
  icon: LucideIcon;
  keywords?: string;
}

const PAGES: PageDef[] = [
  { title: "CIO Operations Dashboard", to: "/dashboard", group: "Dashboards", mode: "Enterprise", icon: LayoutDashboard, keywords: "home executive overview" },
  { title: "Services CEO Dashboard", to: "/consulting/dashboard", group: "Dashboards", mode: "Consulting", icon: LayoutDashboard, keywords: "executive overview" },
  { title: "Executive Reporting", to: "/consulting/reporting", group: "Reports", mode: "Consulting", icon: BarChart3, keywords: "boardroom scorecard" },
  { title: "Forecasting", to: "/consulting/forecasting", group: "Reports", mode: "Consulting", icon: BarChart3, keywords: "revenue forecast scenarios" },
  { title: "Revenue Operations", to: "/consulting/revenue", group: "Reports", mode: "Consulting", icon: BarChart3, keywords: "revenue financials" },
  { title: "Application Portfolio", to: "/applications", group: "Pages", mode: "Enterprise", icon: AppWindow },
  { title: "Capability Map", to: "/capabilities", group: "Pages", mode: "Enterprise", icon: Layers, keywords: "business domains" },
  { title: "Technology Portfolio", to: "/technology", group: "Pages", mode: "Enterprise", icon: Cpu, keywords: "standards" },
  { title: "Modernization Projects", to: "/projects", group: "Pages", mode: "Enterprise", icon: FolderKanban },
  { title: "Migration Waves", to: "/migrations", group: "Pages", mode: "Enterprise", icon: ArrowRightLeft },
  { title: "Tasks", to: "/tasks", group: "Pages", mode: "Enterprise", icon: ListChecks },
  { title: "Certification Center", to: "/certifications", group: "Pages", mode: "Enterprise", icon: BadgeCheck },
  { title: "Assessments", to: "/assessments", group: "Pages", mode: "Enterprise", icon: ClipboardCheck, keywords: "ai readiness" },
  { title: "Risks & Decisions", to: "/risks", group: "Pages", mode: "Enterprise", icon: AlertTriangle, keywords: "governance" },
  { title: "ServiceNow Sync", to: "/servicenow", group: "Pages", mode: "Enterprise", icon: RefreshCw, keywords: "integration cmdb" },
  { title: "Administration", to: "/admin", group: "Pages", mode: "Enterprise", icon: Compass, keywords: "settings users" },
  { title: "Client Portfolio", to: "/consulting/clients", group: "Pages", mode: "Consulting", icon: Building2 },
  { title: "Engagements", to: "/consulting/engagements", group: "Pages", mode: "Consulting", icon: Briefcase },
  { title: "Proposal Pipeline", to: "/consulting/proposals", group: "Pages", mode: "Consulting", icon: FileText },
  { title: "Customer Health", to: "/consulting/health", group: "Pages", mode: "Consulting", icon: BarChart3 },
  { title: "Delivery Operations", to: "/consulting/delivery", group: "Pages", mode: "Consulting", icon: Compass, keywords: "pmo" },
  { title: "Task Delivery", to: "/consulting/tasks", group: "Pages", mode: "Consulting", icon: ListChecks },
  { title: "AI Transformation Programs", to: "/consulting/programs", group: "Pages", mode: "Consulting", icon: Boxes },
  { title: "Delivery Risks", to: "/consulting/risks", group: "Pages", mode: "Consulting", icon: AlertTriangle },
  { title: "Resource Utilization", to: "/consulting/utilization", group: "Pages", mode: "Consulting", icon: Users2 },
  { title: "Billable Utilization", to: "/consulting/billable", group: "Pages", mode: "Consulting", icon: BarChart3 },
  { title: "Consultant Capacity", to: "/consulting/capacity", group: "Pages", mode: "Consulting", icon: Users2 },
];

const pageEntries: SearchEntry[] = PAGES.map((p) => ({
  id: `page:${p.to}`,
  section: "system",
  group: p.group,
  kind: p.group === "Pages" ? "Page" : p.group === "Reports" ? "Report" : "Dashboard",
  title: p.title,
  subtitle: `${p.mode} workspace`,
  status: p.mode,
  tone: "neutral",
  to: p.to,
  icon: p.icon,
  keywords: `${p.to} ${p.mode} ${p.keywords ?? ""} navigation page`.toLowerCase(),
}));

/** The full, flat search index — every record and destination. */
export const searchIndex: SearchEntry[] = [
  ...applicationEntries,
  ...capabilityEntries,
  ...technologyEntries,
  ...projectEntries,
  ...migrationEntries,
  ...riskEntries,
  ...decisionEntries,
  ...assessmentEntries,
  ...apmTaskEntries,
  ...clientEntries,
  ...engagementEntries,
  ...proposalEntries,
  ...programEntries,
  ...consultantEntries,
  ...deliveryRiskEntries,
  ...consultingTaskEntries,
  ...userEntries,
  ...pageEntries,
].map((entry) => ({
  // The raw record id is everything after the `kind:` prefix.
  ...entry,
  tenantId: tenantOf(entry.id.slice(entry.id.indexOf(":") + 1)),
}));

/** Fast id → entry lookup, used to resolve recent / pinned items. */
export const searchIndexById: Map<string, SearchEntry> = new Map(
  searchIndex.map((e) => [e.id, e]),
);

/** Command actions surfaced in the palette. */
export const quickActions: QuickAction[] = [
  { id: "create-client", label: "Create Client", hint: "New client record", icon: Building2, type: "navigate", to: "/consulting/clients", keywords: "new add consulting" },
  { id: "create-engagement", label: "Create Engagement", hint: "New delivery engagement", icon: Briefcase, type: "navigate", to: "/consulting/engagements", keywords: "new add consulting" },
  { id: "create-proposal", label: "Create Proposal", hint: "New pipeline proposal", icon: FileText, type: "navigate", to: "/consulting/proposals", keywords: "new add consulting deal" },
  { id: "create-task", label: "Create Task", hint: "New work item", icon: ListChecks, type: "navigate", to: "/tasks", keywords: "new add" },
  { id: "create-risk", label: "Create Risk", hint: "Log a new risk", icon: AlertTriangle, type: "navigate", to: "/risks", keywords: "new add issue" },
  { id: "create-application", label: "Create Application", hint: "New portfolio application", icon: AppWindow, type: "navigate", to: "/applications", keywords: "new add apm" },
  { id: "open-exec-dashboard", label: "Open Executive Dashboard", hint: "Jump to the operations dashboard", icon: LayoutDashboard, type: "navigate", to: "/dashboard", keywords: "home cio" },
  { id: "open-forecasting", label: "Open Forecasting", hint: "Revenue & utilization forecast", icon: BarChart3, type: "navigate", to: "/consulting/forecasting", keywords: "revenue scenarios" },
  { id: "switch-mode", label: "Switch Operating Mode", hint: "Toggle Enterprise / Consulting", icon: ArrowRightLeft, type: "switch-mode", keywords: "change view enterprise consulting" },
];

/** Section order — the active operating mode is surfaced first. */
export const SECTION_ORDER_ENTERPRISE: SearchSection[] = ["enterprise", "consulting", "system"];
export const SECTION_ORDER_CONSULTING: SearchSection[] = ["consulting", "enterprise", "system"];

/** Group display order within each section. */
export const GROUP_ORDER: Record<SearchSection, string[]> = {
  enterprise: [
    "Applications",
    "Capabilities",
    "Technologies",
    "Projects",
    "Migration Programs",
    "Risks",
    "Governance Items",
    "Assessments",
    "Tasks",
  ],
  consulting: ["Clients", "Engagements", "Proposals", "Programs", "Consultants", "Delivery Risks", "Tasks"],
  system: ["Dashboards", "Reports", "Pages", "Users"],
};

/** Human label for a section, shown beside group headings. */
export const SECTION_LABEL: Record<SearchSection, string> = {
  enterprise: "Enterprise",
  consulting: "Consulting",
  system: "System",
};

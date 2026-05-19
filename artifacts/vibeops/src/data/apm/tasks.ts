import type { Scope } from "./risks";

export const APM_TASK_STATUSES = [
  "Backlog",
  "Planned",
  "In Progress",
  "Blocked",
  "In Review",
  "Complete",
] as const;
export type ApmTaskStatus = (typeof APM_TASK_STATUSES)[number];
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface ApmTask {
  id: string;
  name: string;
  /** What the task is about — drives where it shows up across the app. */
  scope: Scope;
  assigneeId: string; // person id (internal or consultant)
  status: ApmTaskStatus;
  priority: TaskPriority;
  billable: boolean;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  blocker?: string;
}

export const apmTasks: ApmTask[] = [
  { id: "at-001", name: "Confirm CoreBilling target architecture", scope: { type: "project", id: "proj-billing-replace", label: "CoreBilling Replacement Program" }, assigneeId: "c-marcus", status: "Complete", priority: "High", billable: true, estimatedHours: 40, actualHours: 38, dueDate: "2026-02-28" },
  { id: "at-002", name: "Extract & profile mainframe billing data", scope: { type: "migration", id: "wave-3", label: "Wave 3 — CoreBilling Data Migration" }, assigneeId: "c-james", status: "In Progress", priority: "Critical", billable: true, estimatedHours: 120, actualHours: 64, dueDate: "2026-06-20" },
  { id: "at-003", name: "Resolve 2 data-quality issues in billing extract", scope: { type: "migration", id: "wave-3", label: "Wave 3 — CoreBilling Data Migration" }, assigneeId: "c-james", status: "Blocked", priority: "Critical", billable: true, estimatedHours: 32, actualHours: 12, dueDate: "2026-05-30", blocker: "Awaiting source-of-truth ruling from Finance on duplicate revenue schedules." },
  { id: "at-004", name: "Owner attestation — FieldForce Mobile", scope: { type: "certification", id: "cert-owner-fy26", label: "FY26 Owner Validation" }, assigneeId: "u-omar", status: "Planned", priority: "High", billable: false, estimatedHours: 2, actualHours: 0, dueDate: "2026-05-22" },
  { id: "at-005", name: "Owner attestation — CoreBilling", scope: { type: "certification", id: "cert-owner-fy26", label: "FY26 Owner Validation" }, assigneeId: "u-james", status: "Planned", priority: "High", billable: false, estimatedHours: 2, actualHours: 0, dueDate: "2026-05-22" },
  { id: "at-006", name: "FieldForce Azure SQL schema conversion", scope: { type: "migration", id: "wave-2", label: "Wave 2 — FieldForce DB Migration" }, assigneeId: "c-emma", status: "In Review", priority: "High", billable: true, estimatedHours: 60, actualHours: 58, dueDate: "2026-05-25" },
  { id: "at-007", name: "FieldForce data reconciliation harness", scope: { type: "migration", id: "wave-2", label: "Wave 2 — FieldForce DB Migration" }, assigneeId: "c-emma", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 40, actualHours: 16, dueDate: "2026-06-10" },
  { id: "at-008", name: "Build ClaimsCore feature store", scope: { type: "project", id: "proj-claims-ai", label: "ClaimsCore AI Upgrade" }, assigneeId: "c-marcus", status: "In Progress", priority: "High", billable: true, estimatedHours: 90, actualHours: 62, dueDate: "2026-06-30" },
  { id: "at-009", name: "Fraud scoring model — training pipeline", scope: { type: "project", id: "proj-claims-ai", label: "ClaimsCore AI Upgrade" }, assigneeId: "c-priya", status: "In Progress", priority: "High", billable: true, estimatedHours: 80, actualHours: 44, dueDate: "2026-07-15" },
  { id: "at-010", name: "Data sensitivity review for fraud model features", scope: { type: "application", id: "app-claimscore", label: "ClaimsCore" }, assigneeId: "u-rachel", status: "Planned", priority: "Medium", billable: false, estimatedHours: 12, actualHours: 0, dueDate: "2026-06-05" },
  { id: "at-011", name: "Vendor Portal migration design", scope: { type: "project", id: "proj-vendor-migrate", label: "Vendor Portal Re-platform" }, assigneeId: "c-emma", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 50, actualHours: 18, dueDate: "2026-06-30" },
  { id: "at-012", name: "Order Hub pricing engine root-cause analysis", scope: { type: "application", id: "app-orderhub", label: "Order Hub" }, assigneeId: "u-david", status: "In Progress", priority: "Medium", billable: false, estimatedHours: 24, actualHours: 9, dueDate: "2026-06-12" },
  { id: "at-013", name: "AI readiness assessment — Customer Portal", scope: { type: "certification", id: "cert-ai-fy26", label: "FY26 AI Readiness Review" }, assigneeId: "c-marcus", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 20, actualHours: 8, dueDate: "2026-06-18" },
  { id: "at-014", name: "AI readiness assessment — ClaimsCore", scope: { type: "certification", id: "cert-ai-fy26", label: "FY26 AI Readiness Review" }, assigneeId: "c-priya", status: "Planned", priority: "Medium", billable: true, estimatedHours: 20, actualHours: 0, dueDate: "2026-06-25" },
  { id: "at-015", name: "Risk validation — FieldForce Mobile", scope: { type: "certification", id: "cert-risk-q2", label: "Q2 Risk & Lifecycle Validation" }, assigneeId: "c-emma", status: "In Progress", priority: "High", billable: true, estimatedHours: 8, actualHours: 3, dueDate: "2026-05-28" },
  { id: "at-016", name: "Legacy GL archival & retention plan", scope: { type: "migration", id: "wave-4", label: "Wave 4 — Legacy GL Decommission" }, assigneeId: "u-james", status: "Blocked", priority: "High", billable: false, estimatedHours: 24, actualHours: 4, dueDate: "2026-06-30", blocker: "Awaiting legal sign-off on financial records retention period." },
  { id: "at-017", name: "Tech-debt backlog triage — Warehouse", scope: { type: "application", id: "app-warehouse", label: "Warehouse Mgmt System" }, assigneeId: "u-david", status: "Backlog", priority: "Low", billable: false, estimatedHours: 16, actualHours: 0, dueDate: "2026-07-10" },
  { id: "at-018", name: "Adjudication copilot — solution design", scope: { type: "project", id: "proj-claims-ai", label: "ClaimsCore AI Upgrade" }, assigneeId: "c-priya", status: "Backlog", priority: "Medium", billable: true, estimatedHours: 40, actualHours: 0, dueDate: "2026-07-30" },
  { id: "at-019", name: "Owner attestation — Enterprise Data Hub", scope: { type: "certification", id: "cert-owner-fy26", label: "FY26 Owner Validation" }, assigneeId: "u-david", status: "Planned", priority: "Medium", billable: false, estimatedHours: 2, actualHours: 0, dueDate: "2026-05-29" },
  { id: "at-020", name: "CoreBilling billing-engine pilot prep", scope: { type: "project", id: "proj-billing-replace", label: "CoreBilling Replacement Program" }, assigneeId: "c-marcus", status: "In Progress", priority: "High", billable: true, estimatedHours: 64, actualHours: 28, dueDate: "2026-06-25" },
  { id: "at-021", name: "Capability map review with EA council", scope: { type: "capability", id: "cap-finance", label: "Finance & Accounting" }, assigneeId: "u-david", status: "Complete", priority: "Low", billable: false, estimatedHours: 6, actualHours: 6, dueDate: "2026-05-06" },
  { id: "at-022", name: "Order Hub AI readiness — write-up", scope: { type: "application", id: "app-orderhub", label: "Order Hub" }, assigneeId: "c-priya", status: "Complete", priority: "Low", billable: true, estimatedHours: 12, actualHours: 11, dueDate: "2026-04-20" },
];

export const tasksForScope = (type: string, id: string) =>
  apmTasks.filter((t) => t.scope.type === type && t.scope.id === id);

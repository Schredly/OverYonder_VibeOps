export const PROJECT_TYPES = [
  "Cloud Migration",
  "ServiceNow Migration",
  "AI Upgrade",
  "App Rationalization",
  "Data Cleanup",
  "Tech Debt Remediation",
  "Certification Campaign",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type ProjectStatus = "Proposed" | "Planning" | "In Progress" | "At Risk" | "On Hold" | "Complete";
export type ProjectHealth = "Healthy" | "At Risk" | "Critical";

export interface Workstream {
  name: string;
  status: "Not Started" | "In Progress" | "Blocked" | "Complete";
  progress: number;
  leadId: string;
}
export interface ProjectMilestone {
  name: string;
  due: string;
  status: "Done" | "On Track" | "At Risk" | "Slipped";
}

export interface ModernizationProject {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  health: ProjectHealth;
  description: string;
  applicationIds: string[];
  capabilityId?: string;
  internalLeadId: string;
  consultantIds: string[];
  budget: number;
  spend: number;
  progress: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  startDate: string;
  endDate: string;
  workstreams: Workstream[];
  milestones: ProjectMilestone[];
}

export const projects: ModernizationProject[] = [
  {
    id: "proj-billing-replace",
    name: "CoreBilling Replacement Program",
    type: "App Rationalization",
    status: "In Progress",
    health: "At Risk",
    description:
      "Retire mainframe CoreBilling and Legacy GL; consolidate billing into FinanceHub with a modern revenue engine.",
    applicationIds: ["app-corebilling", "app-legacygl", "app-financehub"],
    capabilityId: "cap-finance",
    internalLeadId: "u-james",
    consultantIds: ["c-marcus", "c-james", "c-alex"],
    budget: 4_200_000,
    spend: 2_360_000,
    progress: 52,
    riskLevel: "High",
    startDate: "2025-11-01",
    endDate: "2026-12-15",
    workstreams: [
      { name: "Billing engine build", status: "In Progress", progress: 60, leadId: "c-marcus" },
      { name: "Data migration", status: "In Progress", progress: 40, leadId: "c-james" },
      { name: "Legacy GL decommission", status: "Not Started", progress: 0, leadId: "u-james" },
    ],
    milestones: [
      { name: "Target architecture sign-off", due: "2026-02-28", status: "Done" },
      { name: "Billing engine pilot", due: "2026-06-30", status: "At Risk" },
      { name: "Cutover", due: "2026-11-15", status: "On Track" },
    ],
  },
  {
    id: "proj-fieldforce-cloud",
    name: "FieldForce Cloud Migration",
    type: "Cloud Migration",
    status: "In Progress",
    health: "Healthy",
    description: "Re-platform FieldForce Mobile off on-prem SQL Server 2014 onto Azure.",
    applicationIds: ["app-fieldforce"],
    capabilityId: "cap-customer-service",
    internalLeadId: "u-omar",
    consultantIds: ["c-emma"],
    budget: 880_000,
    spend: 320_000,
    progress: 38,
    riskLevel: "Medium",
    startDate: "2026-02-01",
    endDate: "2026-09-30",
    workstreams: [
      { name: "Azure landing zone", status: "Complete", progress: 100, leadId: "c-emma" },
      { name: "Database migration", status: "In Progress", progress: 45, leadId: "c-emma" },
      { name: "Cutover & validation", status: "Not Started", progress: 0, leadId: "u-omar" },
    ],
    milestones: [
      { name: "Landing zone ready", due: "2026-03-15", status: "Done" },
      { name: "DB migration complete", due: "2026-07-15", status: "On Track" },
      { name: "Production cutover", due: "2026-09-15", status: "On Track" },
    ],
  },
  {
    id: "proj-claims-ai",
    name: "ClaimsCore AI Upgrade",
    type: "AI Upgrade",
    status: "In Progress",
    health: "Healthy",
    description: "Add AI fraud scoring and adjudication assistance to ClaimsCore.",
    applicationIds: ["app-claimscore", "app-datahub"],
    capabilityId: "cap-customer-service",
    internalLeadId: "u-david",
    consultantIds: ["c-priya", "c-marcus"],
    budget: 1_350_000,
    spend: 690_000,
    progress: 58,
    riskLevel: "Medium",
    startDate: "2026-01-15",
    endDate: "2026-10-30",
    workstreams: [
      { name: "Feature store build", status: "In Progress", progress: 70, leadId: "c-marcus" },
      { name: "Fraud scoring model", status: "In Progress", progress: 55, leadId: "c-priya" },
      { name: "Adjudication copilot", status: "Not Started", progress: 0, leadId: "u-david" },
    ],
    milestones: [
      { name: "Data readiness", due: "2026-03-30", status: "Done" },
      { name: "Fraud model in pilot", due: "2026-07-30", status: "On Track" },
      { name: "Production rollout", due: "2026-10-15", status: "On Track" },
    ],
  },
  {
    id: "proj-vendor-migrate",
    name: "Vendor Portal Re-platform",
    type: "Cloud Migration",
    status: "Planning",
    health: "Healthy",
    description: "Move Vendor Portal off Windows Server 2012 R2 and SQL Server 2014.",
    applicationIds: ["app-vendorportal"],
    capabilityId: "cap-finance",
    internalLeadId: "u-james",
    consultantIds: ["c-emma"],
    budget: 460_000,
    spend: 40_000,
    progress: 12,
    riskLevel: "Medium",
    startDate: "2026-05-01",
    endDate: "2026-11-30",
    workstreams: [
      { name: "Assessment & design", status: "In Progress", progress: 35, leadId: "c-emma" },
      { name: "Migration", status: "Not Started", progress: 0, leadId: "c-emma" },
    ],
    milestones: [
      { name: "Migration design approved", due: "2026-06-30", status: "On Track" },
      { name: "Cutover", due: "2026-11-15", status: "On Track" },
    ],
  },
  {
    id: "proj-techdebt-q3",
    name: "Tech Debt Remediation — Q3 Wave",
    type: "Tech Debt Remediation",
    status: "Planning",
    health: "Healthy",
    description: "Targeted remediation across Warehouse, Order Hub pricing engine, and Customer Portal.",
    applicationIds: ["app-warehouse", "app-orderhub", "app-customerportal"],
    internalLeadId: "u-david",
    consultantIds: ["c-marcus"],
    budget: 540_000,
    spend: 0,
    progress: 5,
    riskLevel: "Low",
    startDate: "2026-07-01",
    endDate: "2026-12-15",
    workstreams: [
      { name: "Backlog triage", status: "In Progress", progress: 20, leadId: "u-david" },
    ],
    milestones: [{ name: "Remediation backlog locked", due: "2026-07-15", status: "On Track" }],
  },
  {
    id: "proj-cert-campaign",
    name: "FY26 Application Certification Campaign",
    type: "Certification Campaign",
    status: "In Progress",
    health: "At Risk",
    description: "Drive owner attestation, lifecycle validation, and AI readiness review across the portfolio.",
    applicationIds: [],
    internalLeadId: "u-mei",
    consultantIds: ["c-priya"],
    budget: 180_000,
    spend: 96_000,
    progress: 61,
    riskLevel: "Medium",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    workstreams: [
      { name: "Owner outreach", status: "In Progress", progress: 80, leadId: "u-mei" },
      { name: "Validation review", status: "In Progress", progress: 45, leadId: "c-priya" },
    ],
    milestones: [
      { name: "All owners notified", due: "2026-03-15", status: "Done" },
      { name: "80% attestation", due: "2026-06-15", status: "At Risk" },
    ],
  },
  {
    id: "proj-identity-consolidation",
    name: "Identity & Access Consolidation",
    type: "Tech Debt Remediation",
    status: "At Risk",
    health: "At Risk",
    description:
      "Consolidate fragmented identity stores across Customer Portal and Order Hub onto Azure AD B2C.",
    applicationIds: ["app-customerportal", "app-orderhub"],
    capabilityId: "cap-customer-service",
    internalLeadId: "u-omar",
    consultantIds: ["c-emma"],
    budget: 720_000,
    spend: 410_000,
    progress: 44,
    riskLevel: "High",
    startDate: "2026-01-20",
    endDate: "2026-08-31",
    workstreams: [
      { name: "B2C tenant & policy design", status: "In Progress", progress: 78, leadId: "c-emma" },
      { name: "Customer Portal cutover", status: "In Progress", progress: 38, leadId: "u-lisa" },
      { name: "Order Hub cutover", status: "In Progress", progress: 34, leadId: "u-omar" },
    ],
    milestones: [
      { name: "B2C tenant live", due: "2026-04-15", status: "Done" },
      { name: "Customer Portal cutover", due: "2026-07-15", status: "At Risk" },
      { name: "Order Hub cutover", due: "2026-08-20", status: "At Risk" },
    ],
  },
  {
    id: "proj-dr-failover",
    name: "Disaster Recovery Failover Hardening",
    type: "Tech Debt Remediation",
    status: "In Progress",
    health: "Healthy",
    description:
      "Establish automated cross-region failover for tier-1 applications and validate recovery time objectives.",
    applicationIds: ["app-orderhub", "app-financehub"],
    internalLeadId: "u-omar",
    consultantIds: [],
    budget: 360_000,
    spend: 150_000,
    progress: 55,
    riskLevel: "Low",
    startDate: "2026-02-10",
    endDate: "2026-08-15",
    workstreams: [
      { name: "Runbook automation", status: "In Progress", progress: 65, leadId: "u-omar" },
      { name: "Failover testing", status: "In Progress", progress: 45, leadId: "u-omar" },
    ],
    milestones: [
      { name: "Runbook automation complete", due: "2026-06-15", status: "On Track" },
      { name: "Full failover test passed", due: "2026-08-01", status: "On Track" },
    ],
  },
];

export const findProject = (id: string) => projects.find((p) => p.id === id);
export const projectsForApplication = (appId: string) =>
  projects.filter((p) => p.applicationIds.includes(appId));

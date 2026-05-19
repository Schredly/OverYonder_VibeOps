export type ScopeType =
  | "application"
  | "capability"
  | "project"
  | "migration"
  | "certification"
  | "portfolio";

export interface Scope {
  type: ScopeType;
  id: string;
  label: string;
}

export const RISK_TYPES = [
  "Technology",
  "Security",
  "Compliance",
  "Delivery",
  "Vendor",
  "Operational",
] as const;
export type RiskType = (typeof RISK_TYPES)[number];

export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";
export type RiskLikelihood = "Unlikely" | "Possible" | "Likely" | "Almost Certain";
export type RiskStatus = "Open" | "Mitigating" | "Accepted" | "Closed" | "Escalated";

export interface ApmRisk {
  id: string;
  title: string;
  scope: Scope;
  type: RiskType;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  impact: string;
  ownerId: string;
  mitigationPlan: string;
  status: RiskStatus;
  raisedDate: string;
}

export type DecisionStatus = "Proposed" | "Under Review" | "Approved" | "Rejected" | "Deferred";

export interface ApmDecision {
  id: string;
  title: string;
  scope: Scope;
  status: DecisionStatus;
  rationale: string;
  ownerId: string;
  date: string;
}

export const apmRisks: ApmRisk[] = [
  {
    id: "risk-001",
    title: "CoreBilling runs on end-of-life COBOL/mainframe",
    scope: { type: "application", id: "app-corebilling", label: "CoreBilling" },
    type: "Technology",
    severity: "Critical",
    likelihood: "Almost Certain",
    impact: "No vendor support; scarce skills; revenue-critical system with no fallback.",
    ownerId: "u-james",
    mitigationPlan: "CoreBilling Replacement Program; bridge support contract until 2026 cutover.",
    status: "Mitigating",
    raisedDate: "2025-10-15",
  },
  {
    id: "risk-002",
    title: "Legacy GL on unsupported Windows Server 2012 R2",
    scope: { type: "application", id: "app-legacygl", label: "Legacy GL" },
    type: "Security",
    severity: "Critical",
    likelihood: "Likely",
    impact: "Unpatched OS — material security exposure for a finance system.",
    ownerId: "u-rachel",
    mitigationPlan: "Accelerate decommission (Wave 4); compensating network controls in interim.",
    status: "Escalated",
    raisedDate: "2025-11-02",
  },
  {
    id: "risk-003",
    title: "FieldForce database migration data-loss risk",
    scope: { type: "migration", id: "wave-2", label: "Wave 2 — FieldForce DB Migration" },
    type: "Delivery",
    severity: "High",
    likelihood: "Possible",
    impact: "Work-order history could be corrupted during SQL Server → Azure SQL move.",
    ownerId: "c-emma",
    mitigationPlan: "Dual-write validation window; full reconciliation before cutover.",
    status: "Mitigating",
    raisedDate: "2026-04-10",
  },
  {
    id: "risk-004",
    title: "27 applications without a confirmed owner attestation",
    scope: { type: "certification", id: "cert-owner-fy26", label: "FY26 Owner Validation" },
    type: "Compliance",
    severity: "Medium",
    likelihood: "Likely",
    impact: "Audit finding risk; unclear accountability for risk and lifecycle decisions.",
    ownerId: "u-mei",
    mitigationPlan: "Certification campaign with weekly owner outreach; escalate overdue at day 30.",
    status: "Mitigating",
    raisedDate: "2026-03-05",
  },
  {
    id: "risk-005",
    title: "SQL Server 2014 past end of support across 2 applications",
    scope: { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" },
    type: "Technology",
    severity: "High",
    likelihood: "Almost Certain",
    impact: "No security patches for FieldForce and Vendor Portal databases.",
    ownerId: "u-omar",
    mitigationPlan: "Cloud migration projects in flight for both applications.",
    status: "Mitigating",
    raisedDate: "2026-01-20",
  },
  {
    id: "risk-006",
    title: "Order Hub pricing engine intermittently degraded",
    scope: { type: "application", id: "app-orderhub", label: "Order Hub" },
    type: "Operational",
    severity: "Medium",
    likelihood: "Possible",
    impact: "Quote latency spikes during peak; customer-facing impact.",
    ownerId: "u-lisa",
    mitigationPlan: "Pricing engine remediation in Q3 tech-debt wave.",
    status: "Open",
    raisedDate: "2026-04-28",
  },
  {
    id: "risk-007",
    title: "ClaimsCore AI fraud model — data sensitivity exposure",
    scope: { type: "project", id: "proj-claims-ai", label: "ClaimsCore AI Upgrade" },
    type: "Compliance",
    severity: "Medium",
    likelihood: "Possible",
    impact: "Restricted claim and payment data feeding model features needs governance review.",
    ownerId: "u-rachel",
    mitigationPlan: "Data sensitivity classification campaign; feature-store access controls.",
    status: "Open",
    raisedDate: "2026-05-06",
  },
  {
    id: "risk-008",
    title: "CoreBilling replacement budget pressure",
    scope: { type: "project", id: "proj-billing-replace", label: "CoreBilling Replacement Program" },
    type: "Delivery",
    severity: "High",
    likelihood: "Possible",
    impact: "Spend at 56% with 52% progress; data migration complexity may overrun.",
    ownerId: "u-tom",
    mitigationPlan: "Re-baseline data workstream; weekly steering review.",
    status: "Open",
    raisedDate: "2026-05-09",
  },
  {
    id: "risk-009",
    title: "Adobe Flash components in Legacy GL",
    scope: { type: "application", id: "app-legacygl", label: "Legacy GL" },
    type: "Technology",
    severity: "Medium",
    likelihood: "Almost Certain",
    impact: "Flash long past EOL; UI unusable on modern browsers.",
    ownerId: "u-james",
    mitigationPlan: "Covered by Legacy GL decommission — no remediation, retire.",
    status: "Accepted",
    raisedDate: "2026-02-14",
  },
  {
    id: "risk-010",
    title: "Vendor Portal vendor heavily customized (Coupa fork)",
    scope: { type: "application", id: "app-vendorportal", label: "Vendor Portal" },
    type: "Vendor",
    severity: "Medium",
    likelihood: "Likely",
    impact: "Customizations block clean upgrades; re-platform must reduce divergence.",
    ownerId: "u-james",
    mitigationPlan: "Re-platform project to assess return to standard product.",
    status: "Open",
    raisedDate: "2026-04-30",
  },
];

export const apmDecisions: ApmDecision[] = [
  {
    id: "dec-001",
    title: "Retire Legacy GL rather than re-platform",
    scope: { type: "application", id: "app-legacygl", label: "Legacy GL" },
    status: "Approved",
    rationale: "Only 12 users; functionality fully covered by FinanceHub. Retire after archival.",
    ownerId: "u-sandra",
    date: "2026-02-20",
  },
  {
    id: "dec-002",
    title: "Standardize on Azure SQL for re-platformed databases",
    scope: { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" },
    status: "Approved",
    rationale: "Aligns with cloud strategy; consolidates two migrations on one target platform.",
    ownerId: "u-david",
    date: "2026-03-12",
  },
  {
    id: "dec-003",
    title: "Build vs buy for CoreBilling revenue engine",
    scope: { type: "project", id: "proj-billing-replace", label: "CoreBilling Replacement Program" },
    status: "Under Review",
    rationale: "Evaluating SAP-native revenue recognition vs a best-of-breed billing product.",
    ownerId: "u-james",
    date: "2026-05-08",
  },
  {
    id: "dec-004",
    title: "Grant OverYonder Advisory scoped access to ClaimsCore",
    scope: { type: "application", id: "app-claimscore", label: "ClaimsCore" },
    status: "Approved",
    rationale: "AI upgrade requires consultant access to feature store and adjudication workstream.",
    ownerId: "u-david",
    date: "2026-01-18",
  },
  {
    id: "dec-005",
    title: "Defer Warehouse modernization to FY27",
    scope: { type: "application", id: "app-warehouse", label: "Warehouse Mgmt System" },
    status: "Deferred",
    rationale: "Capacity constrained; WMS is stable enough to tolerate through FY26.",
    ownerId: "u-sandra",
    date: "2026-04-15",
  },
  {
    id: "dec-006",
    title: "Adopt disposition framework (TIME model) portfolio-wide",
    scope: { type: "portfolio", id: "portfolio-core", label: "Core Portfolio" },
    status: "Approved",
    rationale: "Tolerate / Invest / Migrate / Eliminate gives every app a clear strategic intent.",
    ownerId: "u-sandra",
    date: "2026-01-10",
  },
];

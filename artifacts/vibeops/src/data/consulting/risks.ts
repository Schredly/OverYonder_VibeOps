export const RISK_TYPES = [
  "Staffing",
  "Technical",
  "Client Alignment",
  "Budget",
  "Timeline",
  "Security",
  "Adoption",
  "Governance",
] as const;

export type RiskType = (typeof RISK_TYPES)[number];
export type RiskSeverity = "Low" | "Medium" | "High" | "Critical";
export type RiskLikelihood = "Unlikely" | "Possible" | "Likely" | "Almost Certain";
export type RiskStatus = "Open" | "Mitigating" | "Accepted" | "Closed" | "Escalated";

export interface DeliveryRisk {
  id: string;
  title: string;
  engagementId: string;
  type: RiskType;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  impact: string;
  ownerId: string;
  mitigationPlan: string;
  status: RiskStatus;
  raisedDate: string;
  dueDate?: string;
}

export const deliveryRisks: DeliveryRisk[] = [
  {
    id: "r-001",
    title: "Sponsor turnover at Cascade COO level",
    engagementId: "eng-cascade-readiness",
    type: "Client Alignment",
    severity: "Critical",
    likelihood: "Almost Certain",
    impact: "Discovery stalled; 2 weeks slippage risk; recovery requires re-baselining",
    ownerId: "james-martinez",
    mitigationPlan: "Escalate to client CEO office; pause billable hours; introduce interim governance",
    status: "Escalated",
    raisedDate: "2026-04-30",
    dueDate: "2026-06-01",
  },
  {
    id: "r-002",
    title: "Epic API access bottleneck (Meridian sites 8-14)",
    engagementId: "eng-meridian-adoption",
    type: "Technical",
    severity: "High",
    likelihood: "Likely",
    impact: "Wave 2 rollout slipped; adoption KPIs at risk for end-of-quarter target",
    ownerId: "marcus-lee",
    mitigationPlan: "Joint working session with client IT; pre-stage workarounds; renegotiate KPI window",
    status: "Mitigating",
    raisedDate: "2026-05-04",
  },
  {
    id: "r-003",
    title: "Adoption variance across Wave 2 sites",
    engagementId: "eng-meridian-adoption",
    type: "Adoption",
    severity: "High",
    likelihood: "Likely",
    impact: "Three sites under 30% weekly active — risk to renewal narrative",
    ownerId: "aisha-patel",
    mitigationPlan: "Champion network re-launch; site-by-site adoption coaching cadence",
    status: "Mitigating",
    raisedDate: "2026-05-01",
  },
  {
    id: "r-004",
    title: "Sentinel logistics workstream clearance gap",
    engagementId: "eng-sentinel-program",
    type: "Staffing",
    severity: "Critical",
    likelihood: "Likely",
    impact: "3 cleared engineers required; current pipeline yields 1 by July",
    ownerId: "marcus-lee",
    mitigationPlan: "Two cleared sub-contractors identified; client COO confirming sponsorship",
    status: "Escalated",
    raisedDate: "2026-04-22",
  },
  {
    id: "r-005",
    title: "Aurora compliance scope creep (AML)",
    engagementId: "eng-aurora-security",
    type: "Budget",
    severity: "Medium",
    likelihood: "Possible",
    impact: "Margin pressure if absorbed; risk to engagement profitability",
    ownerId: "rachel-kim",
    mitigationPlan: "Submit change request; protect base scope until CR approved",
    status: "Open",
    raisedDate: "2026-05-08",
  },
  {
    id: "r-006",
    title: "Madrid integration with legacy MES",
    engagementId: "eng-veridian-modern",
    type: "Technical",
    severity: "Medium",
    likelihood: "Possible",
    impact: "Cutover delay 2-3 weeks if encountered late",
    ownerId: "henri-dubois",
    mitigationPlan: "Spike planned for early June; escalate to architecture council if blocked",
    status: "Mitigating",
    raisedDate: "2026-05-06",
  },
  {
    id: "r-007",
    title: "Wealth-management policy expansion timing",
    engagementId: "eng-atlas-governance",
    type: "Governance",
    severity: "Low",
    likelihood: "Possible",
    impact: "May extend control catalog v1 by 1-2 weeks",
    ownerId: "priya-sharma",
    mitigationPlan: "Run parallel workstreams; lock v1 scope by June 15",
    status: "Open",
    raisedDate: "2026-04-29",
  },
  {
    id: "r-008",
    title: "Sentinel mission C2 user acceptance variance",
    engagementId: "eng-sentinel-program",
    type: "Adoption",
    severity: "Medium",
    likelihood: "Possible",
    impact: "Adoption variance across squadrons could affect program KPIs",
    ownerId: "diana-ortiz",
    mitigationPlan: "Squadron-level adoption coaches embedded for 6 weeks",
    status: "Mitigating",
    raisedDate: "2026-05-04",
  },
  {
    id: "r-009",
    title: "Pacific Singapore regulatory data residency",
    engagementId: "eng-pacific-migration",
    type: "Security",
    severity: "Medium",
    likelihood: "Unlikely",
    impact: "Could trigger regional architecture variance",
    ownerId: "james-martinez",
    mitigationPlan: "Confirm residency boundaries with client privacy office; design isolated tenant",
    status: "Open",
    raisedDate: "2026-05-09",
  },
  {
    id: "r-010",
    title: "Stratos campaign B test rig availability",
    engagementId: "eng-stratos-pilot",
    type: "Timeline",
    severity: "Low",
    likelihood: "Possible",
    impact: "Could slip pilot results report by 1 week",
    ownerId: "ingrid-bauer",
    mitigationPlan: "Coordinate with test ops to lock rig calendar",
    status: "Open",
    raisedDate: "2026-05-11",
  },
];

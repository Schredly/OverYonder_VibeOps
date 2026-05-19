// Stored, editable assessment records for business applications. An assessment
// captures four 0-100 readiness dimensions plus a recommendation; the composite
// score is the average of the four dimensions.

export const ASSESSMENT_TYPES = ["AI Readiness", "Security", "Operational", "Data"] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_STATUSES = ["Draft", "In Review", "Final"] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export interface Assessment {
  id: string;
  appId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  assessorId: string; // person id (internal or consultant)
  date: string;
  /** 0-100 readiness dimensions. */
  dataReadiness: number;
  integrationReadiness: number;
  useCaseFit: number;
  governanceRisk: number;
  recommendation: string;
  notes: string;
}

/** Composite score — the average of the four readiness dimensions. */
export const assessmentComposite = (a: Assessment) =>
  Math.round((a.dataReadiness + a.integrationReadiness + a.useCaseFit + a.governanceRisk) / 4);

export const assessments: Assessment[] = [
  {
    id: "as-001",
    appId: "app-orderhub",
    type: "AI Readiness",
    status: "Final",
    assessorId: "c-priya",
    date: "2026-04-20",
    dataReadiness: 82,
    integrationReadiness: 88,
    useCaseFit: 90,
    governanceRisk: 74,
    recommendation:
      "Strong AI modernization candidate — prioritize Order Hub for a near-term pricing & quoting copilot pilot.",
    notes:
      "Clean data model and event-based integrations already in place. Governance review needed for customer PII before it reaches prompts.",
  },
  {
    id: "as-002",
    appId: "app-claimscore",
    type: "AI Readiness",
    status: "In Review",
    assessorId: "c-priya",
    date: "2026-05-04",
    dataReadiness: 78,
    integrationReadiness: 70,
    useCaseFit: 86,
    governanceRisk: 58,
    recommendation:
      "Viable candidate — shore up governance & risk controls on restricted claims data before the fraud-model build.",
    notes:
      "Feature store in progress. Restricted payment data requires access controls and a data sensitivity sign-off.",
  },
  {
    id: "as-003",
    appId: "app-customerportal",
    type: "AI Readiness",
    status: "Draft",
    assessorId: "c-marcus",
    date: "2026-05-12",
    dataReadiness: 64,
    integrationReadiness: 72,
    useCaseFit: 68,
    governanceRisk: 70,
    recommendation:
      "Not yet ready — close data-readiness gaps from the fragmented identity stores before committing to a build.",
    notes: "Identity consolidation project must land first. Re-assess after the Azure AD B2C cutover.",
  },
  {
    id: "as-004",
    appId: "app-datahub",
    type: "AI Readiness",
    status: "Final",
    assessorId: "u-david",
    date: "2026-04-12",
    dataReadiness: 90,
    integrationReadiness: 84,
    useCaseFit: 80,
    governanceRisk: 78,
    recommendation:
      "Strong foundation — Enterprise Data Hub is well positioned as the feature and retrieval layer for portfolio AI use cases.",
    notes: "Snowflake + Python stack. Recommend formalizing a feature-store contract for downstream applications.",
  },
  {
    id: "as-005",
    appId: "app-corebilling",
    type: "Security",
    status: "Final",
    assessorId: "u-rachel",
    date: "2026-03-10",
    dataReadiness: 40,
    integrationReadiness: 35,
    useCaseFit: 30,
    governanceRisk: 28,
    recommendation:
      "Critical exposure — the mainframe COBOL stack is unsupported. No AI work until the replacement program cuts over.",
    notes: "Covered by the CoreBilling Replacement Program. Compensating network controls in place in the interim.",
  },
  {
    id: "as-006",
    appId: "app-fieldforce",
    type: "Operational",
    status: "In Review",
    assessorId: "u-omar",
    date: "2026-05-06",
    dataReadiness: 66,
    integrationReadiness: 58,
    useCaseFit: 62,
    governanceRisk: 60,
    recommendation:
      "Re-assess after the Azure cloud migration completes — operational posture will improve materially post-cutover.",
    notes: "SQL Server 2014 end-of-support is the main drag. Wave 2 database migration is in flight.",
  },
  {
    id: "as-007",
    appId: "app-warehouse",
    type: "Data",
    status: "Draft",
    assessorId: "u-rachel",
    date: "2026-05-05",
    dataReadiness: 54,
    integrationReadiness: 50,
    useCaseFit: 48,
    governanceRisk: 56,
    recommendation:
      "Deferred — data quality and classification work is required before the WMS is a candidate for AI augmentation.",
    notes: "Tech-debt backlog triage is scheduled for the Q3 wave.",
  },
];

export const assessmentsForApp = (appId: string) => assessments.filter((a) => a.appId === appId);

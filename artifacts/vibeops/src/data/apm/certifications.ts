export const CERT_TYPES = [
  "Owner Validation",
  "Lifecycle Validation",
  "Risk Validation",
  "AI Readiness",
  "Data Sensitivity",
  "Vendor Review",
] as const;
export type CertType = (typeof CERT_TYPES)[number];

export type AttestationStatus = "Certified" | "In Progress" | "Overdue" | "Not Started";

export interface Attestation {
  appId: string;
  status: AttestationStatus;
  /** Internal owner responsible for the attestation. */
  ownerId: string;
  /** Optional consultant assisting. */
  consultantId?: string;
  completedDate?: string;
}

export interface CertificationCampaign {
  id: string;
  name: string;
  type: CertType;
  description: string;
  dueDate: string;
  status: "Active" | "Closing" | "Complete" | "Draft";
  ownerId: string;
  attestations: Attestation[];
}

export const certificationCampaigns: CertificationCampaign[] = [
  {
    id: "cert-owner-fy26",
    name: "FY26 Application Owner Validation",
    type: "Owner Validation",
    description: "Every business application must have a confirmed, current internal owner.",
    dueDate: "2026-06-15",
    status: "Active",
    ownerId: "u-mei",
    attestations: [
      { appId: "app-orderhub", status: "Certified", ownerId: "u-lisa", completedDate: "2026-04-02" },
      { appId: "app-claimscore", status: "In Progress", ownerId: "u-lisa" },
      { appId: "app-fieldforce", status: "Overdue", ownerId: "u-omar" },
      { appId: "app-corebilling", status: "Overdue", ownerId: "u-james" },
      { appId: "app-legacygl", status: "Not Started", ownerId: "u-james" },
      { appId: "app-financehub", status: "Certified", ownerId: "u-james", completedDate: "2026-03-28" },
      { appId: "app-crm", status: "In Progress", ownerId: "u-lisa" },
      { appId: "app-customerportal", status: "In Progress", ownerId: "u-lisa" },
      { appId: "app-datahub", status: "Not Started", ownerId: "u-david" },
      { appId: "app-warehouse", status: "In Progress", ownerId: "u-omar" },
      { appId: "app-itsm", status: "Certified", ownerId: "u-omar", completedDate: "2026-03-20" },
      { appId: "app-grc", status: "Certified", ownerId: "u-rachel", completedDate: "2026-03-19" },
      { appId: "app-hrcore", status: "Certified", ownerId: "u-mei", completedDate: "2026-03-25" },
      { appId: "app-vendorportal", status: "In Progress", ownerId: "u-james" },
    ],
  },
  {
    id: "cert-ai-fy26",
    name: "FY26 AI Readiness Review",
    type: "AI Readiness",
    description: "Assess each application for AI modernization potential and data readiness.",
    dueDate: "2026-07-31",
    status: "Active",
    ownerId: "u-david",
    attestations: [
      { appId: "app-orderhub", status: "Certified", ownerId: "u-lisa", consultantId: "c-priya", completedDate: "2026-04-20" },
      { appId: "app-claimscore", status: "In Progress", ownerId: "u-lisa", consultantId: "c-priya" },
      { appId: "app-customerportal", status: "In Progress", ownerId: "u-lisa", consultantId: "c-marcus" },
      { appId: "app-datahub", status: "Certified", ownerId: "u-david", completedDate: "2026-04-12" },
      { appId: "app-crm", status: "Not Started", ownerId: "u-lisa" },
      { appId: "app-financehub", status: "Not Started", ownerId: "u-james" },
      { appId: "app-itsm", status: "In Progress", ownerId: "u-omar" },
    ],
  },
  {
    id: "cert-risk-q2",
    name: "Q2 Risk & Lifecycle Validation",
    type: "Risk Validation",
    description: "Confirm risk rating and lifecycle stage for critical and high-criticality applications.",
    dueDate: "2026-05-30",
    status: "Closing",
    ownerId: "u-rachel",
    attestations: [
      { appId: "app-corebilling", status: "Overdue", ownerId: "u-james", consultantId: "c-marcus" },
      { appId: "app-legacygl", status: "Overdue", ownerId: "u-james" },
      { appId: "app-fieldforce", status: "In Progress", ownerId: "u-omar", consultantId: "c-emma" },
      { appId: "app-orderhub", status: "Certified", ownerId: "u-lisa", completedDate: "2026-05-02" },
      { appId: "app-financehub", status: "Certified", ownerId: "u-james", completedDate: "2026-05-01" },
      { appId: "app-claimscore", status: "Certified", ownerId: "u-lisa", completedDate: "2026-05-04" },
    ],
  },
  {
    id: "cert-data-fy26",
    name: "FY26 Data Sensitivity Classification",
    type: "Data Sensitivity",
    description: "Classify data objects and confirm handling controls per application.",
    dueDate: "2026-08-31",
    status: "Draft",
    ownerId: "u-rachel",
    attestations: [
      { appId: "app-claimscore", status: "Not Started", ownerId: "u-lisa" },
      { appId: "app-hrcore", status: "Not Started", ownerId: "u-mei" },
      { appId: "app-customerportal", status: "Not Started", ownerId: "u-lisa" },
    ],
  },
];

export const findCampaign = (id: string) => certificationCampaigns.find((c) => c.id === id);

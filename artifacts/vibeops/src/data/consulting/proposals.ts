export const PROPOSAL_STAGES = [
  "Discovery",
  "Qualification",
  "Solutioning",
  "Proposal Submitted",
  "Executive Review",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

export type ProposalStage = (typeof PROPOSAL_STAGES)[number];

export const PRACTICE_AREAS = [
  "AI Strategy",
  "AI Modernization",
  "AI Governance",
  "Security",
  "Adoption",
  "Managed Services",
  "Operating Model",
] as const;

export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export interface Proposal {
  id: string;
  name: string;
  clientName: string;
  clientId?: string;
  practiceArea: PracticeArea;
  value: number;
  probability: number;
  stage: ProposalStage;
  expectedClose: string;
  ownerId: string; // consultant id
  nextStep: string;
  ageDays: number;
}

export const proposals: Proposal[] = [
  { id: "p-001", name: "Atlas Wealth — AI Trading Copilots", clientName: "Atlas Federal Bank", clientId: "atlas-federal", practiceArea: "AI Modernization", value: 2_400_000, probability: 70, stage: "Negotiation", expectedClose: "2026-06-15", ownerId: "alex-thompson", nextStep: "Final pricing review with CFO", ageDays: 42 },
  { id: "p-002", name: "Veridian — Wave 2 Plant Modernization", clientName: "Veridian Manufacturing", clientId: "veridian-mfg", practiceArea: "AI Modernization", value: 3_100_000, probability: 80, stage: "Executive Review", expectedClose: "2026-07-01", ownerId: "alex-thompson", nextStep: "Board readout June 18", ageDays: 28 },
  { id: "p-003", name: "Aurora — AML Threat Modeling Extension", clientName: "Aurora Financial Group", clientId: "aurora-financial", practiceArea: "Security", value: 480_000, probability: 35, stage: "Solutioning", expectedClose: "2026-08-30", ownerId: "rachel-kim", nextStep: "Confirm scope with compliance", ageDays: 36 },
  { id: "p-004", name: "Northwind — Trial Design AI Phase 2", clientName: "Northwind Pharma", clientId: "northwind-pharma", practiceArea: "AI Modernization", value: 1_800_000, probability: 65, stage: "Proposal Submitted", expectedClose: "2026-07-30", ownerId: "rachel-kim", nextStep: "Q&A workshop scheduled", ageDays: 19 },
  { id: "p-005", name: "Sentinel — Logistics AI Wave 2", clientName: "Sentinel Defense Systems", clientId: "sentinel-defense", practiceArea: "Operating Model", value: 4_200_000, probability: 50, stage: "Solutioning", expectedClose: "2026-09-30", ownerId: "marcus-lee", nextStep: "Architecture deep-dive June 5", ageDays: 51 },
  { id: "p-006", name: "Helios — Claims AI Build Phase", clientName: "Helios Insurance", clientId: "helios-insurance", practiceArea: "AI Modernization", value: 1_300_000, probability: 60, stage: "Proposal Submitted", expectedClose: "2026-08-15", ownerId: "priya-sharma", nextStep: "Executive readout June 12", ageDays: 22 },
  { id: "p-007", name: "Continental — Field Ops Scale", clientName: "Continental Energy", clientId: "continental-energy", practiceArea: "AI Modernization", value: 2_700_000, probability: 75, stage: "Executive Review", expectedClose: "2026-07-15", ownerId: "alex-thompson", nextStep: "Steering committee June 21", ageDays: 18 },
  { id: "p-008", name: "Pacific — CSM Module Add-on", clientName: "Pacific Logistics Co", clientId: "pacific-logistics", practiceArea: "Adoption", value: 360_000, probability: 55, stage: "Qualification", expectedClose: "2026-09-30", ownerId: "james-martinez", nextStep: "Confirm budget with CFO", ageDays: 14 },
  { id: "p-009", name: "Stratos — Test Engineering AI Scale", clientName: "Stratos Aerospace", clientId: "stratos-aerospace", practiceArea: "AI Modernization", value: 1_650_000, probability: 70, stage: "Negotiation", expectedClose: "2026-08-01", ownerId: "alex-thompson", nextStep: "Final SOW under review", ageDays: 32 },
  { id: "p-010", name: "Quantum Tech — Managed AI Services", clientName: "Quantum Tech Solutions", clientId: "quantum-tech", practiceArea: "Managed Services", value: 2_100_000, probability: 85, stage: "Negotiation", expectedClose: "2026-07-30", ownerId: "marcus-lee", nextStep: "MSA red-line returned", ageDays: 25 },
  { id: "p-011", name: "Cascade — Re-baseline & Recovery", clientName: "Cascade Retail Group", clientId: "cascade-retail", practiceArea: "AI Strategy", value: 280_000, probability: 25, stage: "Discovery", expectedClose: "2026-09-15", ownerId: "james-martinez", nextStep: "Awaiting new sponsor", ageDays: 9 },
  { id: "p-012", name: "Meridian — Adoption Recovery Sprint", clientName: "Meridian Health Network", clientId: "meridian-health", practiceArea: "Adoption", value: 540_000, probability: 70, stage: "Solutioning", expectedClose: "2026-06-30", ownerId: "marcus-lee", nextStep: "Joint working session June 3", ageDays: 12 },
  { id: "p-013", name: "Net New — Mid-Cap Bank AI Strategy", clientName: "Confidential — Mid-Cap Bank", practiceArea: "AI Strategy", value: 950_000, probability: 40, stage: "Qualification", expectedClose: "2026-10-30", ownerId: "priya-sharma", nextStep: "Discovery workshop scheduled", ageDays: 7 },
  { id: "p-014", name: "Closed — Legacy ERP AI Add-on (lost)", clientName: "Confidential — Industrial Co", practiceArea: "AI Modernization", value: 1_200_000, probability: 0, stage: "Closed Lost", expectedClose: "2026-04-30", ownerId: "alex-thompson", nextStep: "Lost to incumbent SI", ageDays: 65 },
  { id: "p-015", name: "Closed — Compliance AI Audit (won)", clientName: "Confidential — Regional Bank", practiceArea: "AI Governance", value: 480_000, probability: 100, stage: "Closed Won", expectedClose: "2026-05-01", ownerId: "priya-sharma", nextStep: "Kick-off June 1", ageDays: 38 },
];

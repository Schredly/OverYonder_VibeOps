export const ENGAGEMENT_TYPES = [
  "AI Strategy",
  "AI Modernization",
  "ServiceNow Migration",
  "AI Governance",
  "AI Readiness",
  "Agentic Workflow Deployment",
  "Operational Transformation",
  "Managed AI Services",
] as const;

export type EngagementType = (typeof ENGAGEMENT_TYPES)[number];

export const ENGAGEMENT_PHASES = [
  "Discovery",
  "Assessment",
  "Architecture",
  "Pilot",
  "Delivery",
  "Adoption",
  "Optimization",
  "Managed Services",
] as const;

export type EngagementPhase = (typeof ENGAGEMENT_PHASES)[number];

export type Health = "Healthy" | "At Risk" | "Critical";

export interface Milestone {
  name: string;
  due: string;
  status: "Done" | "On Track" | "At Risk" | "Slipped";
}

export interface Deliverable {
  name: string;
  status: "Draft" | "In Review" | "Approved" | "Delivered";
  owner: string;
  due: string;
}

export interface ActivityEntry {
  ts: string;
  actor: string;
  message: string;
}

export interface Engagement {
  id: string;
  name: string;
  clientId: string;
  type: EngagementType;
  phase: EngagementPhase;
  deliveryManagerId: string; // consultant id
  teamIds: string[]; // consultant ids
  budget: number;
  revenueRecognized: number;
  margin: number; // %
  health: Health;
  startDate: string;
  endDate: string;
  progress: number; // %
  riskCount: number;
  programId?: string;
  aiPlatforms: string[];
  applications: string[];
  executiveSummary: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  activity: ActivityEntry[];
}

export const engagements: Engagement[] = [
  {
    id: "eng-veridian-modern",
    name: "Veridian Plant Operations Modernization",
    clientId: "veridian-mfg",
    type: "AI Modernization",
    phase: "Delivery",
    deliveryManagerId: "alex-thompson",
    teamIds: ["alex-thompson", "henri-dubois", "emma-schmidt"],
    budget: 2_400_000,
    revenueRecognized: 1_620_000,
    margin: 38,
    health: "Healthy",
    startDate: "2026-01-12",
    endDate: "2026-09-30",
    progress: 68,
    riskCount: 2,
    programId: "prog-veridian-mfg",
    aiPlatforms: ["Azure OpenAI", "Databricks"],
    applications: ["SAP S/4HANA", "Plant MES"],
    executiveSummary:
      "Modernize four EU plants onto a unified AI-assisted operations stack. Pilot is live in Hamburg with 18% throughput uplift; rollout to Lyon and Madrid kicks off Q3.",
    milestones: [
      { name: "Hamburg pilot live", due: "2026-03-15", status: "Done" },
      { name: "Lyon cutover", due: "2026-07-01", status: "On Track" },
      { name: "Madrid cutover", due: "2026-08-15", status: "At Risk" },
      { name: "Stabilization complete", due: "2026-09-30", status: "On Track" },
    ],
    deliverables: [
      { name: "Operating model design", status: "Approved", owner: "Sven Larsson", due: "2026-02-28" },
      { name: "Reference architecture", status: "Approved", owner: "Emma Schmidt", due: "2026-03-31" },
      { name: "Lyon runbook", status: "In Review", owner: "Henri Dubois", due: "2026-06-15" },
      { name: "Adoption playbook", status: "Draft", owner: "Marcus Lee", due: "2026-07-30" },
    ],
    activity: [
      { ts: "2026-05-12", actor: "Emma Schmidt", message: "Lyon environment provisioning 80% complete" },
      { ts: "2026-05-09", actor: "Alex Thompson", message: "Steering committee — Hamburg metrics presented, scope expanded to include Madrid" },
      { ts: "2026-05-04", actor: "Henri Dubois", message: "Identified 2 integration risks with legacy MES" },
    ],
  },
  {
    id: "eng-atlas-governance",
    name: "Atlas AI Governance & Risk Framework",
    clientId: "atlas-federal",
    type: "AI Governance",
    phase: "Delivery",
    deliveryManagerId: "priya-sharma",
    teamIds: ["priya-sharma"],
    budget: 1_350_000,
    revenueRecognized: 920_000,
    margin: 42,
    health: "Healthy",
    startDate: "2026-02-01",
    endDate: "2026-08-15",
    progress: 65,
    riskCount: 1,
    aiPlatforms: ["OpenAI Enterprise", "Anthropic"],
    applications: ["ServiceNow GRC", "Snowflake"],
    executiveSummary:
      "Stand up an enterprise-wide AI governance and model-risk-management capability spanning legal, risk, compliance, and engineering. First-wave policies live; control catalog under review.",
    milestones: [
      { name: "AI policy ratified", due: "2026-03-01", status: "Done" },
      { name: "Model inventory baseline", due: "2026-04-15", status: "Done" },
      { name: "Control catalog v1", due: "2026-06-30", status: "On Track" },
      { name: "Operating committee live", due: "2026-08-15", status: "On Track" },
    ],
    deliverables: [
      { name: "AI Governance Charter", status: "Delivered", owner: "Priya Sharma", due: "2026-03-01" },
      { name: "Model inventory", status: "Approved", owner: "Daniela Cruz", due: "2026-04-15" },
      { name: "Control catalog v1", status: "In Review", owner: "Priya Sharma", due: "2026-06-30" },
    ],
    activity: [
      { ts: "2026-05-10", actor: "Priya Sharma", message: "Compliance signed off on prompt-injection policy" },
      { ts: "2026-04-28", actor: "Maria Chen", message: "Approved expansion of scope into wealth management line" },
    ],
  },
  {
    id: "eng-meridian-adoption",
    name: "Meridian Clinician AI Adoption",
    clientId: "meridian-health",
    type: "Agentic Workflow Deployment",
    phase: "Adoption",
    deliveryManagerId: "marcus-lee",
    teamIds: ["marcus-lee", "aisha-patel", "tom-becker"],
    budget: 1_120_000,
    revenueRecognized: 880_000,
    margin: 28,
    health: "At Risk",
    startDate: "2025-11-04",
    endDate: "2026-06-30",
    progress: 78,
    riskCount: 4,
    programId: "prog-meridian-care",
    aiPlatforms: ["Claude Sonnet", "Microsoft Copilot"],
    applications: ["Epic", "ServiceNow"],
    executiveSummary:
      "Roll out clinician AI copilot across 14 hospitals. Adoption uneven — 3 sites under 30% weekly active. Recovery plan focused on physician champion network and EHR integration polish.",
    milestones: [
      { name: "Pilot complete", due: "2026-01-31", status: "Done" },
      { name: "Wave 1 rollout (5 sites)", due: "2026-03-30", status: "Done" },
      { name: "Wave 2 rollout (9 sites)", due: "2026-05-15", status: "Slipped" },
      { name: "Adoption ≥ 60% weekly active", due: "2026-06-30", status: "At Risk" },
    ],
    deliverables: [
      { name: "Pilot readout", status: "Delivered", owner: "Aisha Patel", due: "2026-02-05" },
      { name: "Champion playbook", status: "Approved", owner: "Marcus Lee", due: "2026-03-15" },
      { name: "Adoption recovery plan", status: "In Review", owner: "Marcus Lee", due: "2026-05-22" },
    ],
    activity: [
      { ts: "2026-05-13", actor: "Marcus Lee", message: "Adoption recovery plan submitted to client steering" },
      { ts: "2026-05-08", actor: "Aisha Patel", message: "EHR integration bug fix released" },
      { ts: "2026-05-01", actor: "James Wright (CMIO)", message: "Escalated wave 2 slippage; weekly cadence agreed" },
    ],
  },
  {
    id: "eng-aurora-security",
    name: "Aurora AI Security & Threat Modeling",
    clientId: "aurora-financial",
    type: "AI Readiness",
    phase: "Assessment",
    deliveryManagerId: "rachel-kim",
    teamIds: ["rachel-kim", "lin-wei"],
    budget: 720_000,
    revenueRecognized: 310_000,
    margin: 19,
    health: "At Risk",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    progress: 32,
    riskCount: 3,
    aiPlatforms: ["Azure OpenAI"],
    applications: ["Salesforce FSC", "Snowflake"],
    executiveSummary:
      "Comprehensive AI security posture assessment for Aurora's wealth management line. Margin pressured by extended discovery and unplanned compliance scope.",
    milestones: [
      { name: "Threat model workshops", due: "2026-04-15", status: "Done" },
      { name: "Tabletop exercise", due: "2026-05-30", status: "On Track" },
      { name: "Findings & remediation plan", due: "2026-07-15", status: "On Track" },
      { name: "Executive readout", due: "2026-08-31", status: "On Track" },
    ],
    deliverables: [
      { name: "Threat models", status: "In Review", owner: "Rachel Kim", due: "2026-05-15" },
      { name: "Findings report", status: "Draft", owner: "Lin Wei", due: "2026-07-10" },
    ],
    activity: [
      { ts: "2026-05-11", actor: "Marco Russo", message: "Compliance requested expanded scope into AML; pending CR" },
      { ts: "2026-04-29", actor: "Rachel Kim", message: "Threat model workshops complete across 3 workstreams" },
    ],
  },
  {
    id: "eng-pacific-migration",
    name: "Pacific Logistics ServiceNow Migration",
    clientId: "pacific-logistics",
    type: "ServiceNow Migration",
    phase: "Architecture",
    deliveryManagerId: "james-martinez",
    teamIds: ["james-martinez", "yuki-nakamura"],
    budget: 880_000,
    revenueRecognized: 240_000,
    margin: 31,
    health: "Healthy",
    startDate: "2026-04-01",
    endDate: "2026-12-15",
    progress: 22,
    riskCount: 1,
    aiPlatforms: ["ServiceNow Now Assist"],
    applications: ["ServiceNow ITSM", "Legacy CRM"],
    executiveSummary:
      "Migrate Pacific Logistics off legacy CRM into ServiceNow ITSM + CSM with Now Assist for case triage. Architecture phase wrapping; pilot region selected (Singapore).",
    milestones: [
      { name: "Architecture sign-off", due: "2026-06-15", status: "On Track" },
      { name: "Singapore pilot live", due: "2026-09-01", status: "On Track" },
      { name: "Regional rollout complete", due: "2026-12-15", status: "On Track" },
    ],
    deliverables: [
      { name: "Target architecture", status: "In Review", owner: "James Martinez", due: "2026-06-15" },
      { name: "Migration playbook", status: "Draft", owner: "Yuki Nakamura", due: "2026-07-30" },
    ],
    activity: [
      { ts: "2026-05-09", actor: "Yuki Nakamura", message: "Singapore pilot region confirmed by Hiroshi Tanaka" },
    ],
  },
  {
    id: "eng-continental-strategy",
    name: "Continental AI Operating Strategy",
    clientId: "continental-energy",
    type: "AI Strategy",
    phase: "Pilot",
    deliveryManagerId: "alex-thompson",
    teamIds: ["alex-thompson", "sven-larsson"],
    budget: 1_100_000,
    revenueRecognized: 540_000,
    margin: 44,
    health: "Healthy",
    startDate: "2026-02-15",
    endDate: "2026-07-31",
    progress: 52,
    riskCount: 1,
    aiPlatforms: ["Anthropic", "Internal LLM"],
    applications: ["Trading platform", "SCADA"],
    executiveSummary:
      "Build Continental's enterprise AI operating strategy and stand up two flagship pilots in trading analytics and field operations. Both pilots green.",
    milestones: [
      { name: "Strategy delivered", due: "2026-04-15", status: "Done" },
      { name: "Trading pilot live", due: "2026-06-01", status: "On Track" },
      { name: "Field-ops pilot live", due: "2026-06-15", status: "On Track" },
      { name: "Steering decision on scale", due: "2026-07-31", status: "On Track" },
    ],
    deliverables: [
      { name: "AI Operating Strategy", status: "Delivered", owner: "Alex Thompson", due: "2026-04-15" },
      { name: "Pilot architecture", status: "Approved", owner: "Sven Larsson", due: "2026-05-01" },
    ],
    activity: [
      { ts: "2026-05-13", actor: "Catherine Vale", message: "Approved expansion budget conditional on pilot KPIs" },
    ],
  },
  {
    id: "eng-helios-readiness",
    name: "Helios Claims AI Readiness",
    clientId: "helios-insurance",
    type: "AI Readiness",
    phase: "Assessment",
    deliveryManagerId: "priya-sharma",
    teamIds: ["priya-sharma", "sophia-reyes"],
    budget: 460_000,
    revenueRecognized: 180_000,
    margin: 36,
    health: "Healthy",
    startDate: "2026-03-15",
    endDate: "2026-07-30",
    progress: 38,
    riskCount: 0,
    aiPlatforms: ["AWS Bedrock"],
    applications: ["Guidewire", "Snowflake"],
    executiveSummary:
      "Assess claims operations for AI readiness. Three high-value use cases identified; business case in progress.",
    milestones: [
      { name: "Use case discovery", due: "2026-04-30", status: "Done" },
      { name: "Business case", due: "2026-06-15", status: "On Track" },
      { name: "Readiness readout", due: "2026-07-30", status: "On Track" },
    ],
    deliverables: [
      { name: "Use case inventory", status: "Approved", owner: "Sophia Reyes", due: "2026-04-30" },
      { name: "Business case", status: "Draft", owner: "Sophia Reyes", due: "2026-06-15" },
    ],
    activity: [{ ts: "2026-05-08", actor: "David Park", message: "Confirmed CFO sponsorship for next phase" }],
  },
  {
    id: "eng-northwind-modern",
    name: "Northwind R&D Data Modernization",
    clientId: "northwind-pharma",
    type: "AI Modernization",
    phase: "Delivery",
    deliveryManagerId: "rachel-kim",
    teamIds: ["rachel-kim", "felix-hartmann"],
    budget: 1_900_000,
    revenueRecognized: 1_350_000,
    margin: 41,
    health: "Healthy",
    startDate: "2025-11-01",
    endDate: "2026-08-30",
    progress: 72,
    riskCount: 1,
    aiPlatforms: ["AWS Bedrock", "Databricks"],
    applications: ["LIMS", "Veeva"],
    executiveSummary:
      "Consolidate R&D data estate and stand up an ML platform supporting target identification and trial design. On track for August GA.",
    milestones: [
      { name: "Data lake live", due: "2026-02-28", status: "Done" },
      { name: "ML platform GA", due: "2026-06-30", status: "On Track" },
      { name: "First model in production", due: "2026-08-30", status: "On Track" },
    ],
    deliverables: [
      { name: "Data architecture", status: "Delivered", owner: "Felix Hartmann", due: "2026-01-30" },
      { name: "ML platform design", status: "Approved", owner: "Felix Hartmann", due: "2026-04-30" },
    ],
    activity: [{ ts: "2026-05-11", actor: "Felix Hartmann", message: "Trial design model passed validation" }],
  },
  {
    id: "eng-sentinel-program",
    name: "Sentinel Mission Systems AI Program",
    clientId: "sentinel-defense",
    type: "Operational Transformation",
    phase: "Delivery",
    deliveryManagerId: "marcus-lee",
    teamIds: ["marcus-lee", "diana-ortiz"],
    budget: 3_400_000,
    revenueRecognized: 1_980_000,
    margin: 35,
    health: "At Risk",
    startDate: "2025-09-15",
    endDate: "2026-12-30",
    progress: 58,
    riskCount: 5,
    programId: "prog-sentinel-mission",
    aiPlatforms: ["Internal LLM", "AWS GovCloud"],
    applications: ["Mission C2", "Logistics ERP"],
    executiveSummary:
      "Multi-workstream transformation of mission systems and logistics. Workstream 2 (logistics) at risk on schedule due to clearance bottleneck.",
    milestones: [
      { name: "Mission C2 pilot", due: "2026-04-01", status: "Done" },
      { name: "Logistics workstream cutover", due: "2026-08-30", status: "At Risk" },
      { name: "Program close", due: "2026-12-30", status: "On Track" },
    ],
    deliverables: [
      { name: "Mission C2 architecture", status: "Approved", owner: "Diana Ortiz", due: "2026-02-28" },
      { name: "Logistics roadmap", status: "In Review", owner: "Marcus Lee", due: "2026-06-30" },
    ],
    activity: [
      { ts: "2026-05-12", actor: "Marcus Lee", message: "Clearance bottleneck escalated to client COO" },
      { ts: "2026-05-04", actor: "Diana Ortiz", message: "Mission C2 pilot accepted by user community" },
    ],
  },
  {
    id: "eng-cascade-readiness",
    name: "Cascade Retail AI Readiness",
    clientId: "cascade-retail",
    type: "AI Readiness",
    phase: "Discovery",
    deliveryManagerId: "james-martinez",
    teamIds: ["james-martinez", "carlos-mendez"],
    budget: 320_000,
    revenueRecognized: 80_000,
    margin: 8,
    health: "Critical",
    startDate: "2026-03-20",
    endDate: "2026-07-30",
    progress: 18,
    riskCount: 4,
    aiPlatforms: ["Azure OpenAI"],
    applications: ["NetSuite", "Shopify Plus"],
    executiveSummary:
      "Discovery stalled — sponsor turnover at COO level created alignment vacuum. Recovery requires re-baselining sponsorship.",
    milestones: [
      { name: "Discovery workshops", due: "2026-04-30", status: "Slipped" },
      { name: "Use case shortlist", due: "2026-05-30", status: "At Risk" },
      { name: "Readiness readout", due: "2026-07-30", status: "At Risk" },
    ],
    deliverables: [{ name: "Use case shortlist", status: "Draft", owner: "Carlos Mendez", due: "2026-05-30" }],
    activity: [
      { ts: "2026-05-13", actor: "James Martinez", message: "Awaiting new sponsor introduction from CEO office" },
    ],
  },
  {
    id: "eng-stratos-pilot",
    name: "Stratos Avionics AI Pilot",
    clientId: "stratos-aerospace",
    type: "Agentic Workflow Deployment",
    phase: "Pilot",
    deliveryManagerId: "alex-thompson",
    teamIds: ["alex-thompson", "emma-schmidt", "ingrid-bauer"],
    budget: 690_000,
    revenueRecognized: 410_000,
    margin: 39,
    health: "Healthy",
    startDate: "2026-01-20",
    endDate: "2026-07-30",
    progress: 60,
    riskCount: 1,
    aiPlatforms: ["Anthropic", "Azure OpenAI"],
    applications: ["PLM", "Flight Test DB"],
    executiveSummary:
      "Agentic copilots for avionics test engineers. Pilot live on 2 test campaigns; results promising on cycle-time reduction.",
    milestones: [
      { name: "Copilot v1", due: "2026-03-30", status: "Done" },
      { name: "Test campaign A", due: "2026-05-30", status: "Done" },
      { name: "Test campaign B", due: "2026-07-15", status: "On Track" },
      { name: "Scale decision", due: "2026-07-30", status: "On Track" },
    ],
    deliverables: [
      { name: "Copilot v1", status: "Delivered", owner: "Emma Schmidt", due: "2026-03-30" },
      { name: "Pilot results report", status: "In Review", owner: "Ingrid Bauer", due: "2026-07-15" },
    ],
    activity: [{ ts: "2026-05-12", actor: "Ingrid Bauer", message: "Cycle time reduced 22% on campaign A" }],
  },
  {
    id: "eng-quantum-rollout",
    name: "Quantum Tech Agentic Workflow Rollout",
    clientId: "quantum-tech",
    type: "Agentic Workflow Deployment",
    phase: "Optimization",
    deliveryManagerId: "marcus-lee",
    teamIds: ["mei-lin", "yuki-nakamura"],
    budget: 1_240_000,
    revenueRecognized: 1_010_000,
    margin: 46,
    health: "Healthy",
    startDate: "2025-10-15",
    endDate: "2026-07-15",
    progress: 84,
    riskCount: 0,
    aiPlatforms: ["Internal LLM", "OpenAI"],
    applications: ["Internal Dev Platform"],
    executiveSummary:
      "Engineer productivity copilots deployed to 1,400 engineers. Optimization phase focused on cost-per-call reductions and routing.",
    milestones: [
      { name: "GA across engineering", due: "2026-03-15", status: "Done" },
      { name: "Routing & cost optimization", due: "2026-06-15", status: "On Track" },
      { name: "Program close", due: "2026-07-15", status: "On Track" },
    ],
    deliverables: [
      { name: "Cost optimization report", status: "In Review", owner: "Mei Lin", due: "2026-06-01" },
    ],
    activity: [{ ts: "2026-05-10", actor: "Mei Lin", message: "Cost-per-call down 31% post-routing changes" }],
  },
];

export const findEngagement = (id: string) => engagements.find((e) => e.id === id);
export const engagementsForClient = (clientId: string) =>
  engagements.filter((e) => e.clientId === clientId);

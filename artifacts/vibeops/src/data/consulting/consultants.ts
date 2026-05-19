export type ConsultantLevel = "Analyst" | "Consultant" | "Senior" | "Manager" | "Principal" | "Partner";

export interface Consultant {
  id: string;
  name: string;
  initials: string;
  level: ConsultantLevel;
  practice: string;
  region: "AMER" | "EMEA" | "APAC";
  utilizationTarget: number; // %
  utilizationActual: number; // %
  billRate: number; // $/hr
  skills: string[];
  currentEngagements: string[]; // engagement ids
  futureCapacity: number; // % of capacity available next 60d
}

export const consultants: Consultant[] = [
  { id: "alex-thompson", name: "Alex Thompson", initials: "AT", level: "Partner", practice: "AI Strategy", region: "AMER", utilizationTarget: 40, utilizationActual: 38, billRate: 850, skills: ["AI Strategy", "Executive Advisory"], currentEngagements: ["eng-veridian-modern", "eng-continental-strategy"], futureCapacity: 35 },
  { id: "priya-sharma", name: "Priya Sharma", initials: "PS", level: "Partner", practice: "AI Governance", region: "AMER", utilizationTarget: 45, utilizationActual: 47, billRate: 825, skills: ["Governance", "Compliance", "Risk"], currentEngagements: ["eng-atlas-governance", "eng-helios-readiness"], futureCapacity: 20 },
  { id: "marcus-lee", name: "Marcus Lee", initials: "ML", level: "Principal", practice: "AI Adoption", region: "AMER", utilizationTarget: 70, utilizationActual: 82, billRate: 625, skills: ["Change Mgmt", "Adoption", "Training"], currentEngagements: ["eng-meridian-adoption", "eng-sentinel-program"], futureCapacity: 12 },
  { id: "rachel-kim", name: "Rachel Kim", initials: "RK", level: "Principal", practice: "Security", region: "AMER", utilizationTarget: 70, utilizationActual: 78, billRate: 650, skills: ["Security", "Threat Modeling", "Audit"], currentEngagements: ["eng-aurora-security", "eng-northwind-modern"], futureCapacity: 18 },
  { id: "james-martinez", name: "James Martinez", initials: "JM", level: "Manager", practice: "Modernization", region: "AMER", utilizationTarget: 80, utilizationActual: 88, billRate: 525, skills: ["Cloud", "Migration", "ServiceNow"], currentEngagements: ["eng-pacific-migration", "eng-cascade-readiness"], futureCapacity: 8 },
  { id: "diana-ortiz", name: "Diana Ortiz", initials: "DO", level: "Manager", practice: "AI Modernization", region: "AMER", utilizationTarget: 80, utilizationActual: 84, billRate: 525, skills: ["MLOps", "Platform Engineering"], currentEngagements: ["eng-sentinel-program"], futureCapacity: 22 },
  { id: "henri-dubois", name: "Henri Dubois", initials: "HD", level: "Senior", practice: "AI Strategy", region: "EMEA", utilizationTarget: 80, utilizationActual: 76, billRate: 475, skills: ["Strategy", "Operating Models"], currentEngagements: ["eng-veridian-modern"], futureCapacity: 28 },
  { id: "emma-schmidt", name: "Emma Schmidt", initials: "ES", level: "Senior", practice: "Modernization", region: "EMEA", utilizationTarget: 85, utilizationActual: 92, billRate: 425, skills: ["Cloud Native", "Architecture"], currentEngagements: ["eng-veridian-modern", "eng-stratos-pilot"], futureCapacity: 6 },
  { id: "yuki-nakamura", name: "Yuki Nakamura", initials: "YN", level: "Senior", practice: "Adoption", region: "APAC", utilizationTarget: 80, utilizationActual: 71, billRate: 415, skills: ["Adoption", "L&D", "Operations"], currentEngagements: ["eng-pacific-migration", "eng-quantum-rollout"], futureCapacity: 30 },
  { id: "felix-hartmann", name: "Felix Hartmann", initials: "FH", level: "Senior", practice: "Data & ML", region: "EMEA", utilizationTarget: 85, utilizationActual: 81, billRate: 445, skills: ["ML Eng", "Data Platforms"], currentEngagements: ["eng-northwind-modern"], futureCapacity: 22 },
  { id: "carlos-mendez", name: "Carlos Mendez", initials: "CM", level: "Consultant", practice: "Modernization", region: "AMER", utilizationTarget: 90, utilizationActual: 64, billRate: 325, skills: ["Integration", "API"], currentEngagements: ["eng-cascade-readiness"], futureCapacity: 45 },
  { id: "lin-wei", name: "Lin Wei", initials: "LW", level: "Consultant", practice: "Data & ML", region: "AMER", utilizationTarget: 90, utilizationActual: 86, billRate: 295, skills: ["Data Eng", "Snowflake"], currentEngagements: ["eng-aurora-security"], futureCapacity: 20 },
  { id: "ingrid-bauer", name: "Ingrid Bauer", initials: "IB", level: "Consultant", practice: "AI Strategy", region: "EMEA", utilizationTarget: 90, utilizationActual: 78, billRate: 285, skills: ["Use-Case Discovery"], currentEngagements: ["eng-stratos-pilot"], futureCapacity: 32 },
  { id: "mei-lin", name: "Mei Lin", initials: "MeL", level: "Manager", practice: "AI Modernization", region: "APAC", utilizationTarget: 80, utilizationActual: 89, billRate: 495, skills: ["Agentic Workflows", "LLMOps"], currentEngagements: ["eng-quantum-rollout"], futureCapacity: 14 },
  { id: "sven-larsson", name: "Sven Larsson", initials: "SL", level: "Principal", practice: "Operating Model", region: "EMEA", utilizationTarget: 70, utilizationActual: 68, billRate: 615, skills: ["Operating Models", "Transformation"], currentEngagements: ["eng-continental-strategy"], futureCapacity: 26 },
  { id: "aisha-patel", name: "Aisha Patel", initials: "AP", level: "Manager", practice: "Healthcare AI", region: "AMER", utilizationTarget: 80, utilizationActual: 85, billRate: 510, skills: ["Healthcare", "HIPAA", "AI"], currentEngagements: ["eng-meridian-adoption"], futureCapacity: 18 },
  { id: "tom-becker", name: "Tom Becker", initials: "TB", level: "Analyst", practice: "Adoption", region: "AMER", utilizationTarget: 95, utilizationActual: 71, billRate: 215, skills: ["Adoption Analytics"], currentEngagements: ["eng-meridian-adoption"], futureCapacity: 38 },
  { id: "sophia-reyes", name: "Sophia Reyes", initials: "SR", level: "Senior", practice: "Insurance AI", region: "AMER", utilizationTarget: 85, utilizationActual: 79, billRate: 445, skills: ["Claims AI", "Underwriting"], currentEngagements: ["eng-helios-readiness"], futureCapacity: 24 },
];

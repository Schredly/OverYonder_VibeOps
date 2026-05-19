export interface Program {
  id: string;
  name: string;
  sponsor: string;
  executiveOwnerId: string;
  clientIds: string[];
  engagementIds: string[];
  workstreams: string[];
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalBudget: number;
  margin: number;
  adoption: number;
  riskScore: "Low" | "Medium" | "High";
  health: "Healthy" | "At Risk" | "Critical";
  satisfaction: number; // 0-100
  executiveAlignment: number; // 0-100
  description: string;
}

export const programs: Program[] = [
  {
    id: "prog-veridian-mfg",
    name: "Veridian European Plant AI Program",
    sponsor: "Sven Larsson, COO",
    executiveOwnerId: "alex-thompson",
    clientIds: ["veridian-mfg"],
    engagementIds: ["eng-veridian-modern"],
    workstreams: ["Operating Model", "Reference Architecture", "Plant Rollouts", "Adoption"],
    startDate: "2026-01-12",
    endDate: "2026-12-30",
    totalRevenue: 3_240_000,
    totalBudget: 3_400_000,
    margin: 38,
    adoption: 71,
    riskScore: "Low",
    health: "Healthy",
    satisfaction: 88,
    executiveAlignment: 92,
    description:
      "Multi-plant AI-assisted operations transformation across 4 European sites. Hamburg pilot live, Lyon and Madrid in flight, with adoption uplift program woven through delivery.",
  },
  {
    id: "prog-meridian-care",
    name: "Meridian Clinician AI Program",
    sponsor: "James Wright, CMIO",
    executiveOwnerId: "marcus-lee",
    clientIds: ["meridian-health"],
    engagementIds: ["eng-meridian-adoption"],
    workstreams: ["Pilot", "Wave 1 rollout", "Wave 2 rollout", "Adoption recovery"],
    startDate: "2025-11-04",
    endDate: "2026-09-30",
    totalRevenue: 1_120_000,
    totalBudget: 1_280_000,
    margin: 28,
    adoption: 54,
    riskScore: "High",
    health: "At Risk",
    satisfaction: 71,
    executiveAlignment: 78,
    description:
      "Roll AI clinician copilot into 14 hospitals. Adoption recovery sprint underway; needs sustained physician champion model and EHR integration polish.",
  },
  {
    id: "prog-sentinel-mission",
    name: "Sentinel Mission Systems AI Program",
    sponsor: "Gen. Roberts (ret.) — Board",
    executiveOwnerId: "marcus-lee",
    clientIds: ["sentinel-defense"],
    engagementIds: ["eng-sentinel-program"],
    workstreams: ["Mission C2", "Logistics", "Operating Model", "Sustainment"],
    startDate: "2025-09-15",
    endDate: "2027-03-30",
    totalRevenue: 4_200_000,
    totalBudget: 4_900_000,
    margin: 35,
    adoption: 62,
    riskScore: "Medium",
    health: "At Risk",
    satisfaction: 81,
    executiveAlignment: 87,
    description:
      "Strategic mission systems modernization across two workstreams. Mission C2 operating; logistics workstream at risk on cleared-staff bottleneck.",
  },
  {
    id: "prog-northwind-rd",
    name: "Northwind R&D AI Program",
    sponsor: "Dr. Anna Becker, CMO",
    executiveOwnerId: "rachel-kim",
    clientIds: ["northwind-pharma"],
    engagementIds: ["eng-northwind-modern"],
    workstreams: ["Data platform", "ML platform", "First-model validation"],
    startDate: "2025-11-01",
    endDate: "2027-02-28",
    totalRevenue: 2_400_000,
    totalBudget: 2_650_000,
    margin: 41,
    adoption: 68,
    riskScore: "Low",
    health: "Healthy",
    satisfaction: 90,
    executiveAlignment: 94,
    description:
      "End-to-end R&D data and ML platform for target identification and trial design. Strong sponsor alignment; on track for August GA.",
  },
];

export const findProgram = (id: string) => programs.find((p) => p.id === id);

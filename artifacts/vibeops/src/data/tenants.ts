export interface Tenant {
  id: string;
  name: string;
  logo: string;
  industry: string;
  departments: string[];
  kpiProfile: {
    totalSavings: number;
    hoursAutomated: number;
    adoptionRate: number;
  };
  enabledModules: string[];
}

export const tenants: Tenant[] = [
  {
    id: "dod",
    name: "Department of Defense",
    logo: "DoD",
    industry: "Government",
    departments: ["Army", "Navy", "Air Force", "Marines", "Cyber Command"],
    kpiProfile: { totalSavings: 147.2, hoursAutomated: 824000, adoptionRate: 42 },
    enabledModules: ["dashboard", "portfolio", "security", "control-tower"],
  },
  {
    id: "gfsc",
    name: "Global Financial Services Corp",
    logo: "GFSC",
    industry: "Finance",
    departments: ["Risk", "Compliance", "Trading", "Retail Banking", "Investment"],
    kpiProfile: { totalSavings: 89.4, hoursAutomated: 450000, adoptionRate: 67 },
    enabledModules: ["dashboard", "portfolio", "assessments", "approvals", "governance"],
  },
  {
    id: "aicp",
    name: "AI Consulting Partners",
    logo: "AICP",
    industry: "Consulting",
    departments: ["Delivery", "Sales", "Operations", "R&D", "Finance"],
    kpiProfile: { totalSavings: 24.1, hoursAutomated: 120000, adoptionRate: 85 },
    enabledModules: ["dashboard", "clients", "engagements", "delivery", "revenue"],
  },
  {
    id: "etg",
    name: "Enterprise Transformation Group",
    logo: "ETG",
    industry: "Technology",
    departments: ["PMO", "Architecture", "Security", "Innovation", "Operations"],
    kpiProfile: { totalSavings: 47.2, hoursAutomated: 284000, adoptionRate: 58 },
    enabledModules: ["dashboard", "portfolio", "intake", "tasks", "architecture"],
  },
];

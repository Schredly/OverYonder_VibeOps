/**
 * Tenant model — the multi-tenant control plane.
 *
 * Each tenant is a distinct operating context (enterprise org, consulting
 * firm, subsidiary, business unit, or customer tenant). Qualitative metadata
 * is authored here; record counts are derived live from the tenant data
 * partition (see `lib/tenantScope.ts`) so the switcher always matches reality.
 */
import { tenantStats, type TenantStats } from "@/lib/tenantScope";

export type TenantType =
  | "Enterprise Organization"
  | "Consulting Firm"
  | "Subsidiary"
  | "Business Unit"
  | "Customer Tenant";

export type TenantHealth = "Healthy" | "Watch" | "At Risk" | "Critical";
export type TenantEnvironment = "Production" | "Staging" | "Sandbox";
export type TenantAIMaturity = "Exploring" | "Piloting" | "Scaling" | "Industrialized";

/** Headline KPI baseline for a tenant — drives dashboard cards and charts. */
export interface TenantKpiProfile {
  /** Weekly services revenue, $M. */
  weeklyRevenue: number;
  /** Open proposal pipeline value, $M. */
  pipelineValue: number;
  /** Consultant capacity committed, %. */
  consultantCapacity: number;
  /** On-time delivery rate, %. */
  onTimeDelivery: number;
  /** Annualized automation savings, $M. */
  annualSavings: number;
  /** AI adoption rate, %. */
  adoptionRate: number;
  /** Multiplier applied to trend charts so they move per tenant (0.4–1.3). */
  signalIndex: number;
}

export interface Tenant {
  id: string;
  name: string;
  /** Short label used for the logo tile. */
  shortName: string;
  logo: string;
  type: TenantType;
  industry: string;
  region: string;
  environment: TenantEnvironment;
  health: TenantHealth;
  operationalPosture: string;
  aiMaturity: TenantAIMaturity;
  /** One-line executive summary surfaced on dashboards. */
  summary: string;
  /** Live record counts for this tenant. */
  stats: TenantStats;
  /** Active transformation programs. */
  activePrograms: number;
  /** Provisioned users. */
  users: number;
  /** Applications under management. */
  applications: number;
  /** Active consulting engagements. */
  consultingEngagements: number;
  kpiProfile: TenantKpiProfile;
}

interface TenantSeed {
  id: string;
  name: string;
  shortName: string;
  type: TenantType;
  industry: string;
  region: string;
  environment: TenantEnvironment;
  health: TenantHealth;
  operationalPosture: string;
  aiMaturity: TenantAIMaturity;
  summary: string;
  kpiProfile: TenantKpiProfile;
}

const SEEDS: TenantSeed[] = [
  {
    id: "dod",
    name: "Department of Defense",
    shortName: "DoD",
    type: "Enterprise Organization",
    industry: "Government & Defense",
    region: "North America",
    environment: "Production",
    health: "Watch",
    operationalPosture: "Defensive — security-first modernization",
    aiMaturity: "Piloting",
    summary:
      "Federal defense estate consolidating legacy systems under strict security and certification gates.",
    kpiProfile: {
      weeklyRevenue: 2.1,
      pipelineValue: 14.6,
      consultantCapacity: 88,
      onTimeDelivery: 91,
      annualSavings: 147.2,
      adoptionRate: 42,
      signalIndex: 1.18,
    },
  },
  {
    id: "gfsc",
    name: "Global Financial Services Corp",
    shortName: "GFSC",
    type: "Customer Tenant",
    industry: "Financial Services",
    region: "EMEA",
    environment: "Production",
    health: "Healthy",
    operationalPosture: "Optimizing — scaling AI into regulated workflows",
    aiMaturity: "Scaling",
    summary:
      "Global bank running AI transformation across risk, compliance, and retail under heavy governance.",
    kpiProfile: {
      weeklyRevenue: 1.45,
      pipelineValue: 8.2,
      consultantCapacity: 92,
      onTimeDelivery: 94,
      annualSavings: 89.4,
      adoptionRate: 67,
      signalIndex: 1.0,
    },
  },
  {
    id: "aicp",
    name: "AI Consulting Partners",
    shortName: "AICP",
    type: "Consulting Firm",
    industry: "Professional Services",
    region: "Global",
    environment: "Production",
    health: "Healthy",
    operationalPosture: "Expansion — growing delivery capacity",
    aiMaturity: "Industrialized",
    summary:
      "AI-native consultancy running multi-client delivery with high utilization and a strong pipeline.",
    kpiProfile: {
      weeklyRevenue: 0.96,
      pipelineValue: 5.4,
      consultantCapacity: 85,
      onTimeDelivery: 96,
      annualSavings: 24.1,
      adoptionRate: 85,
      signalIndex: 0.62,
    },
  },
  {
    id: "etg",
    name: "Enterprise Transformation Group",
    shortName: "ETG",
    type: "Business Unit",
    industry: "Technology",
    region: "APAC",
    environment: "Staging",
    health: "At Risk",
    operationalPosture: "Stabilizing — recovering stalled programs",
    aiMaturity: "Exploring",
    summary:
      "Internal transformation unit re-baselining at-risk programs and tightening delivery governance.",
    kpiProfile: {
      weeklyRevenue: 1.12,
      pipelineValue: 6.8,
      consultantCapacity: 79,
      onTimeDelivery: 83,
      annualSavings: 47.2,
      adoptionRate: 58,
      signalIndex: 0.81,
    },
  },
];

export const tenants: Tenant[] = SEEDS.map((seed) => {
  const stats = tenantStats(seed.id);
  return {
    ...seed,
    logo: seed.shortName,
    stats,
    activePrograms: stats.programs,
    users: stats.users,
    applications: stats.applications,
    consultingEngagements: stats.engagements,
  };
});

export const findTenant = (id: string) => tenants.find((t) => t.id === id);

/** Badge tone for a tenant health value. */
export const tenantHealthTone: Record<TenantHealth, "success" | "warning" | "danger" | "info"> = {
  Healthy: "success",
  Watch: "info",
  "At Risk": "warning",
  Critical: "danger",
};

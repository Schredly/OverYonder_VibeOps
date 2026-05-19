// Shared edit-form config + mappers for BusinessApplication, used by both the
// Application Portfolio list and the Application detail page so the edit form
// stays identical in both places.
import { internalUsers, findPerson } from "@/data/apm/people";
import {
  DISPOSITIONS,
  LIFECYCLE_STAGES,
  CRITICALITIES,
  type BusinessApplication,
  type LifecycleStage,
  type Criticality,
  type Disposition,
  type RiskLevel,
  type AIReadiness,
  type CloudReadiness,
} from "@/data/apm/applications";
import type { FormField } from "./RecordFormDialog";

export const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
export const AI_READINESS: AIReadiness[] = ["Not Assessed", "Low", "Medium", "High"];
export const CLOUD_READINESS: CloudReadiness[] = ["On-Prem", "Hybrid", "Cloud-Ready", "Cloud-Native"];
export const HOSTING_MODELS: BusinessApplication["hostingModel"][] = [
  "On-Prem",
  "Private Cloud",
  "AWS",
  "Azure",
  "SaaS",
];

export const applicationEditFields: FormField[] = [
  { name: "name", label: "Application name", required: true },
  { name: "businessUnit", label: "Business unit" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "owner", label: "Internal owner", type: "select", options: internalUsers.map((u) => u.name) },
  { name: "vendor", label: "Vendor" },
  { name: "annualCost", label: "Annual cost ($)", type: "number" },
  { name: "lifecycleStage", label: "Lifecycle stage", type: "select", options: LIFECYCLE_STAGES },
  { name: "businessCriticality", label: "Business criticality", type: "select", options: CRITICALITIES },
  { name: "riskLevel", label: "Risk level", type: "select", options: RISK_LEVELS },
  { name: "disposition", label: "Disposition", type: "select", options: DISPOSITIONS },
  { name: "aiReadiness", label: "AI readiness", type: "select", options: AI_READINESS },
  { name: "cloudReadiness", label: "Cloud readiness", type: "select", options: CLOUD_READINESS },
  { name: "hostingModel", label: "Hosting model", type: "select", options: HOSTING_MODELS },
  { name: "healthScore", label: "Health score (0-100)", type: "number" },
  { name: "techDebtScore", label: "Tech debt (0-100)", type: "number" },
  { name: "userCount", label: "User count", type: "number" },
];

export function applicationInitialValues(app: BusinessApplication): Record<string, string> {
  return {
    name: app.name,
    businessUnit: app.businessUnit,
    description: app.description,
    owner: findPerson(app.ownerId)?.name ?? "",
    vendor: app.vendor,
    annualCost: String(app.annualCost),
    lifecycleStage: app.lifecycleStage,
    businessCriticality: app.businessCriticality,
    riskLevel: app.riskLevel,
    disposition: app.disposition,
    aiReadiness: app.aiReadiness,
    cloudReadiness: app.cloudReadiness,
    hostingModel: app.hostingModel,
    healthScore: String(app.healthScore),
    techDebtScore: String(app.techDebtScore),
    userCount: String(app.userCount),
  };
}

export function applicationPatch(
  values: Record<string, string>,
  app: BusinessApplication,
): Partial<BusinessApplication> {
  return {
    name: values.name || app.name,
    description: values.description || app.description,
    businessUnit: values.businessUnit || app.businessUnit,
    vendor: values.vendor || app.vendor,
    ownerId: internalUsers.find((u) => u.name === values.owner)?.id ?? app.ownerId,
    annualCost: Number(values.annualCost) || app.annualCost,
    lifecycleStage: (values.lifecycleStage as LifecycleStage) || app.lifecycleStage,
    businessCriticality: (values.businessCriticality as Criticality) || app.businessCriticality,
    riskLevel: (values.riskLevel as RiskLevel) || app.riskLevel,
    disposition: (values.disposition as Disposition) || app.disposition,
    aiReadiness: (values.aiReadiness as AIReadiness) || app.aiReadiness,
    cloudReadiness: (values.cloudReadiness as CloudReadiness) || app.cloudReadiness,
    hostingModel: (values.hostingModel as BusinessApplication["hostingModel"]) || app.hostingModel,
    healthScore: Number(values.healthScore) || app.healthScore,
    techDebtScore: Number(values.techDebtScore) || app.techDebtScore,
    userCount: Number(values.userCount) || app.userCount,
  };
}

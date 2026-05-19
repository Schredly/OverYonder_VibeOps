// Shared form config + mappers for Assessment records, used by the AI
// Readiness drawer and the Application detail Assessments tab.
import { people, findPerson } from "@/data/apm/people";
import type {
  BusinessApplication,
  CloudReadiness,
  AIReadiness,
  RiskLevel,
} from "@/data/apm/applications";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_STATUSES,
  type Assessment,
  type AssessmentType,
  type AssessmentStatus,
} from "@/data/apm/assessments";
import type { FormField } from "./RecordFormDialog";

const CLOUD_SCORE: Record<CloudReadiness, number> = {
  "On-Prem": 38,
  Hybrid: 60,
  "Cloud-Ready": 80,
  "Cloud-Native": 94,
};
const RATING_FIT: Record<AIReadiness, number> = {
  "Not Assessed": 48,
  Low: 58,
  Medium: 74,
  High: 90,
};
const RISK_BASE: Record<RiskLevel, number> = {
  Low: 90,
  Medium: 74,
  High: 56,
  Critical: 42,
};

const clamp = (n: number) => Math.max(5, Math.min(98, Math.round(n)));

/**
 * Suggested starting scores for a brand-new assessment, derived from the
 * application's current portfolio attributes. The assessor adjusts these.
 */
export function deriveScores(app: BusinessApplication) {
  return {
    dataReadiness: clamp(app.healthScore * 0.7 + app.dataObjects.length * 6 + 18),
    integrationReadiness: clamp(CLOUD_SCORE[app.cloudReadiness] + app.integrations.length * 3 - 4),
    useCaseFit: clamp(
      RATING_FIT[app.aiReadiness] +
        (app.businessCriticality === "Critical" || app.businessCriticality === "High" ? 6 : 0),
    ),
    governanceRisk: clamp(RISK_BASE[app.riskLevel] - app.techDebtScore * 0.25),
  };
}

/** Map a composite score to the application's portfolio-level AI readiness rating. */
export function compositeToRating(composite: number): AIReadiness {
  if (composite >= 80) return "High";
  if (composite >= 62) return "Medium";
  if (composite >= 45) return "Low";
  return "Not Assessed";
}

export const assessmentFields: FormField[] = [
  { name: "type", label: "Assessment type", type: "select", required: true, options: ASSESSMENT_TYPES },
  { name: "status", label: "Status", type: "select", options: ASSESSMENT_STATUSES },
  { name: "assessor", label: "Assessor", type: "select", options: people.map((p) => p.name) },
  { name: "date", label: "Assessment date", placeholder: "YYYY-MM-DD" },
  { name: "dataReadiness", label: "Data readiness (0-100)", type: "number" },
  { name: "integrationReadiness", label: "Integration readiness (0-100)", type: "number" },
  { name: "useCaseFit", label: "Use-case fit (0-100)", type: "number" },
  { name: "governanceRisk", label: "Governance & risk (0-100)", type: "number" },
  { name: "recommendation", label: "Recommendation", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

/** Pre-filled values for a new assessment — derived scores + sensible defaults. */
export function assessmentDefaults(app: BusinessApplication, type: AssessmentType = "AI Readiness"): Record<string, string> {
  const d = deriveScores(app);
  return {
    type,
    status: "Draft",
    assessor: "",
    date: "2026-05-18",
    dataReadiness: String(d.dataReadiness),
    integrationReadiness: String(d.integrationReadiness),
    useCaseFit: String(d.useCaseFit),
    governanceRisk: String(d.governanceRisk),
    recommendation: "",
    notes: "",
  };
}

export function assessmentInitialValues(a: Assessment): Record<string, string> {
  return {
    type: a.type,
    status: a.status,
    assessor: findPerson(a.assessorId)?.name ?? "",
    date: a.date,
    dataReadiness: String(a.dataReadiness),
    integrationReadiness: String(a.integrationReadiness),
    useCaseFit: String(a.useCaseFit),
    governanceRisk: String(a.governanceRisk),
    recommendation: a.recommendation,
    notes: a.notes,
  };
}

export function assessmentPatch(values: Record<string, string>, a: Assessment): Partial<Assessment> {
  return {
    type: (values.type as AssessmentType) || a.type,
    status: (values.status as AssessmentStatus) || a.status,
    assessorId: people.find((p) => p.name === values.assessor)?.id ?? a.assessorId,
    date: values.date || a.date,
    dataReadiness: Number(values.dataReadiness) || a.dataReadiness,
    integrationReadiness: Number(values.integrationReadiness) || a.integrationReadiness,
    useCaseFit: Number(values.useCaseFit) || a.useCaseFit,
    governanceRisk: Number(values.governanceRisk) || a.governanceRisk,
    recommendation: values.recommendation || a.recommendation,
    notes: values.notes || a.notes,
  };
}

export function newAssessment(values: Record<string, string>, appId: string): Assessment {
  return {
    id: `as-${Date.now()}`,
    appId,
    type: (values.type as AssessmentType) || "AI Readiness",
    status: (values.status as AssessmentStatus) || "Draft",
    assessorId: people.find((p) => p.name === values.assessor)?.id ?? "",
    date: values.date || "",
    dataReadiness: Number(values.dataReadiness) || 0,
    integrationReadiness: Number(values.integrationReadiness) || 0,
    useCaseFit: Number(values.useCaseFit) || 0,
    governanceRisk: Number(values.governanceRisk) || 0,
    recommendation: values.recommendation || "",
    notes: values.notes || "",
  };
}

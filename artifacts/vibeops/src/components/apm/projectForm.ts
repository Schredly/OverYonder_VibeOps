// Shared create/edit form config + mappers for ModernizationProject, used by
// the Modernization Projects list and the Project detail page.
import { internalUsers, findPerson } from "@/data/apm/people";
import {
  PROJECT_TYPES,
  type ModernizationProject,
  type ProjectType,
  type ProjectStatus,
  type ProjectHealth,
} from "@/data/apm/projects";
import type { FormField } from "./RecordFormDialog";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Proposed",
  "Planning",
  "In Progress",
  "At Risk",
  "On Hold",
  "Complete",
];
export const PROJECT_HEALTHS: ProjectHealth[] = ["Healthy", "At Risk", "Critical"];
export const PROJECT_RISK_LEVELS: ModernizationProject["riskLevel"][] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const projectFields: FormField[] = [
  { name: "name", label: "Project name", required: true },
  { name: "type", label: "Type", type: "select", required: true, options: PROJECT_TYPES },
  { name: "status", label: "Status", type: "select", options: PROJECT_STATUSES },
  { name: "health", label: "Health", type: "select", options: PROJECT_HEALTHS },
  { name: "lead", label: "Internal lead", type: "select", options: internalUsers.map((u) => u.name) },
  { name: "riskLevel", label: "Risk level", type: "select", options: PROJECT_RISK_LEVELS },
  { name: "budget", label: "Budget ($)", type: "number" },
  { name: "spend", label: "Spend to date ($)", type: "number" },
  { name: "progress", label: "Progress (%)", type: "number" },
  { name: "startDate", label: "Start date", placeholder: "YYYY-MM-DD" },
  { name: "endDate", label: "Target end", placeholder: "YYYY-MM-DD" },
  { name: "description", label: "Description", type: "textarea", required: true },
];

export function projectInitialValues(p: ModernizationProject): Record<string, string> {
  return {
    name: p.name,
    type: p.type,
    status: p.status,
    health: p.health,
    lead: findPerson(p.internalLeadId)?.name ?? "",
    riskLevel: p.riskLevel,
    budget: String(p.budget),
    spend: String(p.spend),
    progress: String(p.progress),
    startDate: p.startDate,
    endDate: p.endDate,
    description: p.description,
  };
}

export function projectPatch(
  values: Record<string, string>,
  p: ModernizationProject,
): Partial<ModernizationProject> {
  return {
    name: values.name || p.name,
    type: (values.type as ProjectType) || p.type,
    status: (values.status as ProjectStatus) || p.status,
    health: (values.health as ProjectHealth) || p.health,
    internalLeadId: internalUsers.find((u) => u.name === values.lead)?.id ?? p.internalLeadId,
    riskLevel: (values.riskLevel as ModernizationProject["riskLevel"]) || p.riskLevel,
    budget: Number(values.budget) || p.budget,
    spend: Number(values.spend) || p.spend,
    progress: Number(values.progress) || p.progress,
    startDate: values.startDate || p.startDate,
    endDate: values.endDate || p.endDate,
    description: values.description || p.description,
  };
}

export function newProject(values: Record<string, string>): ModernizationProject {
  const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `proj-${slug || Date.now()}`,
    name: values.name,
    type: (values.type as ProjectType) || "Cloud Migration",
    status: (values.status as ProjectStatus) || "Proposed",
    health: (values.health as ProjectHealth) || "Healthy",
    description: values.description || "—",
    applicationIds: [],
    internalLeadId: internalUsers.find((u) => u.name === values.lead)?.id ?? internalUsers[0].id,
    consultantIds: [],
    budget: Number(values.budget) || 0,
    spend: Number(values.spend) || 0,
    progress: Number(values.progress) || 0,
    riskLevel: (values.riskLevel as ModernizationProject["riskLevel"]) || "Medium",
    startDate: values.startDate || "",
    endDate: values.endDate || "",
    workstreams: [],
    milestones: [],
  };
}

export const TASK_STATUSES = [
  "Backlog",
  "Planned",
  "In Progress",
  "Blocked",
  "Waiting for Client",
  "QA Review",
  "Complete",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface ConsultingTask {
  id: string;
  name: string;
  engagementId: string;
  ownerId: string;
  status: TaskStatus;
  priority: TaskPriority;
  billable: boolean;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  risk: "None" | "Low" | "Medium" | "High";
  blocker?: string;
}

export const consultingTasks: ConsultingTask[] = [
  { id: "t-001", name: "Lyon environment provisioning", engagementId: "eng-veridian-modern", ownerId: "emma-schmidt", status: "In Progress", priority: "High", billable: true, estimatedHours: 80, actualHours: 64, dueDate: "2026-05-22", risk: "Low" },
  { id: "t-002", name: "Madrid stakeholder alignment workshop", engagementId: "eng-veridian-modern", ownerId: "henri-dubois", status: "Planned", priority: "High", billable: true, estimatedHours: 24, actualHours: 0, dueDate: "2026-06-04", risk: "Medium" },
  { id: "t-003", name: "Adoption playbook draft", engagementId: "eng-veridian-modern", ownerId: "marcus-lee", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 40, actualHours: 18, dueDate: "2026-06-15", risk: "None" },
  { id: "t-004", name: "Control catalog v1 review", engagementId: "eng-atlas-governance", ownerId: "priya-sharma", status: "QA Review", priority: "High", billable: true, estimatedHours: 32, actualHours: 30, dueDate: "2026-05-30", risk: "Low" },
  { id: "t-005", name: "Wealth-management policy extension", engagementId: "eng-atlas-governance", ownerId: "priya-sharma", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 50, actualHours: 12, dueDate: "2026-06-20", risk: "None" },
  { id: "t-006", name: "Champion network re-launch", engagementId: "eng-meridian-adoption", ownerId: "aisha-patel", status: "In Progress", priority: "Critical", billable: true, estimatedHours: 60, actualHours: 22, dueDate: "2026-05-25", risk: "High" },
  { id: "t-007", name: "EHR integration polish (sites 8-14)", engagementId: "eng-meridian-adoption", ownerId: "tom-becker", status: "Blocked", priority: "Critical", billable: true, estimatedHours: 90, actualHours: 38, dueDate: "2026-05-28", risk: "High", blocker: "Awaiting Epic API access from client IT" },
  { id: "t-008", name: "Adoption recovery plan presentation", engagementId: "eng-meridian-adoption", ownerId: "marcus-lee", status: "Waiting for Client", priority: "High", billable: false, estimatedHours: 12, actualHours: 10, dueDate: "2026-05-22", risk: "Medium" },
  { id: "t-009", name: "Tabletop exercise prep", engagementId: "eng-aurora-security", ownerId: "rachel-kim", status: "In Progress", priority: "High", billable: true, estimatedHours: 36, actualHours: 14, dueDate: "2026-05-30", risk: "Low" },
  { id: "t-010", name: "AML scope change request", engagementId: "eng-aurora-security", ownerId: "rachel-kim", status: "Waiting for Client", priority: "Medium", billable: false, estimatedHours: 8, actualHours: 8, dueDate: "2026-05-20", risk: "Medium" },
  { id: "t-011", name: "Singapore pilot architecture sign-off", engagementId: "eng-pacific-migration", ownerId: "james-martinez", status: "In Progress", priority: "High", billable: true, estimatedHours: 40, actualHours: 24, dueDate: "2026-06-15", risk: "None" },
  { id: "t-012", name: "Migration playbook v0", engagementId: "eng-pacific-migration", ownerId: "yuki-nakamura", status: "Planned", priority: "Medium", billable: true, estimatedHours: 60, actualHours: 0, dueDate: "2026-07-30", risk: "None" },
  { id: "t-013", name: "Trading pilot enablement", engagementId: "eng-continental-strategy", ownerId: "sven-larsson", status: "In Progress", priority: "High", billable: true, estimatedHours: 45, actualHours: 30, dueDate: "2026-06-01", risk: "None" },
  { id: "t-014", name: "Field-ops pilot enablement", engagementId: "eng-continental-strategy", ownerId: "alex-thompson", status: "In Progress", priority: "High", billable: true, estimatedHours: 45, actualHours: 28, dueDate: "2026-06-15", risk: "None" },
  { id: "t-015", name: "Business case workshop", engagementId: "eng-helios-readiness", ownerId: "sophia-reyes", status: "Planned", priority: "Medium", billable: true, estimatedHours: 28, actualHours: 0, dueDate: "2026-06-10", risk: "None" },
  { id: "t-016", name: "ML platform load testing", engagementId: "eng-northwind-modern", ownerId: "felix-hartmann", status: "In Progress", priority: "High", billable: true, estimatedHours: 60, actualHours: 36, dueDate: "2026-06-20", risk: "Low" },
  { id: "t-017", name: "Logistics roadmap revision", engagementId: "eng-sentinel-program", ownerId: "marcus-lee", status: "In Progress", priority: "Critical", billable: true, estimatedHours: 50, actualHours: 22, dueDate: "2026-06-30", risk: "High" },
  { id: "t-018", name: "Clearance bottleneck escalation deck", engagementId: "eng-sentinel-program", ownerId: "diana-ortiz", status: "QA Review", priority: "Critical", billable: false, estimatedHours: 14, actualHours: 14, dueDate: "2026-05-18", risk: "High" },
  { id: "t-019", name: "New sponsor introduction", engagementId: "eng-cascade-readiness", ownerId: "james-martinez", status: "Waiting for Client", priority: "Critical", billable: false, estimatedHours: 6, actualHours: 4, dueDate: "2026-05-25", risk: "High", blocker: "Awaiting CEO office to identify replacement sponsor" },
  { id: "t-020", name: "Use case shortlist v0", engagementId: "eng-cascade-readiness", ownerId: "carlos-mendez", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 32, actualHours: 12, dueDate: "2026-05-30", risk: "Medium" },
  { id: "t-021", name: "Test campaign B prep", engagementId: "eng-stratos-pilot", ownerId: "ingrid-bauer", status: "In Progress", priority: "Medium", billable: true, estimatedHours: 40, actualHours: 18, dueDate: "2026-06-25", risk: "None" },
  { id: "t-022", name: "Cost optimization report", engagementId: "eng-quantum-rollout", ownerId: "mei-lin", status: "QA Review", priority: "Medium", billable: true, estimatedHours: 30, actualHours: 30, dueDate: "2026-06-01", risk: "None" },
  { id: "t-023", name: "Routing rules ops handover", engagementId: "eng-quantum-rollout", ownerId: "yuki-nakamura", status: "Complete", priority: "Medium", billable: true, estimatedHours: 22, actualHours: 21, dueDate: "2026-05-10", risk: "None" },
  { id: "t-024", name: "Hamburg stabilization retro", engagementId: "eng-veridian-modern", ownerId: "alex-thompson", status: "Complete", priority: "Low", billable: false, estimatedHours: 8, actualHours: 6, dueDate: "2026-05-08", risk: "None" },
  { id: "t-025", name: "Backlog grooming — Lyon cutover", engagementId: "eng-veridian-modern", ownerId: "henri-dubois", status: "Backlog", priority: "Medium", billable: true, estimatedHours: 16, actualHours: 0, dueDate: "2026-06-08", risk: "None" },
];

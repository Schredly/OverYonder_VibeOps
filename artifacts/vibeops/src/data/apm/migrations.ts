export type WaveStatus = "Planned" | "In Progress" | "Validating" | "Complete" | "Blocked";

export interface MigrationWave {
  id: string;
  name: string;
  projectId: string;
  type: "Cloud Migration" | "ServiceNow Migration" | "Data Migration" | "Decommission";
  status: WaveStatus;
  applicationIds: string[];
  ownerId: string;
  startDate: string;
  endDate: string;
  progress: number;
  riskLevel: "Low" | "Medium" | "High";
  notes: string;
}

export const migrationWaves: MigrationWave[] = [
  {
    id: "wave-1",
    name: "Wave 1 — FieldForce Azure Landing Zone",
    projectId: "proj-fieldforce-cloud",
    type: "Cloud Migration",
    status: "Complete",
    applicationIds: ["app-fieldforce"],
    ownerId: "c-emma",
    startDate: "2026-02-01",
    endDate: "2026-03-15",
    progress: 100,
    riskLevel: "Low",
    notes: "Landing zone, networking, and identity established. Validated by infra team.",
  },
  {
    id: "wave-2",
    name: "Wave 2 — FieldForce Database Migration",
    projectId: "proj-fieldforce-cloud",
    type: "Data Migration",
    status: "In Progress",
    applicationIds: ["app-fieldforce"],
    ownerId: "c-emma",
    startDate: "2026-03-16",
    endDate: "2026-07-15",
    progress: 45,
    riskLevel: "Medium",
    notes: "SQL Server 2014 → Azure SQL. Schema converted; data sync in progress.",
  },
  {
    id: "wave-3",
    name: "Wave 3 — CoreBilling Data Migration",
    projectId: "proj-billing-replace",
    type: "Data Migration",
    status: "In Progress",
    applicationIds: ["app-corebilling", "app-financehub"],
    ownerId: "c-james",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    progress: 40,
    riskLevel: "High",
    notes: "Mainframe extract and reconciliation. Two data-quality issues flagged.",
  },
  {
    id: "wave-4",
    name: "Wave 4 — Legacy GL Decommission",
    projectId: "proj-billing-replace",
    type: "Decommission",
    status: "Blocked",
    applicationIds: ["app-legacygl"],
    ownerId: "u-james",
    startDate: "2026-10-01",
    endDate: "2026-12-15",
    progress: 0,
    riskLevel: "High",
    notes: "Blocked until CoreBilling cutover completes. Retention/archival plan pending legal sign-off.",
  },
  {
    id: "wave-5",
    name: "Wave 5 — Vendor Portal Re-platform",
    projectId: "proj-vendor-migrate",
    type: "Cloud Migration",
    status: "Planned",
    applicationIds: ["app-vendorportal"],
    ownerId: "c-emma",
    startDate: "2026-07-01",
    endDate: "2026-11-15",
    progress: 0,
    riskLevel: "Medium",
    notes: "Awaiting migration design approval.",
  },
];

export const wavesForProject = (projectId: string) =>
  migrationWaves.filter((w) => w.projectId === projectId);

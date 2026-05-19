export interface TimeEntry {
  id: string;
  personId: string; // consultant id
  taskId?: string;
  projectId: string;
  applicationId?: string;
  date: string;
  hours: number;
  billable: boolean;
  rate: number; // $/hr at time of logging
  note: string;
  billed: boolean;
}

export const timeEntries: TimeEntry[] = [
  { id: "te-001", personId: "c-marcus", taskId: "at-008", projectId: "proj-claims-ai", applicationId: "app-claimscore", date: "2026-05-11", hours: 7.5, billable: true, rate: 245, note: "Feature store ingestion pipeline", billed: true },
  { id: "te-002", personId: "c-marcus", taskId: "at-008", projectId: "proj-claims-ai", applicationId: "app-claimscore", date: "2026-05-12", hours: 8, billable: true, rate: 245, note: "Feature store — schema + tests", billed: true },
  { id: "te-003", personId: "c-priya", taskId: "at-009", projectId: "proj-claims-ai", applicationId: "app-claimscore", date: "2026-05-12", hours: 6, billable: true, rate: 285, note: "Fraud model training pipeline", billed: true },
  { id: "te-004", personId: "c-priya", taskId: "at-009", projectId: "proj-claims-ai", applicationId: "app-claimscore", date: "2026-05-13", hours: 7, billable: true, rate: 285, note: "Model evaluation harness", billed: false },
  { id: "te-005", personId: "c-emma", taskId: "at-006", projectId: "proj-fieldforce-cloud", applicationId: "app-fieldforce", date: "2026-05-12", hours: 8, billable: true, rate: 225, note: "Azure SQL schema conversion", billed: false },
  { id: "te-006", personId: "c-emma", taskId: "at-007", projectId: "proj-fieldforce-cloud", applicationId: "app-fieldforce", date: "2026-05-13", hours: 5.5, billable: true, rate: 225, note: "Reconciliation harness build", billed: false },
  { id: "te-007", personId: "c-james", taskId: "at-002", projectId: "proj-billing-replace", applicationId: "app-corebilling", date: "2026-05-11", hours: 8, billable: true, rate: 195, note: "Mainframe data extract", billed: true },
  { id: "te-008", personId: "c-james", taskId: "at-002", projectId: "proj-billing-replace", applicationId: "app-corebilling", date: "2026-05-12", hours: 8, billable: true, rate: 195, note: "Data profiling — billing tables", billed: false },
  { id: "te-009", personId: "c-james", taskId: "at-003", projectId: "proj-billing-replace", applicationId: "app-corebilling", date: "2026-05-13", hours: 4, billable: true, rate: 195, note: "Data-quality issue triage", billed: false },
  { id: "te-010", personId: "c-marcus", taskId: "at-020", projectId: "proj-billing-replace", date: "2026-05-13", hours: 6.5, billable: true, rate: 245, note: "Billing engine pilot prep", billed: false },
  { id: "te-011", personId: "c-priya", taskId: "at-013", projectId: "proj-cert-campaign", applicationId: "app-customerportal", date: "2026-05-09", hours: 4, billable: true, rate: 285, note: "AI readiness assessment — Customer Portal", billed: true },
  { id: "te-012", personId: "c-emma", taskId: "at-011", projectId: "proj-vendor-migrate", applicationId: "app-vendorportal", date: "2026-05-13", hours: 6, billable: true, rate: 225, note: "Vendor Portal migration design", billed: false },
  { id: "te-013", personId: "c-alex", projectId: "proj-billing-replace", date: "2026-05-08", hours: 3, billable: true, rate: 320, note: "Steering committee + advisory", billed: true },
  { id: "te-014", personId: "c-marcus", taskId: "at-008", projectId: "proj-claims-ai", applicationId: "app-claimscore", date: "2026-05-13", hours: 7, billable: true, rate: 245, note: "Feature store — performance tuning", billed: false },
  { id: "te-015", personId: "c-priya", projectId: "proj-cert-campaign", date: "2026-05-12", hours: 2.5, billable: false, rate: 285, note: "Internal QA — non-billable", billed: false },
  { id: "te-016", personId: "c-emma", taskId: "at-005", projectId: "proj-fieldforce-cloud", date: "2026-05-09", hours: 8, billable: true, rate: 225, note: "Landing zone validation support", billed: true },
];

export interface BillingRecord {
  id: string;
  projectId: string;
  period: string;
  hoursBilled: number;
  amount: number;
  status: "Draft" | "Submitted" | "Approved" | "Invoiced" | "Paid";
}

export const billingRecords: BillingRecord[] = [
  { id: "bill-001", projectId: "proj-claims-ai", period: "Apr 2026", hoursBilled: 412, amount: 109_180, status: "Paid" },
  { id: "bill-002", projectId: "proj-billing-replace", period: "Apr 2026", hoursBilled: 528, amount: 132_960, status: "Paid" },
  { id: "bill-003", projectId: "proj-fieldforce-cloud", period: "Apr 2026", hoursBilled: 296, amount: 66_600, status: "Invoiced" },
  { id: "bill-004", projectId: "proj-claims-ai", period: "May 2026", hoursBilled: 188, amount: 49_900, status: "Submitted" },
  { id: "bill-005", projectId: "proj-billing-replace", period: "May 2026", hoursBilled: 244, amount: 56_180, status: "Draft" },
  { id: "bill-006", projectId: "proj-vendor-migrate", period: "May 2026", hoursBilled: 64, amount: 14_400, status: "Draft" },
];

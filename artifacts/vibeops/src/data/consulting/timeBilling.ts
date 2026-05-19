// Time tracking & billing data for the consulting operating mode.

export interface ConsultingTimeEntry {
  id: string;
  consultantId: string;
  engagementId: string;
  date: string;
  hours: number;
  billable: boolean;
  rate: number;
  note: string;
  status: "Draft" | "Submitted" | "Approved" | "Billed";
}

export const consultingTime: ConsultingTimeEntry[] = [
  { id: "ct-001", consultantId: "alex-thompson", engagementId: "eng-veridian-modern", date: "2026-05-11", hours: 6, billable: true, rate: 850, note: "Steering committee + roadmap", status: "Billed" },
  { id: "ct-002", consultantId: "henri-dubois", engagementId: "eng-veridian-modern", date: "2026-05-11", hours: 8, billable: true, rate: 475, note: "Lyon runbook", status: "Approved" },
  { id: "ct-003", consultantId: "emma-schmidt", engagementId: "eng-veridian-modern", date: "2026-05-12", hours: 8, billable: true, rate: 425, note: "Lyon environment provisioning", status: "Approved" },
  { id: "ct-004", consultantId: "emma-schmidt", engagementId: "eng-veridian-modern", date: "2026-05-13", hours: 7.5, billable: true, rate: 425, note: "Integration testing", status: "Submitted" },
  { id: "ct-005", consultantId: "priya-sharma", engagementId: "eng-atlas-governance", date: "2026-05-12", hours: 7, billable: true, rate: 825, note: "Control catalog review", status: "Approved" },
  { id: "ct-006", consultantId: "priya-sharma", engagementId: "eng-atlas-governance", date: "2026-05-13", hours: 5, billable: true, rate: 825, note: "Wealth-management policy", status: "Submitted" },
  { id: "ct-007", consultantId: "marcus-lee", engagementId: "eng-meridian-adoption", date: "2026-05-12", hours: 8, billable: true, rate: 625, note: "Adoption recovery plan", status: "Approved" },
  { id: "ct-008", consultantId: "aisha-patel", engagementId: "eng-meridian-adoption", date: "2026-05-12", hours: 8, billable: true, rate: 510, note: "Champion network re-launch", status: "Approved" },
  { id: "ct-009", consultantId: "tom-becker", engagementId: "eng-meridian-adoption", date: "2026-05-13", hours: 6, billable: false, rate: 215, note: "Internal adoption analytics", status: "Draft" },
  { id: "ct-010", consultantId: "rachel-kim", engagementId: "eng-aurora-security", date: "2026-05-11", hours: 7, billable: true, rate: 650, note: "Tabletop exercise prep", status: "Billed" },
  { id: "ct-011", consultantId: "lin-wei", engagementId: "eng-aurora-security", date: "2026-05-12", hours: 8, billable: true, rate: 295, note: "Threat model documentation", status: "Approved" },
  { id: "ct-012", consultantId: "james-martinez", engagementId: "eng-pacific-migration", date: "2026-05-12", hours: 8, billable: true, rate: 525, note: "Architecture sign-off prep", status: "Submitted" },
  { id: "ct-013", consultantId: "yuki-nakamura", engagementId: "eng-pacific-migration", date: "2026-05-13", hours: 6, billable: true, rate: 415, note: "Migration playbook", status: "Draft" },
  { id: "ct-014", consultantId: "alex-thompson", engagementId: "eng-continental-strategy", date: "2026-05-13", hours: 4, billable: true, rate: 850, note: "Pilot enablement", status: "Submitted" },
  { id: "ct-015", consultantId: "rachel-kim", engagementId: "eng-northwind-modern", date: "2026-05-12", hours: 6, billable: true, rate: 650, note: "ML platform load testing review", status: "Approved" },
  { id: "ct-016", consultantId: "felix-hartmann", engagementId: "eng-northwind-modern", date: "2026-05-13", hours: 8, billable: true, rate: 445, note: "ML platform load testing", status: "Approved" },
  { id: "ct-017", consultantId: "marcus-lee", engagementId: "eng-sentinel-program", date: "2026-05-12", hours: 8, billable: true, rate: 625, note: "Logistics roadmap revision", status: "Submitted" },
  { id: "ct-018", consultantId: "diana-ortiz", engagementId: "eng-sentinel-program", date: "2026-05-13", hours: 7, billable: true, rate: 525, note: "Mission C2 architecture", status: "Draft" },
  { id: "ct-019", consultantId: "mei-lin", engagementId: "eng-quantum-rollout", date: "2026-05-12", hours: 6, billable: true, rate: 495, note: "Cost optimization report", status: "Billed" },
  { id: "ct-020", consultantId: "ingrid-bauer", engagementId: "eng-stratos-pilot", date: "2026-05-13", hours: 7, billable: true, rate: 285, note: "Test campaign B prep", status: "Submitted" },
];

export interface ConsultingInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  engagementId: string;
  period: string;
  hours: number;
  amount: number;
  issued: string;
  due: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
}

export const consultingInvoices: ConsultingInvoice[] = [
  { id: "inv-001", invoiceNumber: "OY-2026-041", clientId: "veridian-mfg", engagementId: "eng-veridian-modern", period: "Apr 2026", hours: 612, amount: 318_400, issued: "2026-05-01", due: "2026-05-31", status: "Paid" },
  { id: "inv-002", invoiceNumber: "OY-2026-042", clientId: "atlas-federal", engagementId: "eng-atlas-governance", period: "Apr 2026", hours: 286, amount: 235_950, issued: "2026-05-01", due: "2026-05-31", status: "Paid" },
  { id: "inv-003", invoiceNumber: "OY-2026-043", clientId: "meridian-health", engagementId: "eng-meridian-adoption", period: "Apr 2026", hours: 458, amount: 268_400, issued: "2026-05-01", due: "2026-05-31", status: "Sent" },
  { id: "inv-004", invoiceNumber: "OY-2026-044", clientId: "northwind-pharma", engagementId: "eng-northwind-modern", period: "Apr 2026", hours: 392, amount: 214_600, issued: "2026-05-01", due: "2026-05-31", status: "Sent" },
  { id: "inv-005", invoiceNumber: "OY-2026-038", clientId: "aurora-financial", engagementId: "eng-aurora-security", period: "Mar 2026", hours: 240, amount: 152_000, issued: "2026-04-01", due: "2026-04-30", status: "Overdue" },
  { id: "inv-006", invoiceNumber: "OY-2026-045", clientId: "sentinel-defense", engagementId: "eng-sentinel-program", period: "Apr 2026", hours: 540, amount: 322_500, issued: "2026-05-01", due: "2026-05-31", status: "Draft" },
];

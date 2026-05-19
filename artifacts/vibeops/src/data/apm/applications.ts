export type LifecycleStage = "Plan" | "Build" | "Production" | "Sunset" | "Retired";
export type Criticality = "Critical" | "High" | "Medium" | "Low";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AIReadiness = "Not Assessed" | "Low" | "Medium" | "High";
export type CloudReadiness = "On-Prem" | "Hybrid" | "Cloud-Ready" | "Cloud-Native";
export type Disposition = "Tolerate" | "Invest" | "Migrate" | "Modernize" | "Replace" | "Retire";
export type CertStatus = "Certified" | "Due" | "Overdue" | "Not Started";

export interface AppService {
  name: string;
  status: "Operational" | "Degraded" | "Down" | "Planned";
}
export interface AppIntegration {
  name: string;
  direction: "Inbound" | "Outbound" | "Bidirectional";
  target: string;
  type: "API" | "File" | "Event" | "Database";
}
export interface DataObject {
  name: string;
  sensitivity: "Public" | "Internal" | "Confidential" | "Restricted";
}

export interface BusinessApplication {
  id: string;
  name: string;
  description: string;
  ownerId: string; // internal person id
  businessUnit: string;
  capabilityIds: string[];
  lifecycleStage: LifecycleStage;
  businessCriticality: Criticality;
  annualCost: number;
  healthScore: number; // 0-100
  riskLevel: RiskLevel;
  techDebtScore: number; // 0-100, higher is worse
  aiReadiness: AIReadiness;
  cloudReadiness: CloudReadiness;
  disposition: Disposition;
  certStatus: CertStatus;
  technologyIds: string[];
  vendor: string;
  hostingModel: "On-Prem" | "Private Cloud" | "AWS" | "Azure" | "SaaS";
  userCount: number;
  consultantIds: string[]; // external consultants granted access
  services: AppService[];
  integrations: AppIntegration[];
  dataObjects: DataObject[];
}

export const applications: BusinessApplication[] = [
  {
    id: "app-orderhub",
    name: "Order Hub",
    description: "Lead-to-order capture and quoting platform for the commercial business.",
    ownerId: "u-lisa",
    businessUnit: "Commercial",
    capabilityIds: ["cap-customer-sales"],
    lifecycleStage: "Production",
    businessCriticality: "Critical",
    annualCost: 1_240_000,
    healthScore: 84,
    riskLevel: "Medium",
    techDebtScore: 28,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Native",
    disposition: "Invest",
    certStatus: "Certified",
    technologyIds: ["tech-java", "tech-oracle-db", "tech-react", "tech-k8s"],
    vendor: "In-House",
    hostingModel: "AWS",
    userCount: 1850,
    consultantIds: ["c-priya"],
    services: [
      { name: "Quote API", status: "Operational" },
      { name: "Order Capture UI", status: "Operational" },
      { name: "Pricing Engine", status: "Degraded" },
    ],
    integrations: [
      { name: "CRM Cloud sync", direction: "Bidirectional", target: "CRM Cloud", type: "API" },
      { name: "FinanceHub posting", direction: "Outbound", target: "FinanceHub", type: "Event" },
    ],
    dataObjects: [
      { name: "Customer", sensitivity: "Confidential" },
      { name: "Quote", sensitivity: "Internal" },
      { name: "Order", sensitivity: "Internal" },
    ],
  },
  {
    id: "app-claimscore",
    name: "ClaimsCore",
    description: "Claims intake, adjudication, and analytics for the service organization.",
    ownerId: "u-lisa",
    businessUnit: "Customer Service",
    capabilityIds: ["cap-customer-service"],
    lifecycleStage: "Production",
    businessCriticality: "Critical",
    annualCost: 980_000,
    healthScore: 71,
    riskLevel: "High",
    techDebtScore: 46,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Ready",
    disposition: "Modernize",
    certStatus: "Due",
    technologyIds: ["tech-java", "tech-snowflake", "tech-python"],
    vendor: "In-House",
    hostingModel: "Private Cloud",
    userCount: 620,
    consultantIds: ["c-marcus", "c-priya"],
    services: [
      { name: "Claims Intake API", status: "Operational" },
      { name: "Adjudication Engine", status: "Operational" },
      { name: "Fraud Scoring", status: "Planned" },
    ],
    integrations: [
      { name: "Data Hub feed", direction: "Outbound", target: "Enterprise Data Hub", type: "File" },
      { name: "Customer Portal status", direction: "Outbound", target: "Customer Portal", type: "API" },
    ],
    dataObjects: [
      { name: "Claim", sensitivity: "Restricted" },
      { name: "Customer", sensitivity: "Confidential" },
      { name: "Payment", sensitivity: "Restricted" },
    ],
  },
  {
    id: "app-fieldforce",
    name: "FieldForce Mobile",
    description: "Mobile work order and dispatch app for field technicians.",
    ownerId: "u-omar",
    businessUnit: "Operations",
    capabilityIds: ["cap-customer-service"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 410_000,
    healthScore: 58,
    riskLevel: "High",
    techDebtScore: 64,
    aiReadiness: "Low",
    cloudReadiness: "Hybrid",
    disposition: "Migrate",
    certStatus: "Overdue",
    technologyIds: ["tech-dotnet", "tech-sqlserver-2014"],
    vendor: "In-House",
    hostingModel: "On-Prem",
    userCount: 340,
    consultantIds: ["c-emma"],
    services: [
      { name: "Work Order Sync", status: "Degraded" },
      { name: "Offline Dispatch", status: "Operational" },
    ],
    integrations: [
      { name: "WMS work orders", direction: "Inbound", target: "Warehouse Mgmt", type: "API" },
    ],
    dataObjects: [
      { name: "Work Order", sensitivity: "Internal" },
      { name: "Technician", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-corebilling",
    name: "CoreBilling",
    description: "Mainframe billing and revenue recognition engine.",
    ownerId: "u-james",
    businessUnit: "Finance",
    capabilityIds: ["cap-finance-gl"],
    lifecycleStage: "Sunset",
    businessCriticality: "Critical",
    annualCost: 2_100_000,
    healthScore: 44,
    riskLevel: "Critical",
    techDebtScore: 88,
    aiReadiness: "Not Assessed",
    cloudReadiness: "On-Prem",
    disposition: "Replace",
    certStatus: "Overdue",
    technologyIds: ["tech-cobol", "tech-oracle-db"],
    vendor: "In-House",
    hostingModel: "On-Prem",
    userCount: 95,
    consultantIds: ["c-marcus", "c-james"],
    services: [
      { name: "Billing Batch", status: "Operational" },
      { name: "Revenue Recognition", status: "Operational" },
    ],
    integrations: [
      { name: "FinanceHub GL post", direction: "Outbound", target: "FinanceHub", type: "File" },
      { name: "Order Hub feed", direction: "Inbound", target: "Order Hub", type: "File" },
    ],
    dataObjects: [
      { name: "Invoice", sensitivity: "Confidential" },
      { name: "Revenue Schedule", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-legacygl",
    name: "Legacy GL",
    description: "Decommission-track general ledger running on unsupported infrastructure.",
    ownerId: "u-james",
    businessUnit: "Finance",
    capabilityIds: ["cap-finance-gl"],
    lifecycleStage: "Sunset",
    businessCriticality: "Medium",
    annualCost: 320_000,
    healthScore: 31,
    riskLevel: "Critical",
    techDebtScore: 95,
    aiReadiness: "Not Assessed",
    cloudReadiness: "On-Prem",
    disposition: "Retire",
    certStatus: "Not Started",
    technologyIds: ["tech-cobol", "tech-winserver-2012", "tech-flash"],
    vendor: "In-House",
    hostingModel: "On-Prem",
    userCount: 12,
    consultantIds: [],
    services: [{ name: "Ledger Reports", status: "Degraded" }],
    integrations: [],
    dataObjects: [{ name: "Journal Entry", sensitivity: "Confidential" }],
  },
  {
    id: "app-vendorportal",
    name: "Vendor Portal",
    description: "Supplier onboarding and invoice submission portal.",
    ownerId: "u-james",
    businessUnit: "Procurement",
    capabilityIds: ["cap-finance-ap"],
    lifecycleStage: "Production",
    businessCriticality: "Medium",
    annualCost: 280_000,
    healthScore: 62,
    riskLevel: "High",
    techDebtScore: 58,
    aiReadiness: "Low",
    cloudReadiness: "Hybrid",
    disposition: "Migrate",
    certStatus: "Due",
    technologyIds: ["tech-sqlserver-2014", "tech-winserver-2012"],
    vendor: "Coupa (modified)",
    hostingModel: "On-Prem",
    userCount: 480,
    consultantIds: ["c-emma"],
    services: [
      { name: "Supplier Onboarding", status: "Operational" },
      { name: "Invoice Submission", status: "Operational" },
    ],
    integrations: [
      { name: "FinanceHub AP", direction: "Outbound", target: "FinanceHub", type: "API" },
    ],
    dataObjects: [
      { name: "Supplier", sensitivity: "Confidential" },
      { name: "Invoice", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-financehub",
    name: "FinanceHub (S/4HANA)",
    description: "Core ERP for finance, controlling, and procurement.",
    ownerId: "u-james",
    businessUnit: "Finance",
    capabilityIds: ["cap-finance-gl", "cap-finance-ap"],
    lifecycleStage: "Production",
    businessCriticality: "Critical",
    annualCost: 3_400_000,
    healthScore: 88,
    riskLevel: "Medium",
    techDebtScore: 22,
    aiReadiness: "Medium",
    cloudReadiness: "Cloud-Ready",
    disposition: "Invest",
    certStatus: "Certified",
    technologyIds: ["tech-sap"],
    vendor: "SAP",
    hostingModel: "Private Cloud",
    userCount: 2100,
    consultantIds: ["c-alex"],
    services: [
      { name: "General Ledger", status: "Operational" },
      { name: "Accounts Payable", status: "Operational" },
      { name: "Controlling", status: "Operational" },
    ],
    integrations: [
      { name: "Order Hub posting", direction: "Inbound", target: "Order Hub", type: "Event" },
      { name: "Data Hub extract", direction: "Outbound", target: "Enterprise Data Hub", type: "File" },
    ],
    dataObjects: [
      { name: "GL Account", sensitivity: "Confidential" },
      { name: "Vendor", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-itsm",
    name: "IT Service Management",
    description: "Incident, problem, and change management on ServiceNow.",
    ownerId: "u-omar",
    businessUnit: "IT",
    capabilityIds: ["cap-it"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 640_000,
    healthScore: 90,
    riskLevel: "Low",
    techDebtScore: 18,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Native",
    disposition: "Invest",
    certStatus: "Certified",
    technologyIds: ["tech-servicenow"],
    vendor: "ServiceNow",
    hostingModel: "SaaS",
    userCount: 3200,
    consultantIds: [],
    services: [
      { name: "Incident Management", status: "Operational" },
      { name: "Change Management", status: "Operational" },
    ],
    integrations: [
      { name: "CMDB sync", direction: "Bidirectional", target: "GRC Console", type: "API" },
    ],
    dataObjects: [{ name: "Incident", sensitivity: "Internal" }],
  },
  {
    id: "app-grc",
    name: "GRC Console",
    description: "Governance, risk, and compliance workflows on ServiceNow.",
    ownerId: "u-rachel",
    businessUnit: "Risk",
    capabilityIds: ["cap-it"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 420_000,
    healthScore: 86,
    riskLevel: "Low",
    techDebtScore: 24,
    aiReadiness: "Medium",
    cloudReadiness: "Cloud-Native",
    disposition: "Tolerate",
    certStatus: "Certified",
    technologyIds: ["tech-servicenow"],
    vendor: "ServiceNow",
    hostingModel: "SaaS",
    userCount: 280,
    consultantIds: [],
    services: [{ name: "Risk Register", status: "Operational" }],
    integrations: [
      { name: "ITSM CMDB", direction: "Bidirectional", target: "IT Service Management", type: "API" },
    ],
    dataObjects: [{ name: "Control", sensitivity: "Confidential" }],
  },
  {
    id: "app-crm",
    name: "CRM Cloud",
    description: "Customer relationship management for sales and service.",
    ownerId: "u-lisa",
    businessUnit: "Commercial",
    capabilityIds: ["cap-customer-sales", "cap-customer-service"],
    lifecycleStage: "Production",
    businessCriticality: "Critical",
    annualCost: 1_120_000,
    healthScore: 81,
    riskLevel: "Medium",
    techDebtScore: 30,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Native",
    disposition: "Invest",
    certStatus: "Due",
    technologyIds: ["tech-salesforce"],
    vendor: "Salesforce",
    hostingModel: "SaaS",
    userCount: 1450,
    consultantIds: ["c-priya"],
    services: [
      { name: "Account 360", status: "Operational" },
      { name: "Opportunity Mgmt", status: "Operational" },
    ],
    integrations: [
      { name: "Order Hub sync", direction: "Bidirectional", target: "Order Hub", type: "API" },
    ],
    dataObjects: [
      { name: "Account", sensitivity: "Confidential" },
      { name: "Contact", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-customerportal",
    name: "Customer Portal",
    description: "Self-service portal for customers — billing, cases, documents.",
    ownerId: "u-lisa",
    businessUnit: "Customer Service",
    capabilityIds: ["cap-customer-service"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 540_000,
    healthScore: 79,
    riskLevel: "Medium",
    techDebtScore: 34,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Native",
    disposition: "Modernize",
    certStatus: "Due",
    technologyIds: ["tech-react", "tech-node", "tech-k8s"],
    vendor: "In-House",
    hostingModel: "AWS",
    userCount: 24000,
    consultantIds: ["c-marcus"],
    services: [
      { name: "Self-Service UI", status: "Operational" },
      { name: "Document Vault", status: "Operational" },
      { name: "Chat Assist", status: "Planned" },
    ],
    integrations: [
      { name: "ClaimsCore status", direction: "Inbound", target: "ClaimsCore", type: "API" },
    ],
    dataObjects: [
      { name: "Customer", sensitivity: "Confidential" },
      { name: "Document", sensitivity: "Confidential" },
    ],
  },
  {
    id: "app-datahub",
    name: "Enterprise Data Hub",
    description: "Central analytics and AI data platform.",
    ownerId: "u-david",
    businessUnit: "Data & Analytics",
    capabilityIds: ["cap-data"],
    lifecycleStage: "Build",
    businessCriticality: "High",
    annualCost: 870_000,
    healthScore: 76,
    riskLevel: "Medium",
    techDebtScore: 26,
    aiReadiness: "High",
    cloudReadiness: "Cloud-Native",
    disposition: "Invest",
    certStatus: "Not Started",
    technologyIds: ["tech-node", "tech-snowflake", "tech-python", "tech-k8s"],
    vendor: "In-House",
    hostingModel: "AWS",
    userCount: 410,
    consultantIds: ["c-marcus", "c-priya"],
    services: [
      { name: "Data Ingestion", status: "Operational" },
      { name: "Feature Store", status: "Planned" },
    ],
    integrations: [
      { name: "FinanceHub extract", direction: "Inbound", target: "FinanceHub", type: "File" },
      { name: "ClaimsCore feed", direction: "Inbound", target: "ClaimsCore", type: "File" },
    ],
    dataObjects: [
      { name: "Analytics Dataset", sensitivity: "Internal" },
      { name: "Model Feature", sensitivity: "Internal" },
    ],
  },
  {
    id: "app-hrcore",
    name: "HR Core",
    description: "Core HR, payroll, and talent management.",
    ownerId: "u-mei",
    businessUnit: "People",
    capabilityIds: ["cap-hcm"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 720_000,
    healthScore: 83,
    riskLevel: "Low",
    techDebtScore: 27,
    aiReadiness: "Medium",
    cloudReadiness: "Cloud-Native",
    disposition: "Tolerate",
    certStatus: "Certified",
    technologyIds: [],
    vendor: "Workday",
    hostingModel: "SaaS",
    userCount: 5400,
    consultantIds: [],
    services: [
      { name: "Payroll", status: "Operational" },
      { name: "Talent", status: "Operational" },
    ],
    integrations: [
      { name: "FinanceHub cost centers", direction: "Outbound", target: "FinanceHub", type: "API" },
    ],
    dataObjects: [{ name: "Employee", sensitivity: "Restricted" }],
  },
  {
    id: "app-warehouse",
    name: "Warehouse Mgmt System",
    description: "Inventory, picking, and distribution management.",
    ownerId: "u-omar",
    businessUnit: "Operations",
    capabilityIds: ["cap-supply-wms"],
    lifecycleStage: "Production",
    businessCriticality: "High",
    annualCost: 610_000,
    healthScore: 68,
    riskLevel: "Medium",
    techDebtScore: 52,
    aiReadiness: "Low",
    cloudReadiness: "Hybrid",
    disposition: "Modernize",
    certStatus: "Due",
    technologyIds: ["tech-java", "tech-oracle-db"],
    vendor: "Manhattan Associates",
    hostingModel: "Private Cloud",
    userCount: 760,
    consultantIds: ["c-james"],
    services: [
      { name: "Inventory Mgmt", status: "Operational" },
      { name: "Pick & Pack", status: "Operational" },
    ],
    integrations: [
      { name: "FieldForce work orders", direction: "Outbound", target: "FieldForce Mobile", type: "API" },
    ],
    dataObjects: [
      { name: "SKU", sensitivity: "Internal" },
      { name: "Shipment", sensitivity: "Internal" },
    ],
  },
];

export const findApplication = (id: string) => applications.find((a) => a.id === id);
export const applicationsForCapability = (capId: string) =>
  applications.filter((a) => a.capabilityIds.includes(capId));
export const applicationsForTechnology = (techId: string) =>
  applications.filter((a) => a.technologyIds.includes(techId));

export const DISPOSITIONS: Disposition[] = ["Tolerate", "Invest", "Migrate", "Modernize", "Replace", "Retire"];
export const LIFECYCLE_STAGES: LifecycleStage[] = ["Plan", "Build", "Production", "Sunset", "Retired"];
export const CRITICALITIES: Criticality[] = ["Critical", "High", "Medium", "Low"];

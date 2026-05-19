export type StandardStatus = "Approved" | "Emerging" | "Non-Standard" | "Retired";
export type TechLifecycle = "Current" | "Mainstream" | "Declining" | "End of Life" | "End of Support";
export type TechKind = "Standard" | "Product";

export interface Technology {
  id: string;
  name: string;
  category: string;
  vendor: string;
  kind: TechKind;
  standardStatus: StandardStatus;
  lifecycleStatus: TechLifecycle;
  eolDate?: string;
  /** Application ids using this technology. */
  usedByAppIds: string[];
  aiUpgradeCandidate: boolean;
  replacementCandidate: boolean;
}

export const technologies: Technology[] = [
  { id: "tech-java", name: "Java 17 (LTS)", category: "Language / Runtime", vendor: "Oracle", kind: "Standard", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-orderhub", "app-claimscore"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-dotnet", name: ".NET 8", category: "Language / Runtime", vendor: "Microsoft", kind: "Standard", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-fieldforce"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-cobol", name: "COBOL / Mainframe", category: "Language / Runtime", vendor: "IBM", kind: "Standard", standardStatus: "Retired", lifecycleStatus: "End of Life", eolDate: "2024-12-31", usedByAppIds: ["app-corebilling", "app-legacygl"], aiUpgradeCandidate: true, replacementCandidate: true },
  { id: "tech-oracle-db", name: "Oracle Database 19c", category: "Database", vendor: "Oracle", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Mainstream", usedByAppIds: ["app-orderhub", "app-corebilling"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-sqlserver-2014", name: "SQL Server 2014", category: "Database", vendor: "Microsoft", kind: "Product", standardStatus: "Non-Standard", lifecycleStatus: "End of Support", eolDate: "2024-07-09", usedByAppIds: ["app-fieldforce", "app-vendorportal"], aiUpgradeCandidate: false, replacementCandidate: true },
  { id: "tech-winserver-2012", name: "Windows Server 2012 R2", category: "Operating System", vendor: "Microsoft", kind: "Product", standardStatus: "Non-Standard", lifecycleStatus: "End of Support", eolDate: "2023-10-10", usedByAppIds: ["app-legacygl", "app-vendorportal"], aiUpgradeCandidate: false, replacementCandidate: true },
  { id: "tech-sap", name: "SAP S/4HANA", category: "ERP Platform", vendor: "SAP", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-financehub"], aiUpgradeCandidate: true, replacementCandidate: false },
  { id: "tech-servicenow", name: "ServiceNow", category: "Workflow Platform", vendor: "ServiceNow", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-itsm", "app-grc"], aiUpgradeCandidate: true, replacementCandidate: false },
  { id: "tech-salesforce", name: "Salesforce Sales Cloud", category: "CRM Platform", vendor: "Salesforce", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-crm"], aiUpgradeCandidate: true, replacementCandidate: false },
  { id: "tech-react", name: "React 19", category: "UI Framework", vendor: "Meta (OSS)", kind: "Standard", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-orderhub", "app-customerportal"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-node", name: "Node.js 22 (LTS)", category: "Language / Runtime", vendor: "OpenJS (OSS)", kind: "Standard", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-customerportal", "app-datahub"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-k8s", name: "Kubernetes (EKS)", category: "Container Platform", vendor: "AWS", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-orderhub", "app-customerportal", "app-datahub"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-snowflake", name: "Snowflake", category: "Data Platform", vendor: "Snowflake", kind: "Product", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-datahub", "app-claimscore"], aiUpgradeCandidate: true, replacementCandidate: false },
  { id: "tech-python", name: "Python 3.12", category: "Language / Runtime", vendor: "PSF (OSS)", kind: "Standard", standardStatus: "Approved", lifecycleStatus: "Current", usedByAppIds: ["app-datahub", "app-claimscore"], aiUpgradeCandidate: false, replacementCandidate: false },
  { id: "tech-flash", name: "Adobe Flash Components", category: "UI Framework", vendor: "Adobe", kind: "Product", standardStatus: "Retired", lifecycleStatus: "End of Life", eolDate: "2020-12-31", usedByAppIds: ["app-legacygl"], aiUpgradeCandidate: false, replacementCandidate: true },
];

export const findTechnology = (id: string) => technologies.find((t) => t.id === id);

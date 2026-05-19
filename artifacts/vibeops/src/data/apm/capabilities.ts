export interface Capability {
  id: string;
  name: string;
  /** Parent capability id, or null for a top-level (L1) capability. */
  parentId: string | null;
  level: 1 | 2;
  description: string;
}

/**
 * Lightweight business capability hierarchy (2 levels — deliberately simpler
 * than ServiceNow). Applications reference capability ids via `capabilityIds`.
 */
export const capabilities: Capability[] = [
  { id: "cap-customer", name: "Customer Management", parentId: null, level: 1, description: "Acquiring, serving, and retaining customers." },
  { id: "cap-customer-sales", name: "Sales & Quoting", parentId: "cap-customer", level: 2, description: "Lead-to-quote and order capture." },
  { id: "cap-customer-service", name: "Customer Service", parentId: "cap-customer", level: 2, description: "Case management and support." },

  { id: "cap-finance", name: "Finance & Accounting", parentId: null, level: 1, description: "Financial operations, reporting, and controls." },
  { id: "cap-finance-gl", name: "General Ledger & Close", parentId: "cap-finance", level: 2, description: "Core accounting and period close." },
  { id: "cap-finance-ap", name: "Procure-to-Pay", parentId: "cap-finance", level: 2, description: "Procurement and accounts payable." },

  { id: "cap-supply", name: "Supply Chain", parentId: null, level: 1, description: "Planning, sourcing, and fulfilment." },
  { id: "cap-supply-wms", name: "Warehouse & Logistics", parentId: "cap-supply", level: 2, description: "Inventory and distribution." },

  { id: "cap-hcm", name: "Human Capital", parentId: null, level: 1, description: "Workforce hiring, payroll, and development." },

  { id: "cap-product", name: "Product Engineering", parentId: null, level: 1, description: "Designing and building products." },

  { id: "cap-it", name: "IT & Security", parentId: null, level: 1, description: "Running, securing, and governing technology." },

  { id: "cap-data", name: "Data & Analytics", parentId: null, level: 1, description: "Enterprise data, BI, and AI." },
];

export const topLevelCapabilities = capabilities.filter((c) => c.level === 1);
export const childrenOf = (id: string) => capabilities.filter((c) => c.parentId === id);
export const findCapability = (id: string) => capabilities.find((c) => c.id === id);

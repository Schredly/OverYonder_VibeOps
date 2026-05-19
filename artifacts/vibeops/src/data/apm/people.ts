export type PersonType = "internal" | "consultant";

export interface Person {
  id: string;
  name: string;
  initials: string;
  type: PersonType;
  role: string;
  email: string;
  /** Consulting firm name for external consultants. */
  firm?: string;
  /** Billing rate ($/hr) — consultants only. */
  billRate?: number;
}

export const people: Person[] = [
  // --- Internal CIO organization ---
  { id: "u-sandra", name: "Sandra Reyes", initials: "SR", type: "internal", role: "CIO", email: "sandra.reyes@northwind.example" },
  { id: "u-david", name: "David Okafor", initials: "DO", type: "internal", role: "Chief Enterprise Architect", email: "david.okafor@northwind.example" },
  { id: "u-mei", name: "Mei Chen", initials: "MC", type: "internal", role: "Application Portfolio Lead", email: "mei.chen@northwind.example" },
  { id: "u-tom", name: "Tom Wallace", initials: "TW", type: "internal", role: "PMO Lead", email: "tom.wallace@northwind.example" },
  { id: "u-rachel", name: "Rachel Greene", initials: "RG", type: "internal", role: "Security & Risk Lead", email: "rachel.greene@northwind.example" },
  { id: "u-james", name: "James Park", initials: "JP", type: "internal", role: "Application Owner — Finance", email: "james.park@northwind.example" },
  { id: "u-lisa", name: "Lisa Brandt", initials: "LB", type: "internal", role: "Application Owner — Customer", email: "lisa.brandt@northwind.example" },
  { id: "u-omar", name: "Omar Hassan", initials: "OH", type: "internal", role: "Infrastructure Lead", email: "omar.hassan@northwind.example" },

  // --- External consultants (granted scoped access) ---
  { id: "c-alex", name: "Alex Thompson", initials: "AT", type: "consultant", role: "Engagement Partner", email: "alex@overyonder.example", firm: "OverYonder Advisory", billRate: 320 },
  { id: "c-priya", name: "Priya Sharma", initials: "PS", type: "consultant", role: "EA Principal", email: "priya@overyonder.example", firm: "OverYonder Advisory", billRate: 285 },
  { id: "c-marcus", name: "Marcus Lee", initials: "ML", type: "consultant", role: "Modernization Lead", email: "marcus@overyonder.example", firm: "OverYonder Advisory", billRate: 245 },
  { id: "c-emma", name: "Emma Schmidt", initials: "ES", type: "consultant", role: "Cloud Architect", email: "emma@overyonder.example", firm: "OverYonder Advisory", billRate: 225 },
  { id: "c-james", name: "James Martinez", initials: "JM", type: "consultant", role: "Migration Consultant", email: "james.m@overyonder.example", firm: "OverYonder Advisory", billRate: 195 },
];

export const findPerson = (id: string) => people.find((p) => p.id === id);
export const internalUsers = people.filter((p) => p.type === "internal");
export const consultants = people.filter((p) => p.type === "consultant");

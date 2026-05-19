/**
 * Tenant-aware data partitioning.
 *
 * The mock datasets are global; this module deterministically assigns every
 * record to one tenant so the platform behaves like a real multi-tenant
 * control plane. Assignment runs once at module load: primary entities are
 * hashed to a tenant, dependent entities inherit their parent's tenant so
 * cross-references stay consistent within a tenant's view.
 *
 * Shared reference data (capability map, technology standards) is never
 * assigned — it is visible to every tenant.
 */
import { applications } from "@/data/apm/applications";
import { projects } from "@/data/apm/projects";
import { migrationWaves } from "@/data/apm/migrations";
import { assessments } from "@/data/apm/assessments";
import { apmTasks } from "@/data/apm/tasks";
import { apmRisks, apmDecisions } from "@/data/apm/risks";
import { people } from "@/data/apm/people";
import { clients } from "@/data/consulting/clients";
import { engagements } from "@/data/consulting/engagements";
import { consultants } from "@/data/consulting/consultants";
import { proposals } from "@/data/consulting/proposals";
import { programs } from "@/data/consulting/programs";
import { deliveryRisks } from "@/data/consulting/risks";
import { consultingTasks } from "@/data/consulting/tasks";

export const TENANT_IDS = ["dod", "gfsc", "aicp", "etg"] as const;
export type TenantId = (typeof TENANT_IDS)[number];

/** FNV-1a string hash — stable across reloads. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministically bucket an id into one of the tenants. */
function bucket(id: string): TenantId {
  return TENANT_IDS[hash(id) % TENANT_IDS.length];
}

const assignment = new Map<string, TenantId>();

function assign(id: string, tenant: TenantId): void {
  assignment.set(id, tenant);
}

/** Inherit the parent record's tenant, falling back to a hash bucket. */
function inherit(id: string, parentId: string | undefined): void {
  const parent = parentId ? assignment.get(parentId) : undefined;
  assignment.set(id, parent ?? bucket(id));
}

// Primary entities — hashed directly.
applications.forEach((a) => assign(a.id, bucket(a.id)));
clients.forEach((c) => assign(c.id, bucket(c.id)));
people.forEach((p) => assign(p.id, bucket(p.id)));
consultants.forEach((c) => assign(c.id, bucket(c.id)));

// Dependent entities — inherit so references resolve within a tenant.
projects.forEach((p) => inherit(p.id, p.applicationIds[0]));
engagements.forEach((e) => inherit(e.id, e.clientId));
migrationWaves.forEach((w) => inherit(w.id, w.projectId));
assessments.forEach((a) => inherit(a.id, a.appId));
apmTasks.forEach((t) => inherit(t.id, t.scope.id));
apmRisks.forEach((r) => inherit(r.id, r.scope.id));
apmDecisions.forEach((d) => inherit(d.id, d.scope.id));
consultingTasks.forEach((t) => inherit(t.id, t.engagementId));
deliveryRisks.forEach((r) => inherit(r.id, r.engagementId));
proposals.forEach((p) => inherit(p.id, p.clientId));
programs.forEach((p) => inherit(p.id, p.clientIds[0]));

/** The tenant a record belongs to, or `undefined` for shared / unknown ids. */
export function tenantOf(id: string): TenantId | undefined {
  return assignment.get(id);
}

/**
 * Filter a record list to the active tenant. Shared reference data and
 * records created in-session (unknown ids) are kept visible.
 */
export function scopeToTenant<T extends { id: string }>(items: T[], tenantId: string): T[] {
  return items.filter((item) => {
    const owner = assignment.get(item.id);
    return owner === undefined || owner === tenantId;
  });
}

export interface TenantStats {
  applications: number;
  projects: number;
  risks: number;
  tasks: number;
  clients: number;
  engagements: number;
  consultants: number;
  proposals: number;
  programs: number;
  users: number;
}

function countFor(items: { id: string }[], tenantId: string): number {
  return items.reduce((n, item) => (assignment.get(item.id) === tenantId ? n + 1 : n), 0);
}

/** Live record counts for a tenant — feeds the switcher overview panel. */
export function tenantStats(tenantId: string): TenantStats {
  return {
    applications: countFor(applications, tenantId),
    projects: countFor(projects, tenantId),
    risks: countFor(apmRisks, tenantId) + countFor(deliveryRisks, tenantId),
    tasks: countFor(apmTasks, tenantId) + countFor(consultingTasks, tenantId),
    clients: countFor(clients, tenantId),
    engagements: countFor(engagements, tenantId),
    consultants: countFor(consultants, tenantId),
    proposals: countFor(proposals, tenantId),
    programs: countFor(programs, tenantId),
    users: countFor(people, tenantId),
  };
}

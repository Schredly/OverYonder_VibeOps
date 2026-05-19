import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { applications as seedApplications, type BusinessApplication } from "@/data/apm/applications";
import { projects as seedProjects, type ModernizationProject } from "@/data/apm/projects";
import { migrationWaves as seedWaves, type MigrationWave } from "@/data/apm/migrations";
import { apmTasks as seedTasks, type ApmTask } from "@/data/apm/tasks";
import {
  apmRisks as seedRisks,
  apmDecisions as seedDecisions,
  type ApmRisk,
  type ApmDecision,
} from "@/data/apm/risks";
import { certificationCampaigns as seedCampaigns, type CertificationCampaign } from "@/data/apm/certifications";
import { technologies as seedTechnologies, type Technology } from "@/data/apm/technologies";
import { capabilities as seedCapabilities, type Capability } from "@/data/apm/capabilities";
import { people as seedPeople, type Person } from "@/data/apm/people";
import { assessments as seedAssessments, type Assessment } from "@/data/apm/assessments";
import { scopeToTenant } from "@/lib/tenantScope";
import { useAppContext } from "@/context/AppContext";

/**
 * A mutable, in-memory collection of records keyed by `id`.
 *
 * `items` is scoped to the active tenant — list views read this. `all` is the
 * full, unscoped collection — by-id lookups (detail pages) read this so deep
 * links resolve regardless of the active tenant.
 */
export interface Collection<T> {
  items: T[];
  all: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
}

interface ApmDataContextValue {
  applications: Collection<BusinessApplication>;
  projects: Collection<ModernizationProject>;
  migrationWaves: Collection<MigrationWave>;
  tasks: Collection<ApmTask>;
  risks: Collection<ApmRisk>;
  decisions: Collection<ApmDecision>;
  campaigns: Collection<CertificationCampaign>;
  technologies: Collection<Technology>;
  capabilities: Collection<Capability>;
  people: Collection<Person>;
  assessments: Collection<Assessment>;
}

const ApmDataContext = createContext<ApmDataContextValue | undefined>(undefined);

/**
 * Backs every APM list with mutable React state so create / update / delete
 * flows persist for the session. All seed data is mock — there is no API yet.
 * `items` is filtered to `tenantId`; `all` keeps the full set.
 */
function useCollection<T extends { id: string }>(seed: T[], tenantId: string): Collection<T> {
  const [items, setItems] = useState<T[]>(seed);
  const scoped = useMemo(() => scopeToTenant(items, tenantId), [items, tenantId]);
  return {
    items: scoped,
    all: items,
    add: (item) => setItems((prev) => [item, ...prev]),
    update: (id, patch) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
  };
}

export function ApmDataProvider({ children }: { children: ReactNode }) {
  const { activeTenant } = useAppContext();
  const tid = activeTenant.id;

  const applications = useCollection<BusinessApplication>(seedApplications, tid);
  const projects = useCollection<ModernizationProject>(seedProjects, tid);
  const migrationWaves = useCollection<MigrationWave>(seedWaves, tid);
  const tasks = useCollection<ApmTask>(seedTasks, tid);
  const risks = useCollection<ApmRisk>(seedRisks, tid);
  const decisions = useCollection<ApmDecision>(seedDecisions, tid);
  const campaigns = useCollection<CertificationCampaign>(seedCampaigns, tid);
  const technologies = useCollection<Technology>(seedTechnologies, tid);
  const capabilities = useCollection<Capability>(seedCapabilities, tid);
  const people = useCollection<Person>(seedPeople, tid);
  const assessments = useCollection<Assessment>(seedAssessments, tid);

  const value = useMemo<ApmDataContextValue>(
    () => ({
      applications,
      projects,
      migrationWaves,
      tasks,
      risks,
      decisions,
      campaigns,
      technologies,
      capabilities,
      people,
      assessments,
    }),
    // Rebuild when any collection's scoped items change.
    [
      applications.items,
      projects.items,
      migrationWaves.items,
      tasks.items,
      risks.items,
      decisions.items,
      campaigns.items,
      technologies.items,
      capabilities.items,
      people.items,
      assessments.items,
    ],
  );

  return <ApmDataContext.Provider value={value}>{children}</ApmDataContext.Provider>;
}

export function useApmData() {
  const ctx = useContext(ApmDataContext);
  if (!ctx) throw new Error("useApmData must be used within ApmDataProvider");
  return ctx;
}

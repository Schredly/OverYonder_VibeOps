import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { clients as seedClients, type Client } from "@/data/consulting/clients";
import { engagements as seedEngagements, type Engagement } from "@/data/consulting/engagements";
import { consultants as seedConsultants, type Consultant } from "@/data/consulting/consultants";
import { proposals as seedProposals, type Proposal } from "@/data/consulting/proposals";
import { consultingTasks as seedTasks, type ConsultingTask } from "@/data/consulting/tasks";
import { deliveryRisks as seedRisks, type DeliveryRisk } from "@/data/consulting/risks";
import { programs as seedPrograms, type Program } from "@/data/consulting/programs";
import {
  consultingTime as seedTime,
  consultingInvoices as seedInvoices,
  type ConsultingTimeEntry,
  type ConsultingInvoice,
} from "@/data/consulting/timeBilling";

/** A mutable, in-memory collection of records keyed by `id`. */
export interface Collection<T> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
}

interface ConsultingDataContextValue {
  clients: Collection<Client>;
  engagements: Collection<Engagement>;
  consultants: Collection<Consultant>;
  proposals: Collection<Proposal>;
  tasks: Collection<ConsultingTask>;
  risks: Collection<DeliveryRisk>;
  programs: Collection<Program>;
  timeEntries: Collection<ConsultingTimeEntry>;
  invoices: Collection<ConsultingInvoice>;
}

const ConsultingDataContext = createContext<ConsultingDataContextValue | undefined>(undefined);

/** Backs every consulting list with mutable React state (mock data — no API). */
function useCollection<T extends { id: string }>(seed: T[]): Collection<T> {
  const [items, setItems] = useState<T[]>(seed);
  return {
    items,
    add: (item) => setItems((prev) => [item, ...prev]),
    update: (id, patch) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
  };
}

export function ConsultingDataProvider({ children }: { children: ReactNode }) {
  const clients = useCollection<Client>(seedClients);
  const engagements = useCollection<Engagement>(seedEngagements);
  const consultants = useCollection<Consultant>(seedConsultants);
  const proposals = useCollection<Proposal>(seedProposals);
  const tasks = useCollection<ConsultingTask>(seedTasks);
  const risks = useCollection<DeliveryRisk>(seedRisks);
  const programs = useCollection<Program>(seedPrograms);
  const timeEntries = useCollection<ConsultingTimeEntry>(seedTime);
  const invoices = useCollection<ConsultingInvoice>(seedInvoices);

  const value = useMemo<ConsultingDataContextValue>(
    () => ({ clients, engagements, consultants, proposals, tasks, risks, programs, timeEntries, invoices }),
    [
      clients.items,
      engagements.items,
      consultants.items,
      proposals.items,
      tasks.items,
      risks.items,
      programs.items,
      timeEntries.items,
      invoices.items,
    ],
  );

  return <ConsultingDataContext.Provider value={value}>{children}</ConsultingDataContext.Provider>;
}

export function useConsultingData() {
  const ctx = useContext(ConsultingDataContext);
  if (!ctx) throw new Error("useConsultingData must be used within ConsultingDataProvider");
  return ctx;
}

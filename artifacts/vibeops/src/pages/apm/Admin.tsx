import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RecordFormDialog, { type FormField } from "@/components/apm/RecordFormDialog";
import RowActions from "@/components/apm/RowActions";
import DetailDrawer from "@/components/apm/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Building2, Users, KeyRound, Plug, Plus } from "lucide-react";
import type { Person, PersonType } from "@/data/apm/people";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { name: "CIO / Executive", access: "Full portfolio, all modules", users: 1 },
  { name: "Enterprise Architect", access: "Portfolio, capabilities, technology, decisions", users: 1 },
  { name: "Portfolio Lead", access: "Applications, certifications, projects", users: 1 },
  { name: "PMO Lead", access: "Projects, migrations, tasks", users: 1 },
  { name: "Application Owner", access: "Owned applications, attestations, tasks", users: 3 },
  { name: "Security & Risk", access: "Risks, decisions, certifications", users: 1 },
  { name: "External Consultant", access: "Scoped applications & projects only", users: 5 },
];

const integrations = [
  { name: "ServiceNow CMDB / APM", status: "Connected", note: "Nightly sync · 8 targets" },
  { name: "Azure AD / SSO", status: "Connected", note: "SAML — auto-provisioning on" },
  { name: "Jira", status: "Not Connected", note: "Optional task sync" },
  { name: "Cost & Billing Export", status: "Connected", note: "Monthly CSV to finance" },
];

const TYPE_LABELS = ["Internal", "Consultant"] as const;

const userFields: FormField[] = [
  { name: "name", label: "Full name", required: true },
  { name: "type", label: "User type", type: "select", required: true, options: TYPE_LABELS },
  { name: "role", label: "Role / title", required: true },
  { name: "email", label: "Email" },
  { name: "firm", label: "Consulting firm", placeholder: "Consultants only" },
  { name: "billRate", label: "Bill rate ($/hr)", type: "number", placeholder: "Consultants only" },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Admin() {
  const { people: peopleStore } = useApmData();
  const people = peopleStore.items;
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const editing = people.find((p) => p.id === editId) ?? null;
  const viewing = people.find((p) => p.id === viewId) ?? null;

  const internal = people.filter((p) => p.type === "internal").length;
  const external = people.filter((p) => p.type === "consultant").length;

  const personType = (label: string): PersonType => (label === "Consultant" ? "consultant" : "internal");

  const handleCreate = (values: Record<string, string>) => {
    const type = personType(values.type);
    const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const person: Person = {
      id: `${type === "internal" ? "u" : "c"}-${slug || Date.now()}`,
      name: values.name,
      initials: initials(values.name),
      type,
      role: values.role || "—",
      email: values.email || "",
      firm: type === "consultant" ? values.firm || undefined : undefined,
      billRate: type === "consultant" && values.billRate ? Number(values.billRate) : undefined,
    };
    peopleStore.add(person);
    toast({ title: "User added", description: `${person.name} added.` });
  };

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    const type = personType(values.type);
    peopleStore.update(editing.id, {
      name: values.name || editing.name,
      initials: initials(values.name || editing.name),
      type,
      role: values.role || editing.role,
      email: values.email || editing.email,
      firm: type === "consultant" ? values.firm || editing.firm : undefined,
      billRate: type === "consultant" ? Number(values.billRate) || editing.billRate : undefined,
    });
    toast({ title: "User updated", description: `${values.name || editing.name} saved.` });
    setEditId(null);
  };

  const initialValues = (p: Person): Record<string, string> => ({
    name: p.name,
    type: p.type === "consultant" ? "Consultant" : "Internal",
    role: p.role,
    email: p.email,
    firm: p.firm ?? "",
    billRate: p.billRate ? String(p.billRate) : "",
  });

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Admin"
        description="Tenant configuration, users and roles, and platform integrations."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />New User
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Organization" value={1} subtitle="Northwind Industries" icon={<Building2 className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Internal Users" value={internal} icon={<Users className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="External Consultants" value={external} subtitle="scoped access" icon={<KeyRound className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Integrations" value={integrations.filter((i) => i.status === "Connected").length} subtitle={`of ${integrations.length}`} icon={<Plug className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Roles & access</h3>
            <p className="mt-1 text-sm text-muted-foreground">Role-based access — full RBAC enforcement lands in Phase 3.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr><th className="p-3">Role</th><th className="p-3">Access</th><th className="p-3">Users</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((r) => (
                <tr key={r.name} className="hover:bg-muted/40">
                  <td className="p-3 font-medium text-foreground">{r.name}</td>
                  <td className="p-3 text-muted-foreground">{r.access}</td>
                  <td className="p-3 text-muted-foreground">{r.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-base font-medium text-foreground">Integrations</h3>
            <p className="mt-1 text-sm text-muted-foreground">Connected systems feeding the application portfolio.</p>
          </div>
          <ul className="divide-y divide-border">
            {integrations.map((i) => (
              <li key={i.name} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-foreground">{i.name}</div>
                  <div className="text-xs text-muted-foreground">{i.note}</div>
                </div>
                <StatusBadge label={i.status} tone={i.status === "Connected" ? "success" : "neutral"} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">Users</h3>
          <p className="mt-1 text-sm text-muted-foreground">Internal staff and external consultants with platform access.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Type</th><th className="p-3">Email</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {people.map((p) => (
              <tr key={p.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(p.id)}>
                <td className="p-3 font-medium text-foreground">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.role}</td>
                <td className="p-3"><StatusBadge label={p.type === "internal" ? "Internal" : "Consultant"} tone={p.type === "internal" ? "info" : "primary"} /></td>
                <td className="p-3 text-muted-foreground">{p.email}</td>
                <td className="p-3">
                  <RowActions
                    entityName={p.name}
                    entityKind="user"
                    onView={() => setViewId(p.id)}
                    onEdit={() => setEditId(p.id)}
                    onDelete={() => {
                      peopleStore.remove(p.id);
                      toast({ title: "User removed", description: `${p.name} was removed.` });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RecordFormDialog
        title="New User"
        description="Add an internal staff member or an external consultant."
        submitLabel="Add user"
        fields={userFields}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.name}`}
          submitLabel="Save changes"
          fields={userFields}
          initialValues={initialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEdit}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={viewing.name}
          subtitle={viewing.role}
          entityKind="user"
          badges={<StatusBadge label={viewing.type === "internal" ? "Internal" : "Consultant"} tone={viewing.type === "internal" ? "info" : "primary"} />}
          sections={[
            {
              fields: [
                { label: "Email", value: viewing.email || "—", full: true },
                { label: "Type", value: viewing.type === "internal" ? "Internal" : "Consultant" },
                { label: "Firm", value: viewing.firm ?? "—" },
                { label: "Bill rate", value: viewing.billRate ? `$${viewing.billRate}/hr` : "—" },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            peopleStore.remove(viewing.id);
            toast({ title: "User removed", description: `${viewing.name} was removed.` });
          }}
        />
      )}
    </div>
  );
}

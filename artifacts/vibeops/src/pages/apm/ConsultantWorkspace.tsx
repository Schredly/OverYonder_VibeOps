import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import CreateRecordDialog from "@/components/consulting/CreateRecordDialog";
import { Button } from "@/components/ui/button";
import { Users2, ListTodo, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { consultants } from "@/data/apm/people";
import { applications } from "@/data/apm/applications";
import { projects } from "@/data/apm/projects";
import { apmTasks } from "@/data/apm/tasks";
import { timeEntries } from "@/data/apm/time";
import { findPerson } from "@/data/apm/people";
import { scopeHref, scopeLabel } from "@/components/apm/scopeLink";

const today = new Date("2026-05-15");

export default function ConsultantWorkspace() {
  const consultantTasks = apmTasks.filter((t) => findPerson(t.assigneeId)?.type === "consultant");
  const openTasks = consultantTasks.filter((t) => t.status !== "Complete");
  const blocked = consultantTasks.filter((t) => t.status === "Blocked");
  const overdue = openTasks.filter((t) => new Date(t.dueDate) < today);
  const weekHours = timeEntries.reduce((s, e) => s + e.hours, 0);

  // Activity: blend task states + time logs + blockers, newest first.
  const activity = [
    ...consultantTasks.map((t) => ({
      ts: t.dueDate,
      person: findPerson(t.assigneeId)?.name ?? "",
      message:
        t.status === "Blocked"
          ? `flagged a blocker on "${t.name}"`
          : t.status === "Complete"
            ? `completed "${t.name}"`
            : `is ${t.status.toLowerCase()} on "${t.name}"`,
      kind: t.status === "Blocked" ? "blocker" : t.status === "Complete" ? "done" : "task",
    })),
    ...timeEntries.map((e) => ({
      ts: e.date,
      person: findPerson(e.personId)?.name ?? "",
      message: `logged ${e.hours}h — ${e.note}`,
      kind: "time" as const,
    })),
  ]
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, 14);

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Consultant Workspace"
        description="Shared collaboration space — external consultants work within scoped access to portfolios, applications, projects, and tasks."
        actions={
          <CreateRecordDialog
            title="Grant Consultant Access"
            description="Give an external consultant scoped access to a portfolio, application, or project. They will only see what they are granted."
            submitLabel="Grant access"
            fields={[
              { name: "consultant", label: "Consultant", type: "select", required: true, options: consultants.map((c) => `${c.name} — ${c.firm}`) },
              { name: "scopeType", label: "Scope type", type: "select", required: true, options: ["Application", "Project", "Portfolio"] },
              { name: "scope", label: "Scope", type: "select", required: true, options: [...applications.map((a) => a.name), ...projects.map((p) => p.name)] },
              { name: "access", label: "Access level", type: "select", options: ["View", "Update tasks & log time", "Full collaboration"] },
            ]}
            trigger={
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ShieldCheck className="mr-2 h-4 w-4" />Grant Access
              </Button>
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Consultants with Access" value={consultants.length} icon={<Users2 className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="Open Consultant Tasks" value={openTasks.length} subtitle={`${overdue.length} overdue`} icon={<ListTodo className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Hours Logged (period)" value={weekHours} suffix="h" icon={<Clock className="h-5 w-5" />} delay={0.15} />
        <KpiCard title="Blocked Items" value={blocked.length} trend={1} trendDirection="up" trendType="bad" icon={<AlertTriangle className="h-5 w-5" />} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {consultants.map((c) => {
            const scopedApps = applications.filter((a) => a.consultantIds.includes(c.id));
            const scopedProjects = projects.filter((p) => p.consultantIds.includes(c.id));
            const tasks = apmTasks.filter((t) => t.assigneeId === c.id);
            const open = tasks.filter((t) => t.status !== "Complete");
            const hours = timeEntries.filter((e) => e.personId === c.id).reduce((s, e) => s + e.hours, 0);
            return (
              <div key={c.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{c.initials}</div>
                    <div>
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.role} · {c.firm}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2.5 py-1">{open.length} open tasks</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">{hours}h logged</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">${c.billRate}/hr</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-border bg-white p-3">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Scoped access</div>
                    <div className="flex flex-wrap gap-1.5">
                      {scopedApps.map((a) => (
                        <Link key={a.id} href={`/applications/${a.id}`} className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground hover:text-primary">{a.name}</Link>
                      ))}
                      {scopedProjects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{p.name}</Link>
                      ))}
                      {scopedApps.length === 0 && scopedProjects.length === 0 && (
                        <span className="text-xs text-muted-foreground">No scope granted</span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-white p-3">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active tasks</div>
                    <ul className="space-y-1.5">
                      {open.slice(0, 4).map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate text-foreground">{t.name}</span>
                          <StatusBadge label={t.status} />
                        </li>
                      ))}
                      {open.length === 0 && <li className="text-xs text-muted-foreground">No open tasks</li>}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h3 className="text-base font-medium text-foreground">Collaboration activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">Comments, status changes, time logs, and blockers.</p>
          </div>
          <ol className="relative space-y-4 p-5 pl-9">
            <span className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-border" />
            {activity.map((a, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[22px] top-1 h-3 w-3 rounded-full border-2 border-card ${
                    a.kind === "blocker" ? "bg-destructive" : a.kind === "done" ? "bg-success" : a.kind === "time" ? "bg-muted-foreground" : "bg-primary"
                  }`}
                />
                <div className="text-xs text-muted-foreground">{a.ts}</div>
                <div className="text-sm text-foreground">
                  <span className="font-medium">{a.person}</span> {a.message}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h3 className="text-base font-medium text-foreground">All consultant-assigned work</h3>
          <p className="mt-1 text-sm text-muted-foreground">Every task across the portfolio assigned to an external consultant.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-3">Task</th>
              <th className="p-3">Consultant</th>
              <th className="p-3">Scope</th>
              <th className="p-3">Status</th>
              <th className="p-3">Billable</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {consultantTasks.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40">
                <td className="p-3">
                  <div className="font-medium text-foreground">{t.name}</div>
                  {t.blocker && <div className="mt-0.5 text-xs text-destructive">Blocked: {t.blocker}</div>}
                </td>
                <td className="p-3 text-muted-foreground">{findPerson(t.assigneeId)?.name}</td>
                <td className="p-3">
                  <Link href={scopeHref(t.scope)} className="text-muted-foreground hover:text-primary">
                    <span className="text-[11px] uppercase tracking-wide">{scopeLabel[t.scope.type]}</span>
                    <div className="text-foreground">{t.scope.label}</div>
                  </Link>
                </td>
                <td className="p-3"><StatusBadge label={t.status} /></td>
                <td className="p-3 text-muted-foreground">{t.billable ? "Yes" : "—"}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{t.actualHours} / {t.estimatedHours}</td>
                <td className="p-3 text-muted-foreground">{t.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

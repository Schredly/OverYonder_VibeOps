import { useState } from "react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Plus } from "lucide-react";
import RecordFormDialog from "./RecordFormDialog";
import RowActions from "./RowActions";
import DetailDrawer from "./DetailDrawer";
import {
  assessmentFields,
  assessmentDefaults,
  assessmentInitialValues,
  assessmentPatch,
  newAssessment,
  compositeToRating,
} from "./assessmentForm";
import { assessmentComposite, type Assessment } from "@/data/apm/assessments";
import { findPerson } from "@/data/apm/people";
import { useApmData } from "@/context/ApmDataContext";
import { useToast } from "@/hooks/use-toast";
import type { BusinessApplication } from "@/data/apm/applications";

const statusTone = { Draft: "neutral", "In Review": "warning", Final: "success" } as const;

/**
 * Full CRUD list of stored assessment records for a single application —
 * rendered inside the Application detail "Assessments" tab.
 */
export default function AssessmentsPanel({ app }: { app: BusinessApplication }) {
  const { assessments, applications } = useApmData();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const rows = assessments.items
    .filter((a) => a.appId === app.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const editing = assessments.items.find((a) => a.id === editId) ?? null;
  const viewing = assessments.items.find((a) => a.id === viewId) ?? null;

  // Recording a Final AI Readiness assessment promotes the portfolio rating.
  const applyRating = (a: Assessment) => {
    if (a.type === "AI Readiness" && a.status === "Final") {
      const rating = compositeToRating(assessmentComposite(a));
      applications.update(app.id, { aiReadiness: rating });
      return ` Portfolio AI readiness set to ${rating}.`;
    }
    return "";
  };

  const handleCreate = (values: Record<string, string>) => {
    const created = newAssessment(values, app.id);
    assessments.add(created);
    toast({ title: "Assessment recorded", description: `${created.type} assessment saved.${applyRating(created)}` });
  };

  const handleEdit = (values: Record<string, string>) => {
    if (!editing) return;
    const patch = assessmentPatch(values, editing);
    assessments.update(editing.id, patch);
    const merged = { ...editing, ...patch };
    toast({ title: "Assessment updated", description: `${merged.type} assessment saved.${applyRating(merged)}` });
    setEditId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          AI readiness, security, operational, and data assessments recorded for {app.name}.
        </p>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />New Assessment
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No assessments recorded yet. Use New Assessment to add one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Composite</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assessor</th>
                <th className="p-3">Date</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setViewId(a.id)}>
                  <td className="p-3 font-medium text-foreground">{a.type}</td>
                  <td className="p-3 font-medium text-foreground">{assessmentComposite(a)}/100</td>
                  <td className="p-3"><StatusBadge label={a.status} tone={statusTone[a.status]} /></td>
                  <td className="p-3 text-muted-foreground">{findPerson(a.assessorId)?.name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{a.date}</td>
                  <td className="p-3">
                    <RowActions
                      entityName={`${a.type} assessment`}
                      entityKind="assessment"
                      onView={() => setViewId(a.id)}
                      onEdit={() => setEditId(a.id)}
                      onDelete={() => {
                        assessments.remove(a.id);
                        toast({ title: "Assessment deleted", description: `${a.type} assessment was removed.` });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RecordFormDialog
        title="New Assessment"
        description={`Record an assessment for ${app.name}. Scores are pre-filled from portfolio attributes.`}
        submitLabel="Save assessment"
        fields={assessmentFields}
        initialValues={assessmentDefaults(app)}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {editing && (
        <RecordFormDialog
          key={editing.id}
          title={`Edit — ${editing.type} assessment`}
          submitLabel="Save changes"
          fields={assessmentFields}
          initialValues={assessmentInitialValues(editing)}
          open={editId !== null}
          onOpenChange={(o) => !o && setEditId(null)}
          onSubmit={handleEdit}
        />
      )}
      {viewing && (
        <DetailDrawer
          open={viewId !== null}
          onOpenChange={(o) => !o && setViewId(null)}
          title={`${viewing.type} Assessment`}
          subtitle={`${app.name} · ${viewing.date}`}
          entityKind="assessment"
          badges={
            <>
              <StatusBadge label={viewing.status} tone={statusTone[viewing.status]} />
              <StatusBadge label={`${assessmentComposite(viewing)}/100`} tone="primary" />
            </>
          }
          sections={[
            {
              heading: "Readiness dimensions",
              fields: [
                { label: "Data readiness", value: `${viewing.dataReadiness}/100` },
                { label: "Integration readiness", value: `${viewing.integrationReadiness}/100` },
                { label: "Use-case fit", value: `${viewing.useCaseFit}/100` },
                { label: "Governance & risk", value: `${viewing.governanceRisk}/100` },
                { label: "Assessor", value: findPerson(viewing.assessorId)?.name ?? "—" },
                { label: "Composite", value: `${assessmentComposite(viewing)}/100` },
                { label: "Recommendation", value: viewing.recommendation || "—", full: true },
                { label: "Notes", value: viewing.notes || "—", full: true },
              ],
            },
          ]}
          onEdit={() => {
            setEditId(viewing.id);
            setViewId(null);
          }}
          onDelete={() => {
            assessments.remove(viewing.id);
            toast({ title: "Assessment deleted", description: `${viewing.type} assessment was removed.` });
          }}
        />
      )}
    </div>
  );
}

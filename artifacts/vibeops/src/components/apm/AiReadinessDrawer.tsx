import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Sparkles, Plus, Pencil } from "lucide-react";
import RecordFormDialog from "./RecordFormDialog";
import { healthBarColor } from "./tone";
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

function Dimension({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-medium text-foreground">{score}/100</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${healthBarColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

interface AiReadinessDrawerProps {
  app: BusinessApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AiReadinessDrawer({ app, open, onOpenChange }: AiReadinessDrawerProps) {
  const { assessments, applications } = useApmData();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const aiAssessments = assessments.items
    .filter((a) => a.appId === app.id && a.type === "AI Readiness")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = aiAssessments[0] ?? null;

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
    if (!latest) return;
    const patch = assessmentPatch(values, latest);
    assessments.update(latest.id, patch);
    const merged = { ...latest, ...patch };
    toast({ title: "Assessment updated", description: `${merged.type} assessment saved.${applyRating(merged)}` });
    setEditOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="space-y-2 border-b border-border p-6 text-left">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Readiness — {app.name}
          </SheetTitle>
          <SheetDescription>
            Stored AI-readiness assessments for this application. Recording a Final assessment
            updates the portfolio rating.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {latest ? (
            <>
              {/* Latest assessment scorecard */}
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Latest assessment</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge label={latest.status} tone={statusTone[latest.status]} />
                      <span className="text-xs text-muted-foreground">
                        {findPerson(latest.assessorId)?.name ?? "Unassigned"} · {latest.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-foreground">{assessmentComposite(latest)}</div>
                    <div className="text-xs text-muted-foreground">composite / 100</div>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <Dimension label="Data readiness" score={latest.dataReadiness} />
                  <Dimension label="Integration readiness" score={latest.integrationReadiness} />
                  <Dimension label="Use-case fit" score={latest.useCaseFit} />
                  <Dimension label="Governance & risk" score={latest.governanceRisk} />
                </div>
              </div>

              {latest.recommendation && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Recommendation
                  </div>
                  <p className="text-sm text-foreground">{latest.recommendation}</p>
                </div>
              )}

              {latest.notes && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</div>
                  <p className="text-sm text-muted-foreground">{latest.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />Edit assessment
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />New assessment
                </Button>
              </div>

              {aiAssessments.length > 1 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</div>
                  <ul className="space-y-1.5">
                    {aiAssessments.slice(1).map((a) => (
                      <li key={a.id} className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{a.date} · {findPerson(a.assessorId)?.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{assessmentComposite(a)}</span>
                          <StatusBadge label={a.status} tone={statusTone[a.status]} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No AI readiness assessment recorded for {app.name} yet.
              </p>
              <Button size="sm" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Run assessment
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            New assessments are pre-filled with scores derived from current portfolio attributes —
            adjust them to reflect the review, then save.
          </p>
        </div>
      </SheetContent>

      <RecordFormDialog
        title="New AI Readiness Assessment"
        description={`Record an assessment for ${app.name}. Scores are pre-filled from portfolio attributes.`}
        submitLabel="Save assessment"
        fields={assessmentFields}
        initialValues={assessmentDefaults(app)}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
      {latest && (
        <RecordFormDialog
          key={latest.id}
          title="Edit Assessment"
          submitLabel="Save changes"
          fields={assessmentFields}
          initialValues={assessmentInitialValues(latest)}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={handleEdit}
        />
      )}
    </Sheet>
  );
}

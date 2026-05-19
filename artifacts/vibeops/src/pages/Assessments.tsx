import { motion } from "framer-motion";
import { assessments } from "@/data/assessments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge, { statusToTone } from "@/components/dashboard/StatusBadge";

const riskTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  Low: "success",
  Medium: "warning",
  High: "danger",
};

export default function Assessments() {
  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Assessments"
        description="AI readiness, security, and operational posture assessments."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assessments.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="cursor-pointer border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium">{a.title}</CardTitle>
                  <StatusBadge label={`${a.riskLevel} Risk`} tone={riskTone[a.riskLevel] ?? "neutral"} />
                </div>
                <p className="text-xs text-muted-foreground">{a.tenant}</p>
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex items-end justify-between">
                  <div className="space-y-1">
                    <StatusBadge label={a.status} tone={statusToTone(a.status)} />
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-semibold text-foreground">
                      {a.score}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">/100</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

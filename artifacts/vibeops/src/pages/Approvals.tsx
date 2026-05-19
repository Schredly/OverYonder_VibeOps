import { motion } from "framer-motion";
import { approvals } from "@/data/approvals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";

const columns = [
  "Pending",
  "Approved",
  "Approved with Conditions",
  "Requires Remediation",
  "Rejected",
] as const;

const priorityTone: Record<string, "danger" | "warning" | "success" | "neutral"> = {
  Critical: "danger",
  High: "warning",
  Medium: "warning",
  Low: "success",
};

export default function Approvals() {
  return (
    <div className="flex h-full flex-col space-y-6 p-8 pb-20">
      <PageHeader
        title="Approval Workflows"
        description="Multi-stage governance, steering committee, and conditional approvals."
        actions={
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Approval
          </Button>
        }
      />

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columns.map((col, i) => {
          const items = approvals.filter((a) => a.status === col);
          return (
            <motion.div
              key={col}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex w-80 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card/60 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">{col}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    No items
                  </div>
                )}
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-grab border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {item.title}
                        </CardTitle>
                        <StatusBadge label={item.priority} tone={priorityTone[item.priority] ?? "neutral"} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="mt-2 flex items-end justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                            {item.requestor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-xs text-muted-foreground">{item.type}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.dateSubmitted}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

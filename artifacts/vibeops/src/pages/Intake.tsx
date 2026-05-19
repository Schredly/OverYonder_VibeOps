import { motion } from "framer-motion";
import { intakeRequests } from "@/data/intakeRequests";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Inbox, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import KpiCard from "@/components/dashboard/KpiCard";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default function Intake() {
  const total = intakeRequests.length;
  const inReview = intakeRequests.filter((r) => /review|assessment|prioritization/i.test(r.status)).length;
  const approved = intakeRequests.filter((r) => /approved|planning|delivery|completed/i.test(r.status)).length;

  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="Intake Center"
        description="Submit, triage, and route AI initiative requests through the governance lifecycle."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard title="Total Requests" value={total} icon={<Inbox className="h-5 w-5" />} delay={0.05} />
        <KpiCard title="In Review" value={inReview} icon={<Clock className="h-5 w-5" />} delay={0.1} />
        <KpiCard title="Approved or In Delivery" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.15} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-sm text-muted-foreground">{total} requests</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Department</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Submitter</TableHead>
              <TableHead className="text-muted-foreground">Budget Est.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeRequests.map((req) => (
              <TableRow
                key={req.id}
                className="cursor-pointer border-border transition-colors hover:bg-muted/40"
              >
                <TableCell className="font-medium text-foreground">{req.title}</TableCell>
                <TableCell className="text-muted-foreground">{req.type}</TableCell>
                <TableCell className="text-muted-foreground">{req.department}</TableCell>
                <TableCell>
                  <StatusBadge label={req.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{req.submitter}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{req.budgetEstimate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { initiatives } from "@/data/initiatives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";

export default function Portfolio() {
  return (
    <div className="space-y-6 p-8 pb-20">
      <PageHeader
        title="AI Portfolio"
        description="Manage and track active AI initiatives across the enterprise."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Initiative
            </Button>
          </>
        }
      />

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search initiatives..."
            className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {initiatives.length} initiatives · {initiatives.filter((i) => i.status === "Active").length} active
        </div>
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
              <TableHead className="text-muted-foreground">Initiative</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Department</TableHead>
              <TableHead className="text-muted-foreground">Platform</TableHead>
              <TableHead className="text-muted-foreground">Owner</TableHead>
              <TableHead className="text-muted-foreground">Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initiatives.map((init) => (
              <TableRow
                key={init.id}
                className="cursor-pointer border-border transition-colors hover:bg-muted/40"
              >
                <TableCell className="font-medium text-foreground">{init.title}</TableCell>
                <TableCell>
                  <StatusBadge label={init.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{init.department}</TableCell>
                <TableCell className="text-muted-foreground">{init.platform}</TableCell>
                <TableCell className="text-muted-foreground">{init.owner}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${init.completion}%` }}
                      />
                    </div>
                    <span className="w-10 text-xs text-muted-foreground">{init.completion}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

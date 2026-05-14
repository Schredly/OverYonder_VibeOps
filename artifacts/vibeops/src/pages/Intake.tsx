import { motion } from "framer-motion";
import { intakeRequests } from "@/data/intakeRequests";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Intake() {
  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Intake Center</h1>
          <p className="text-muted-foreground mt-1">Review and manage AI initiative requests.</p>
        </div>
        <Button>New Request</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Budget Estimate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intakeRequests.map((req) => (
              <TableRow key={req.id} className="border-border/50 hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium text-foreground">{req.title}</TableCell>
                <TableCell className="text-muted-foreground">{req.type}</TableCell>
                <TableCell className="text-muted-foreground">{req.department}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-background/50">{req.status}</Badge>
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

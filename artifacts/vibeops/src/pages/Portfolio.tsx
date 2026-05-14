import { motion } from "framer-motion";
import { initiatives } from "@/data/initiatives";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Portfolio() {
  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Portfolio</h1>
        <p className="text-muted-foreground mt-1">Manage and track active AI initiatives.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Initiative</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initiatives.map((init) => (
              <TableRow key={init.id} className="border-border/50 hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium text-foreground">{init.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    init.status === "Active" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" :
                    init.status === "At Risk" ? "text-rose-500 border-rose-500/20 bg-rose-500/10" :
                    init.status === "Completed" ? "text-primary border-primary/20 bg-primary/10" :
                    "text-amber-500 border-amber-500/20 bg-amber-500/10"
                  }>
                    {init.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{init.department}</TableCell>
                <TableCell className="text-muted-foreground">{init.platform}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${init.completion}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{init.completion}%</span>
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

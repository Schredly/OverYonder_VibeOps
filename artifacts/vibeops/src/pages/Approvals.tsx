import { motion } from "framer-motion";
import { approvals } from "@/data/approvals";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Approvals() {
  const columns = ["Pending", "Approved", "Approved with Conditions", "Requires Remediation", "Rejected"];

  return (
    <div className="space-y-6 pb-20 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Approval Workflows</h1>
        <p className="text-muted-foreground mt-1">Multi-stage governance and steering committee approvals.</p>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((col, i) => (
          <motion.div 
            key={col}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-80 glass rounded-xl p-4 flex flex-col gap-3 bg-card/30"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{col}</h3>
              <Badge variant="secondary" className="bg-background/50">
                {approvals.filter(a => a.status === col).length}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {approvals.filter(a => a.status === col).map(item => (
                <Card key={item.id} className="glass border-border/50 cursor-grab hover:bg-muted/10">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-sm leading-tight">{item.title}</CardTitle>
                      <Badge variant="outline" className={
                        item.priority === "Critical" ? "text-rose-500 border-rose-500/20" :
                        item.priority === "High" ? "text-amber-500 border-amber-500/20" :
                        "text-emerald-500 border-emerald-500/20"
                      }>
                        {item.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                          {item.requestor.split(" ").map(n => n[0]).join("")}
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
        ))}
      </div>
    </div>
  );
}

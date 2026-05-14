import { motion } from "framer-motion";
import { assessments } from "@/data/assessments";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Assessments() {
  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assessments</h1>
        <p className="text-muted-foreground mt-1">AI readiness and security posture assessments.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {assessments.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass border-border/50 cursor-pointer hover:bg-muted/10 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <Badge variant="outline" className={
                    a.riskLevel === "Low" ? "text-emerald-500 border-emerald-500/20" :
                    a.riskLevel === "High" ? "text-rose-500 border-rose-500/20" :
                    "text-amber-500 border-amber-500/20"
                  }>
                    {a.riskLevel} Risk
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{a.tenant}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">{a.status}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{a.score}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
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

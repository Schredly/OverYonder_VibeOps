import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

export default function ArchitectureGraph() {
  return (
    <div className="flex h-full flex-col space-y-6 p-8 pb-20">
      <PageHeader
        title="Architecture Graph"
        description="Enterprise AI topology — how models, departments, and applications connect."
        actions={
          <Button variant="outline" size="sm">
            <Maximize2 className="mr-2 h-4 w-4" />
            Expand
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        <svg className="h-full w-full" viewBox="0 0 800 600">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {[
            ["400", "300", "250", "200"],
            ["400", "300", "550", "200"],
            ["400", "300", "400", "450"],
            ["250", "200", "150", "250"],
          ].map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity="0.4"
              strokeWidth="2"
            />
          ))}

          {/* Center: AI model */}
          <g transform="translate(400,300)" className="cursor-pointer">
            <circle r="44" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
            <text y="5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">
              GPT-4
            </text>
          </g>

          {/* Department nodes */}
          {[
            { x: 250, y: 200, label: "Sales" },
            { x: 550, y: 200, label: "Ops" },
          ].map((n) => (
            <g key={n.label} transform={`translate(${n.x},${n.y})`} className="cursor-pointer">
              <rect
                x="-38"
                y="-26"
                width="76"
                height="52"
                rx="10"
                fill="hsl(var(--chart-3) / 0.15)"
                stroke="hsl(var(--chart-3))"
                strokeWidth="2"
              />
              <text y="5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="500">
                {n.label}
              </text>
            </g>
          ))}

          {/* Application nodes */}
          {[
            { x: 400, y: 450, label: "ServiceNow" },
            { x: 150, y: 250, label: "CRM" },
          ].map((n) => (
            <g key={n.label} transform={`translate(${n.x},${n.y})`} className="cursor-pointer">
              <circle r="32" fill="hsl(var(--success) / 0.15)" stroke="hsl(var(--success))" strokeWidth="2" />
              <text y="4" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="500">
                {n.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-6 right-6 flex flex-col gap-2 rounded-lg border border-border bg-white p-4 shadow-sm">
          <div className="mb-1 text-xs font-medium text-foreground">Legend</div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-primary bg-primary/15" />
            <span className="text-xs text-muted-foreground">AI Model</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded border border-blue-500 bg-blue-500/15" />
            <span className="text-xs text-muted-foreground">Department</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-success bg-success/15" />
            <span className="text-xs text-muted-foreground">Application</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

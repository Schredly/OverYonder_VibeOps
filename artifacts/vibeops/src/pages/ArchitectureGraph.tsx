import { motion } from "framer-motion";

export default function ArchitectureGraph() {
  return (
    <div className="space-y-6 pb-20 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Architecture Graph</h1>
        <p className="text-muted-foreground mt-1">Enterprise AI topology and dependencies.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }} 
        className="glass rounded-xl flex-1 relative overflow-hidden bg-background/20"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeOpacity="0.3" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Mock Edges */}
            <line x1="400" y1="300" x2="250" y2="200" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.5" strokeWidth="2" />
            <line x1="400" y1="300" x2="550" y2="200" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.5" strokeWidth="2" />
            <line x1="400" y1="300" x2="400" y2="450" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.5" strokeWidth="2" />
            <line x1="250" y1="200" x2="150" y2="250" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.5" strokeWidth="2" />
            
            {/* Mock Nodes */}
            {/* Center Node - OpenAI */}
            <g transform="translate(400,300)" className="cursor-pointer">
              <circle r="40" fill="hsl(var(--primary)/0.2)" stroke="hsl(var(--primary))" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">GPT-4</text>
            </g>

            {/* Department Nodes */}
            <g transform="translate(250,200)" className="cursor-pointer">
              <rect x="-35" y="-25" width="70" height="50" rx="8" fill="hsl(var(--accent)/0.2)" stroke="hsl(var(--accent))" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">Sales</text>
            </g>
            
            <g transform="translate(550,200)" className="cursor-pointer">
              <rect x="-35" y="-25" width="70" height="50" rx="8" fill="hsl(var(--accent)/0.2)" stroke="hsl(var(--accent))" strokeWidth="2" />
              <text y="5" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">Ops</text>
            </g>

            <g transform="translate(400,450)" className="cursor-pointer">
              <circle r="30" fill="hsl(var(--emerald-500)/0.2)" stroke="hsl(var(--emerald-500))" strokeWidth="2" />
              <text y="4" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">ServiceNow</text>
            </g>

            <g transform="translate(150,250)" className="cursor-pointer">
              <circle r="30" fill="hsl(var(--emerald-500)/0.2)" stroke="hsl(var(--emerald-500))" strokeWidth="2" />
              <text y="4" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">CRM</text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 glass p-4 rounded-lg flex flex-col gap-2">
          <div className="text-xs font-semibold mb-1 text-foreground">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
            <span className="text-xs text-muted-foreground">AI Model</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-accent/20 border border-accent"></div>
            <span className="text-xs text-muted-foreground">Department</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></div>
            <span className="text-xs text-muted-foreground">Application</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import KpiCard from "@/components/dashboard/KpiCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { kpiData } from "@/data/kpiData";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function EnterpriseDashboard() {
  return (
    <div className="space-y-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CIO Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">Enterprise-wide AI transformation metrics and health.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Executive View</Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">System Healthy</Badge>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Cost Savings" value={47.2} prefix="$" suffix="M" trend={12} delay={0.05} />
        <KpiCard title="Weekly Cost Savings" value={1.8} prefix="$" suffix="M" trend={4.2} delay={0.1} />
        <KpiCard title="Hours Automated" value={284000} trend={18} delay={0.15} />
        <KpiCard title="AI Adoption Rate" value={67} suffix="%" trend={8} delay={0.2} />
        
        <KpiCard title="Legacy Apps Retired" value={23} trend={2} delay={0.25} />
        <KpiCard title="Technical Debt Reduction" value={34} suffix="%" trend={5} delay={0.3} />
        <KpiCard title="Security Readiness" value={82} suffix="%" trend={1} trendDirection="up" trendType="good" delay={0.35} />
        <KpiCard title="Governance Score" value={91} suffix="%" trend={0} trendType="neutral" delay={0.4} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        <ChartCard title="Weekly Cost Savings" subtitle="Last 12 weeks trend" className="xl:col-span-2" delay={0.4}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpiData.weeklyCostSavings}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: any) => [`$${value}M`, 'Savings']}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department AI Adoption" subtitle="Percentage by department" delay={0.5}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiData.departmentAdoption} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Workflow Automation Growth" subtitle="Cumulative workflows automated" delay={0.6}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiData.workflowAutomation}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--emerald-500))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--card))", strokeWidth: 2 }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Migration Progress" subtitle="Key initiatives % complete" delay={0.7}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={10} data={kpiData.migrationProgress}>
              <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" animationDuration={1500} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Active Initiatives Mini Table */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="glass rounded-xl p-5 flex-1"
          >
            <h3 className="text-base font-semibold text-foreground mb-4">Active Initiatives</h3>
            <div className="space-y-4">
              {kpiData.activeInitiatives.map((init) => (
                <div key={init.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{init.name}</span>
                    <span className="text-xs text-muted-foreground">{init.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${init.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Model Usage Mini Table */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="glass rounded-xl p-5 flex-1"
          >
            <h3 className="text-base font-semibold text-foreground mb-4">Model Spend (MTD)</h3>
            <div className="space-y-3">
              {kpiData.modelUsage.map((model, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm text-foreground">{model.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground">{model.spend}</span>
                    <span className={cn("text-xs", model.trend.startsWith('+') ? "text-amber-500" : "text-emerald-500")}>
                      {model.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Inbox,
  ClipboardCheck,
  GitMerge,
  Kanban,
  TrendingUp,
  Shield,
  Radio,
  AppWindow,
  Eye,
  ArrowRightLeft,
  Scale,
  Network,
  Users,
  Users2,
  BarChart3,
  Settings,
  Handshake,
  Truck,
  DollarSign,
  PieChart,
  Clock,
  FileText,
  CheckSquare,
  Heart,
  Cpu,
  AlertTriangle,
  BarChart2,
  Building2,
  Target,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const enterpriseSections: NavSection[] = [
  {
    label: "Executive",
    items: [
      { name: "CIO Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Executive Review Board", path: "/executive-review", icon: Users },
    ],
  },
  {
    label: "Portfolio & Intake",
    items: [
      { name: "AI Portfolio", path: "/portfolio", icon: Briefcase },
      { name: "Intake Center", path: "/intake", icon: Inbox },
      { name: "Assessments", path: "/assessments", icon: ClipboardCheck },
      { name: "Approval Workflows", path: "/approvals", icon: GitMerge },
    ],
  },
  {
    label: "Work Management",
    items: [
      { name: "Task Management", path: "/tasks", icon: Kanban },
      { name: "AI Adoption Center", path: "/adoption", icon: TrendingUp },
      { name: "Resource Management", path: "/resources", icon: Users2 },
    ],
  },
  {
    label: "AI & Security",
    items: [
      { name: "AI Control Tower", path: "/control-tower", icon: Radio },
      { name: "Security Assessments", path: "/security", icon: Shield },
      { name: "Shadow AI Discovery", path: "/shadow-ai", icon: Eye },
      { name: "Governance", path: "/governance", icon: Scale },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Applications", path: "/applications", icon: AppWindow },
      { name: "Architecture Graph", path: "/architecture", icon: Network },
      { name: "Migrations", path: "/migrations", icon: ArrowRightLeft },
      { name: "Forecasting", path: "/forecasting", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Admin", path: "/admin", icon: Settings },
    ],
  },
];

const consultingSections: NavSection[] = [
  {
    label: "Executive",
    items: [
      { name: "Services CEO Dashboard", path: "/consulting/dashboard", icon: LayoutDashboard },
      { name: "Executive Reporting", path: "/consulting/reporting", icon: BarChart2 },
    ],
  },
  {
    label: "Client Management",
    items: [
      { name: "Client Portfolio", path: "/consulting/clients", icon: Briefcase },
      { name: "Consulting Engagements", path: "/consulting/engagements", icon: Handshake },
      { name: "Proposal Pipeline", path: "/consulting/proposals", icon: FileText },
      { name: "Customer Health", path: "/consulting/health", icon: Heart },
    ],
  },
  {
    label: "Delivery",
    items: [
      { name: "Delivery Operations", path: "/consulting/delivery", icon: Truck },
      { name: "Task Delivery", path: "/consulting/tasks", icon: CheckSquare },
      { name: "AI Transformation Programs", path: "/consulting/programs", icon: Cpu },
      { name: "Delivery Risks", path: "/consulting/risks", icon: AlertTriangle },
    ],
  },
  {
    label: "Revenue & Resources",
    items: [
      { name: "Revenue Operations", path: "/consulting/revenue", icon: DollarSign },
      { name: "Resource Utilization", path: "/consulting/utilization", icon: PieChart },
      { name: "Billable Utilization", path: "/consulting/billable", icon: Clock },
      { name: "Consultant Capacity", path: "/consulting/capacity", icon: Users },
      { name: "Forecasting", path: "/consulting/forecasting", icon: TrendingUp },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Admin", path: "/consulting/admin", icon: Settings },
    ],
  },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link href={item.path} className="block" data-testid={`nav-link-${item.path.replace(/\//g, "-")}`}>
      <div
        className={cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
        )}
        <item.icon
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
          )}
        />
        <span className="truncate">{item.name}</span>
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const { activeView, setActiveView } = useAppContext();
  const [location] = useLocation();

  const sections = activeView === "enterprise" ? enterpriseSections : consultingSections;

  const isActive = (path: string) =>
    location === path || (location === "/" && path === "/dashboard");

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border/30 bg-sidebar/60 backdrop-blur-sm">
      {/* View Switcher */}
      <div className="flex-shrink-0 p-3 border-b border-border/30">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1">
          Operating Mode
        </p>
        <div className="relative flex rounded-lg bg-background/40 p-0.5 border border-border/40">
          <motion.span
            className="absolute top-0.5 bottom-0.5 rounded-md bg-primary/20 border border-primary/30"
            animate={{
              left: activeView === "enterprise" ? "2px" : "50%",
              width: "calc(50% - 2px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          <button
            data-testid="view-switcher-enterprise"
            onClick={() => setActiveView("enterprise")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              activeView === "enterprise" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-3 w-3" />
            Enterprise
          </button>
          <button
            data-testid="view-switcher-consulting"
            onClick={() => setActiveView("consulting")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              activeView === "consulting" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className="h-3 w-3" />
            Consulting
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-0.5"
          >
            {sections.map((section) => (
              <div key={section.label} className="mb-1">
                <p className="px-2.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 select-none">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink key={item.path} item={item} isActive={isActive(item.path)} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </nav>
    </aside>
  );
}

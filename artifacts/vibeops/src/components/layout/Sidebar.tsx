import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardCheck,
  TrendingUp,
  AppWindow,
  ArrowRightLeft,
  Users,
  Users2,
  Settings,
  DollarSign,
  Clock,
  CheckSquare,
  AlertTriangle,
  BarChart2,
  Building2,
  Target,
  Layers,
  Cpu,
  BadgeCheck,
  RefreshCw,
  ListChecks,
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
    items: [{ name: "Executive Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Portfolio & Architecture",
    items: [
      { name: "Application Portfolio", path: "/applications", icon: AppWindow },
      { name: "Capability Map", path: "/capabilities", icon: Layers },
      { name: "Technology Portfolio", path: "/technology", icon: Cpu },
    ],
  },
  {
    label: "Modernization & Delivery",
    items: [
      { name: "Modernization Projects", path: "/projects", icon: TrendingUp },
      { name: "Migration Waves", path: "/migrations", icon: ArrowRightLeft },
      { name: "Task Management", path: "/tasks", icon: ListChecks },
      { name: "Certification Center", path: "/certifications", icon: BadgeCheck },
    ],
  },
  {
    label: "Governance",
    items: [
      { name: "Assessments", path: "/assessments", icon: ClipboardCheck },
      { name: "Risks & Decisions", path: "/risks", icon: AlertTriangle },
    ],
  },
  {
    label: "Collaboration",
    items: [{ name: "Consultant Workspace", path: "/consultant-workspace", icon: Users2 }],
  },
  {
    label: "Platform",
    items: [
      { name: "ServiceNow Sync", path: "/servicenow", icon: RefreshCw },
      { name: "Admin", path: "/admin", icon: Settings },
    ],
  },
];

const consultingSections: NavSection[] = [
  {
    label: "Executive",
    items: [
      { name: "Services CEO Dashboard", path: "/consulting/dashboard", icon: LayoutDashboard },
      { name: "Reporting", path: "/consulting/reporting", icon: BarChart2 },
    ],
  },
  {
    label: "Clients & Delivery",
    items: [
      { name: "Clients", path: "/consulting/clients", icon: Building2 },
      { name: "Engagements", path: "/consulting/engagements", icon: Briefcase },
      { name: "Delivery", path: "/consulting/delivery", icon: Target },
      { name: "Tasks", path: "/consulting/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Time & Billing",
    items: [
      { name: "Consultant Time", path: "/consulting/time", icon: Clock },
      { name: "Billing", path: "/consulting/billing", icon: DollarSign },
    ],
  },
  {
    label: "Workforce & Risk",
    items: [
      { name: "Utilization", path: "/consulting/utilization", icon: TrendingUp },
      { name: "Capacity", path: "/consulting/capacity", icon: Users },
      { name: "Risks", path: "/consulting/risks", icon: AlertTriangle },
    ],
  },
  {
    label: "Administration",
    items: [{ name: "Admin", path: "/consulting/admin", icon: Settings }],
  },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link href={item.path} className="block" data-testid={`nav-link-${item.path.replace(/\//g, "-")}`}>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
        <span className="truncate">{item.name}</span>
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const { activeView, setActiveView } = useAppContext();
  const [location, navigate] = useLocation();

  const sections = activeView === "enterprise" ? enterpriseSections : consultingSections;

  const isActive = (path: string) =>
    location === path || (location === "/" && path === "/dashboard");

  const switchMode = (mode: "enterprise" | "consulting") => {
    setActiveView(mode);
    navigate(mode === "enterprise" ? "/dashboard" : "/consulting/dashboard");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Operating Mode toggle (also present in TopNav — duplicated for muscle memory). */}
      <div className="flex-shrink-0 border-b border-sidebar-border p-4">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Operating Mode
        </p>
        <div className="relative flex rounded-lg border border-border bg-white p-0.5">
          <motion.span
            className="absolute top-0.5 bottom-0.5 rounded-md bg-primary/10 ring-1 ring-primary/30"
            animate={{
              left: activeView === "enterprise" ? "2px" : "50%",
              width: "calc(50% - 2px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          <button
            data-testid="view-switcher-enterprise"
            onClick={() => switchMode("enterprise")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              activeView === "enterprise" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="h-3 w-3" />
            Enterprise
          </button>
          <button
            data-testid="view-switcher-consulting"
            onClick={() => switchMode("consulting")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              activeView === "consulting" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className="h-3 w-3" />
            Consulting
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {sections.map((section) => (
              <div key={section.label}>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </h3>
                <div className="space-y-1">
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

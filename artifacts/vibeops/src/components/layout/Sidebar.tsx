import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
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
  BarChart2
} from "lucide-react";

export default function Sidebar() {
  const { activeView } = useAppContext();
  const [location] = useLocation();

  const enterpriseItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "Intake", path: "/intake", icon: Inbox },
    { name: "Assessments", path: "/assessments", icon: ClipboardCheck },
    { name: "Approvals", path: "/approvals", icon: GitMerge },
    { name: "Tasks", path: "/tasks", icon: Kanban },
    { name: "Adoption", path: "/adoption", icon: TrendingUp },
    { name: "Security", path: "/security", icon: Shield },
    { name: "Control Tower", path: "/control-tower", icon: Radio },
    { name: "Applications", path: "/applications", icon: AppWindow },
    { name: "Shadow AI", path: "/shadow-ai", icon: Eye },
    { name: "Migrations", path: "/migrations", icon: ArrowRightLeft },
    { name: "Governance", path: "/governance", icon: Scale },
    { name: "Architecture", path: "/architecture", icon: Network },
    { name: "Executive Review", path: "/executive-review", icon: Users },
    { name: "Resources", path: "/resources", icon: Users2 },
    { name: "Forecasting", path: "/forecasting", icon: BarChart3 },
    { name: "Admin", path: "/admin", icon: Settings },
  ];

  const consultingItems = [
    { name: "Services Dashboard", path: "/consulting/dashboard", icon: LayoutDashboard },
    { name: "Client Portfolio", path: "/consulting/clients", icon: Briefcase },
    { name: "Engagements", path: "/consulting/engagements", icon: Handshake },
    { name: "Delivery Ops", path: "/consulting/delivery", icon: Truck },
    { name: "Revenue Ops", path: "/consulting/revenue", icon: DollarSign },
    { name: "Resource Util", path: "/consulting/utilization", icon: PieChart },
    { name: "Billable Util", path: "/consulting/billable", icon: Clock },
    { name: "Proposals", path: "/consulting/proposals", icon: FileText },
    { name: "Task Delivery", path: "/consulting/tasks", icon: CheckSquare },
    { name: "Customer Health", path: "/consulting/health", icon: Heart },
    { name: "AI Programs", path: "/consulting/programs", icon: Cpu },
    { name: "Delivery Risks", path: "/consulting/risks", icon: AlertTriangle },
    { name: "Forecasting", path: "/consulting/forecasting", icon: TrendingUp },
    { name: "Capacity", path: "/consulting/capacity", icon: Users },
    { name: "Exec Reporting", path: "/consulting/reporting", icon: BarChart2 },
    { name: "Admin", path: "/consulting/admin", icon: Settings },
  ];

  const items = activeView === "enterprise" ? enterpriseItems : consultingItems;

  return (
    <aside className="flex h-full w-64 flex-col overflow-y-auto border-r border-border/40 glass bg-sidebar/50">
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <Link key={item.path} href={item.path} className="block">
            <div
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location === item.path || (location === "/" && item.path === "/dashboard")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  location === item.path || (location === "/" && item.path === "/dashboard")
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

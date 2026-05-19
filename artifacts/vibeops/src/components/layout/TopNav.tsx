import { useState } from "react";
import { useLocation } from "wouter";
import { useAppContext } from "@/context/AppContext";
import { mockRoles } from "@/data/roles";
import type { TenantEnvironment } from "@/data/tenants";
import { cn } from "@/lib/utils";
import { Search, Bell, ChevronDown, Sparkles } from "lucide-react";
import GlobalCommandPalette from "@/components/search/GlobalCommandPalette";
import TenantSwitcher from "@/components/layout/TenantSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const environmentBadge: Record<TenantEnvironment, string> = {
  Production: "bg-success/10 text-success",
  Staging: "bg-amber-500/10 text-amber-600",
  Sandbox: "bg-blue-500/10 text-blue-600",
};

export default function TopNav() {
  const { activeView, setActiveView, activeTenant, activeRole, setActiveRole } = useAppContext();
  const [, navigate] = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const switchMode = (mode: "enterprise" | "consulting") => {
    setActiveView(mode);
    navigate(mode === "enterprise" ? "/dashboard" : "/consulting/dashboard");
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-white px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-semibold text-primary-foreground">VO</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">VibeOps</div>
            <div className="text-[11px] text-muted-foreground">Application Portfolio &amp; Modernization OS</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open global search"
          className="relative hidden w-80 items-center rounded-lg border border-transparent bg-muted py-2 pl-10 pr-3 text-sm text-muted-foreground transition-colors hover:bg-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:flex"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span>Search platform...</span>
          <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <TenantSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary md:flex">
              <span>{activeRole}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockRoles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn(activeRole === role && "font-medium text-primary")}
              >
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className={cn(
            "hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide md:inline-flex",
            environmentBadge[activeTenant.environment],
          )}
        >
          {activeTenant.environment}
        </span>

        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button
            data-testid="topnav-mode-enterprise"
            onClick={() => switchMode("enterprise")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeView === "enterprise"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Internal Enterprise
          </button>
          <button
            data-testid="topnav-mode-consulting"
            onClick={() => switchMode("consulting")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeView === "consulting"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Consulting Services
          </button>
        </div>

        <button
          aria-label="AI insights"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            JS
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <GlobalCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}

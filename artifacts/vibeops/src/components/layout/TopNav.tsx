import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Search, Bell, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopNav() {
  const { activeView, setActiveView, activeTenant, activeRole } = useAppContext();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 glass px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">
            VO
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none tracking-tight text-foreground">VibeOps</span>
            <span className="text-[10px] leading-none text-muted-foreground">by OverYonder</span>
          </div>
        </div>
        
        <div className="relative hidden w-64 md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search platform... (Cmd+K)"
            className="h-9 w-full rounded-md border border-border/50 bg-background/50 pl-9 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 md:flex cursor-pointer hover:bg-background/50 transition-colors">
          <span className="text-xs font-medium text-foreground">{activeTenant.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/50 bg-background/30 px-3 py-1.5 md:flex cursor-pointer hover:bg-background/50 transition-colors">
          <span className="text-xs font-medium text-foreground">{activeRole}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>

        <div className="flex h-6 items-center rounded-full bg-amber-500/10 px-2.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20">
          PRODUCTION
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/30 p-1 cursor-pointer hover:bg-background/50 transition-colors">
          <button
            onClick={() => setActiveView("enterprise")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-all",
              activeView === "enterprise" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Internal Enterprise
          </button>
          <button
            onClick={() => setActiveView("consulting")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-all",
              activeView === "consulting" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Consulting Services
          </button>
        </div>

        <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full border-primary/30 text-primary hover:bg-primary/10">
          <Sparkles className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-destructive"></span>
        </Button>
        
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground cursor-pointer">
          JS
        </div>
      </div>
    </header>
  );
}

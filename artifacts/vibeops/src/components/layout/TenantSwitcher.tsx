/**
 * TenantSwitcher — the multi-tenant control-plane selector.
 *
 * Lives in the top nav. Switching tenants updates the active operating
 * context everywhere (dashboards, KPIs, lists, search) via AppContext and the
 * tenant-aware data layer. Opening the dropdown reveals a per-tenant overview
 * panel; the selection is persisted across sessions.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { tenants, tenantHealthTone, type Tenant, type TenantHealth } from "@/data/tenants";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const healthDot: Record<TenantHealth, string> = {
  Healthy: "bg-success",
  Watch: "bg-blue-500",
  "At Risk": "bg-amber-500",
  Critical: "bg-destructive",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="text-lg font-semibold leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

/** The operational overview shown for the hovered / active tenant. */
function TenantOverviewPanel({ tenant }: { tenant: Tenant }) {
  return (
    <div className="flex-1 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-primary-foreground">
          {tenant.shortName}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{tenant.name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{tenant.type}</div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{tenant.summary}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Applications" value={tenant.stats.applications} />
        <Stat label="Engagements" value={tenant.stats.engagements} />
        <Stat label="Open Risks" value={tenant.stats.risks} />
        <Stat label="Consultants" value={tenant.stats.consultants} />
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border pt-3">
        <MetaRow label="AI Maturity" value={tenant.aiMaturity} />
        <MetaRow label="Operational Posture" value={tenant.operationalPosture} />
        <MetaRow label="Region" value={tenant.region} />
        <MetaRow label="Environment" value={tenant.environment} />
      </div>
    </div>
  );
}

export default function TenantSwitcher() {
  const { activeTenant, lastTenant, setActiveTenant } = useAppContext();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Tenant | null>(null);

  const panelTenant = hovered ?? activeTenant;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setHovered(null);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          data-testid="tenant-switcher"
          className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary md:flex"
        >
          <span className={cn("h-2 w-2 rounded-full", healthDot[activeTenant.health])} />
          <span className="max-w-[180px] truncate">{activeTenant.name}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[480px] overflow-hidden p-0">
        <div className="flex">
          {/* Tenant list */}
          <div className="w-[268px] shrink-0 border-r border-border py-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tenants
            </div>
            {tenants.map((tenant) => {
              const active = tenant.id === activeTenant.id;
              return (
                <DropdownMenuItem
                  key={tenant.id}
                  onSelect={() => setActiveTenant(tenant)}
                  onMouseEnter={() => setHovered(tenant)}
                  onFocus={() => setHovered(tenant)}
                  className={cn(
                    "mx-1 cursor-pointer rounded-md px-2 py-2",
                    active && "bg-muted",
                  )}
                >
                  <div className="flex w-full items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {tenant.shortName}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {tenant.name}
                        </span>
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", healthDot[tenant.health])}
                        />
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {tenant.industry} · {tenant.type}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                          {tenant.environment}
                        </span>
                        <StatusBadge
                          label={tenant.health}
                          tone={tenantHealthTone[tenant.health]}
                          className="px-1.5 py-0 text-[9px]"
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}

            {lastTenant && lastTenant.id !== activeTenant.id && (
              <DropdownMenuItem
                onSelect={() => setActiveTenant(lastTenant)}
                onMouseEnter={() => setHovered(lastTenant)}
                onFocus={() => setHovered(lastTenant)}
                className="mx-1 mt-1 cursor-pointer rounded-md border-t border-border px-2 py-2 text-[11px] text-muted-foreground"
              >
                Switch back to <span className="font-medium text-foreground">{lastTenant.shortName}</span>
              </DropdownMenuItem>
            )}
          </div>

          {/* Overview panel */}
          <TenantOverviewPanel tenant={panelTenant} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

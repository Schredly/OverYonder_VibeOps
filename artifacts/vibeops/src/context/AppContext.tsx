import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { tenants, findTenant, type Tenant } from "../data/tenants";
import { mockRoles } from "../data/roles";
import {
  loadActiveTenantId,
  loadLastTenantId,
  loadPreferredMode,
  persistActiveTenant,
  persistPreferredMode,
} from "../lib/tenantStore";

type OperatingMode = "enterprise" | "consulting";

interface AppContextType {
  activeView: OperatingMode;
  activeTenant: Tenant;
  /** The previously active tenant — powers "switch back". */
  lastTenant: Tenant | null;
  activeRole: string;
  setActiveView: (view: OperatingMode) => void;
  setActiveTenant: (tenant: Tenant) => void;
  setActiveRole: (role: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  // Hydrate the control-plane session from localStorage.
  const [activeView, setActiveViewState] = useState<OperatingMode>(
    () => loadPreferredMode() ?? "enterprise",
  );
  const [activeTenant, setActiveTenantState] = useState<Tenant>(
    () => findTenant(loadActiveTenantId() ?? "") ?? tenants[0],
  );
  const [lastTenant, setLastTenant] = useState<Tenant | null>(
    () => findTenant(loadLastTenantId() ?? "") ?? null,
  );
  const [activeRole, setActiveRole] = useState<string>(mockRoles[0]);

  const setActiveView = useCallback((view: OperatingMode) => {
    setActiveViewState(view);
    persistPreferredMode(view);
  }, []);

  const setActiveTenant = useCallback((tenant: Tenant) => {
    setActiveTenantState((current) => {
      if (current.id !== tenant.id) {
        setLastTenant(current);
        persistActiveTenant(tenant.id, current.id);
      }
      return tenant;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeView,
        activeTenant,
        lastTenant,
        activeRole,
        setActiveView,
        setActiveTenant,
        setActiveRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}

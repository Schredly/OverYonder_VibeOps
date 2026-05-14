import { createContext, useContext, useState, ReactNode } from "react";
import { tenants, type Tenant } from "../data/tenants";
import { mockRoles } from "../data/roles";

interface AppContextType {
  activeView: "enterprise" | "consulting";
  activeTenant: Tenant;
  activeRole: string;
  setActiveView: (view: "enterprise" | "consulting") => void;
  setActiveTenant: (tenant: Tenant) => void;
  setActiveRole: (role: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<"enterprise" | "consulting">("enterprise");
  const [activeTenant, setActiveTenant] = useState<Tenant>(tenants[0]);
  const [activeRole, setActiveRole] = useState<string>(mockRoles[0]);

  return (
    <AppContext.Provider
      value={{
        activeView,
        activeTenant,
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

import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import { useAppContext } from "@/context/AppContext";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Keeps the operating mode in sync with the current URL: anything under
 * `/consulting/*` forces the consulting sidebar/dashboards; everything else is
 * treated as enterprise. This means deep links and back/forward stay coherent
 * with the visible nav, while still letting the user toggle freely.
 */
function useUrlSyncedMode() {
  const [location] = useLocation();
  const { activeView, setActiveView } = useAppContext();
  useEffect(() => {
    const inferred = location.startsWith("/consulting") ? "consulting" : "enterprise";
    if (inferred !== activeView) setActiveView(inferred);
  }, [location, activeView, setActiveView]);
}

export default function AppShell({ children }: AppShellProps) {
  useUrlSyncedMode();
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

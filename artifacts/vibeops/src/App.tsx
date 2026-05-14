import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import AppShell from "@/components/layout/AppShell";
import NotFound from "@/pages/not-found";

import EnterpriseDashboard from "@/pages/EnterpriseDashboard";
import Portfolio from "@/pages/Portfolio";
import Intake from "@/pages/Intake";
import Assessments from "@/pages/Assessments";
import Approvals from "@/pages/Approvals";
import ArchitectureGraph from "@/pages/ArchitectureGraph";
import ConsultingDashboard from "@/pages/ConsultingDashboard";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <div className="glass rounded-xl p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Module in development...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={EnterpriseDashboard} />
      <Route path="/dashboard" component={EnterpriseDashboard} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/intake" component={Intake} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/approvals" component={Approvals} />
      <Route path="/architecture" component={ArchitectureGraph} />
      
      <Route path="/tasks"><PlaceholderPage title="Task Management" /></Route>
      <Route path="/adoption"><PlaceholderPage title="AI Adoption Center" /></Route>
      <Route path="/security"><PlaceholderPage title="Security Assessments" /></Route>
      <Route path="/control-tower"><PlaceholderPage title="AI Control Tower" /></Route>
      <Route path="/applications"><PlaceholderPage title="Application Inventory" /></Route>
      <Route path="/shadow-ai"><PlaceholderPage title="Shadow AI Discovery" /></Route>
      <Route path="/migrations"><PlaceholderPage title="Migrations" /></Route>
      <Route path="/governance"><PlaceholderPage title="Governance" /></Route>
      <Route path="/executive-review"><PlaceholderPage title="Executive Review Board" /></Route>
      <Route path="/resources"><PlaceholderPage title="Resource Management" /></Route>
      <Route path="/forecasting"><PlaceholderPage title="Forecasting" /></Route>
      <Route path="/admin"><PlaceholderPage title="Administration" /></Route>

      <Route path="/consulting/dashboard" component={ConsultingDashboard} />
      <Route path="/consulting/clients"><PlaceholderPage title="Client Portfolio" /></Route>
      <Route path="/consulting/engagements"><PlaceholderPage title="Consulting Engagements" /></Route>
      <Route path="/consulting/delivery"><PlaceholderPage title="Delivery Operations" /></Route>
      <Route path="/consulting/revenue"><PlaceholderPage title="Revenue Operations" /></Route>
      <Route path="/consulting/utilization"><PlaceholderPage title="Resource Utilization" /></Route>
      <Route path="/consulting/billable"><PlaceholderPage title="Billable Utilization" /></Route>
      <Route path="/consulting/proposals"><PlaceholderPage title="Proposal Pipeline" /></Route>
      <Route path="/consulting/tasks"><PlaceholderPage title="Task Delivery" /></Route>
      <Route path="/consulting/health"><PlaceholderPage title="Customer Health" /></Route>
      <Route path="/consulting/programs"><PlaceholderPage title="AI Transformation Programs" /></Route>
      <Route path="/consulting/risks"><PlaceholderPage title="Delivery Risks" /></Route>
      <Route path="/consulting/forecasting"><PlaceholderPage title="Forecasting" /></Route>
      <Route path="/consulting/capacity"><PlaceholderPage title="Consultant Capacity" /></Route>
      <Route path="/consulting/reporting"><PlaceholderPage title="Executive Reporting" /></Route>
      <Route path="/consulting/admin"><PlaceholderPage title="Settings" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContextProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell>
              <Router />
            </AppShell>
          </WouterRouter>
        </AppContextProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

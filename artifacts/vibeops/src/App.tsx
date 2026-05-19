import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import { ConsultingDataProvider } from "@/context/ConsultingDataContext";
import { ApmDataProvider } from "@/context/ApmDataContext";
import AppShell from "@/components/layout/AppShell";
import NotFound from "@/pages/not-found";
import ModulePlaceholder from "@/pages/ModulePlaceholder";

// Enterprise — APM Lite + EA
import EnterpriseDashboard from "@/pages/EnterpriseDashboard";
import ApplicationPortfolio from "@/pages/apm/ApplicationPortfolio";
import ApplicationDetail from "@/pages/apm/ApplicationDetail";
import CapabilityMap from "@/pages/apm/CapabilityMap";
import TechnologyPortfolio from "@/pages/apm/TechnologyPortfolio";
import ModernizationProjects from "@/pages/apm/ModernizationProjects";
import ProjectDetail from "@/pages/apm/ProjectDetail";
import MigrationWaves from "@/pages/apm/MigrationWaves";
import CertificationCenter from "@/pages/apm/CertificationCenter";
import RisksDecisions from "@/pages/apm/RisksDecisions";
import Tasks from "@/pages/apm/Tasks";
import ConsultantWorkspace from "@/pages/apm/ConsultantWorkspace";
import ServiceNowSync from "@/pages/apm/ServiceNowSync";
import Admin from "@/pages/apm/Admin";
import Assessments from "@/pages/Assessments";

// Consulting
import ConsultingDashboard from "@/pages/ConsultingDashboard";
import ClientPortfolio from "@/pages/consulting/ClientPortfolio";
import ClientDetail from "@/pages/consulting/ClientDetail";
import Engagements from "@/pages/consulting/Engagements";
import EngagementDetail from "@/pages/consulting/EngagementDetail";
import ProposalPipeline from "@/pages/consulting/ProposalPipeline";
import CustomerHealth from "@/pages/consulting/CustomerHealth";
import DeliveryOperations from "@/pages/consulting/DeliveryOperations";
import TaskDelivery from "@/pages/consulting/TaskDelivery";
import AITransformationPrograms from "@/pages/consulting/AITransformationPrograms";
import DeliveryRisksPage from "@/pages/consulting/DeliveryRisks";
import RevenueOperations from "@/pages/consulting/RevenueOperations";
import ResourceUtilization from "@/pages/consulting/ResourceUtilization";
import BillableUtilization from "@/pages/consulting/BillableUtilization";
import ConsultantCapacity from "@/pages/consulting/ConsultantCapacity";
import ConsultingForecasting from "@/pages/consulting/ConsultingForecasting";
import ExecutiveReporting from "@/pages/consulting/ExecutiveReporting";
import ConsultantTime from "@/pages/consulting/ConsultantTime";
import Billing from "@/pages/consulting/Billing";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Enterprise — Application Portfolio & Modernization */}
      <Route path="/" component={EnterpriseDashboard} />
      <Route path="/dashboard" component={EnterpriseDashboard} />
      <Route path="/applications" component={ApplicationPortfolio} />
      <Route path="/applications/:id" component={ApplicationDetail} />
      <Route path="/capabilities" component={CapabilityMap} />
      <Route path="/technology" component={TechnologyPortfolio} />
      <Route path="/projects" component={ModernizationProjects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/migrations" component={MigrationWaves} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/certifications" component={CertificationCenter} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/risks" component={RisksDecisions} />
      <Route path="/consultant-workspace" component={ConsultantWorkspace} />
      <Route path="/servicenow" component={ServiceNowSync} />
      <Route path="/admin" component={Admin} />

      {/* Consulting Services */}
      <Route path="/consulting/dashboard" component={ConsultingDashboard} />
      <Route path="/consulting/clients" component={ClientPortfolio} />
      <Route path="/consulting/clients/:id" component={ClientDetail} />
      <Route path="/consulting/engagements" component={Engagements} />
      <Route path="/consulting/engagements/:id" component={EngagementDetail} />
      <Route path="/consulting/delivery" component={DeliveryOperations} />
      <Route path="/consulting/tasks" component={TaskDelivery} />
      <Route path="/consulting/time" component={ConsultantTime} />
      <Route path="/consulting/billing" component={Billing} />
      <Route path="/consulting/utilization" component={ResourceUtilization} />
      <Route path="/consulting/capacity" component={ConsultantCapacity} />
      <Route path="/consulting/risks" component={DeliveryRisksPage} />
      <Route path="/consulting/reporting" component={ExecutiveReporting} />
      {/* Reachable but not in primary nav */}
      <Route path="/consulting/proposals" component={ProposalPipeline} />
      <Route path="/consulting/health" component={CustomerHealth} />
      <Route path="/consulting/programs" component={AITransformationPrograms} />
      <Route path="/consulting/revenue" component={RevenueOperations} />
      <Route path="/consulting/billable" component={BillableUtilization} />
      <Route path="/consulting/forecasting" component={ConsultingForecasting} />
      <Route path="/consulting/admin"><ModulePlaceholder title="Consulting Settings" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContextProvider>
          <ApmDataProvider>
            <ConsultingDataProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppShell>
                  <Router />
                </AppShell>
              </WouterRouter>
            </ConsultingDataProvider>
          </ApmDataProvider>
        </AppContextProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

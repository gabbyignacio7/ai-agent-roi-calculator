import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortfolioProvider } from "@/context/PortfolioContext";
import Home from "@/pages/Home";
import FamilyPage from "@/pages/FamilyPage";
import CalculatorPage from "@/pages/CalculatorPage";
import EmbedPage from "@/pages/EmbedPage";
import PortfolioSelectionPage from "@/pages/PortfolioSelectionPage";
import PortfolioResultsPage from "@/pages/PortfolioResultsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/family/:familySlug" component={FamilyPage} />
      <Route path="/calculator/:familySlug/:agentSlug" component={CalculatorPage} />
      <Route path="/embed/:familySlug/:agentSlug" component={EmbedPage} />
      <Route path="/portfolio" component={PortfolioSelectionPage} />
      <Route path="/portfolio/results" component={PortfolioResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
      <WouterRouter hook={useHashLocation}>
        <TooltipProvider>
          <PortfolioProvider>
            <Toaster />
            <Router />
          </PortfolioProvider>
        </TooltipProvider>
      </WouterRouter>
  );
}

export default App;

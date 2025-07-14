import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Sidebar from "./components/layout/sidebar";
import Header from "./components/layout/header";
import Dashboard from "./pages/dashboard";
import Leads from "./pages/leads";
import Generator from "./pages/generator";
import Payments from "./pages/payments";
import ClientPortal from "./pages/client-portal";
import NotFound from "./pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-x-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AppLayout><Dashboard /></AppLayout>} />
      <Route path="/leads" component={() => <AppLayout><Leads /></AppLayout>} />
      <Route path="/generator" component={() => <AppLayout><Generator /></AppLayout>} />
      <Route path="/payments" component={() => <AppLayout><Payments /></AppLayout>} />
      <Route path="/client/:id" component={ClientPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<div className="p-8"><h1 className="text-3xl font-bold">Mitarbeiter</h1></div>} />
            <Route path="/fleet" element={<div className="p-8"><h1 className="text-3xl font-bold">Fuhrpark</h1></div>} />
            <Route path="/shifts" element={<div className="p-8"><h1 className="text-3xl font-bold">Schichtplanung</h1></div>} />
            <Route path="/scorecard" element={<div className="p-8"><h1 className="text-3xl font-bold">Scorecard</h1></div>} />
            <Route path="/finance" element={<div className="p-8"><h1 className="text-3xl font-bold">Finanzen</h1></div>} />
            <Route path="/settings" element={<div className="p-8"><h1 className="text-3xl font-bold">Einstellungen</h1></div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

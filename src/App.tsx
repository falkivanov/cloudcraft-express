
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FileUploadPage from "./pages/FileUploadPage";
import EmployeesPage from "./pages/EmployeesPage";
import FleetPage from "./pages/FleetPage";
import QualityPage from "./pages/QualityPage";
import ShiftPlanningPage from "./pages/ShiftPlanningPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/file-upload" element={<FileUploadPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/fleet" element={<FleetPage />} />
              
              {/* Qualitäts-Routen */}
              <Route path="/quality" element={<Navigate to="/quality/scorecard" replace />} />
              <Route path="/quality/scorecard" element={<QualityPage />} />
              <Route path="/quality/customer-contact" element={<QualityPage />} />
              <Route path="/quality/concessions" element={<QualityPage />} />
              <Route path="/quality/mentor" element={<QualityPage />} />
              
              {/* Schichtplanungs-Route */}
              <Route path="/shifts" element={<ShiftPlanningPage />} />
              
              {/* Redirect von der alten Scorecard-Route zur neuen Qualitätsseite */}
              <Route path="/scorecard" element={<Navigate to="/quality/scorecard" replace />} />
              
              {/* Einstellungs-Route */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

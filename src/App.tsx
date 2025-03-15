
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FileUploadPage from "./pages/FileUploadPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering - DEBUG");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/dashboard/file-upload" element={<FileUploadPage />} />
                  <Route path="/dashboard/employees" element={<EmployeesPage />} />
                  <Route path="/dashboard/fleet" element={<div className="p-8"><h1 className="text-3xl font-bold">Fuhrpark</h1></div>} />
                  <Route path="/dashboard/shifts" element={<div className="p-8"><h1 className="text-3xl font-bold">Schichtplanung</h1></div>} />
                  <Route path="/dashboard/scorecard" element={<div className="p-8"><h1 className="text-3xl font-bold">Scorecard</h1></div>} />
                  <Route path="/dashboard/finance" element={<div className="p-8"><h1 className="text-3xl font-bold">Finanzen</h1></div>} />
                  <Route path="/dashboard/settings" element={<div className="p-8"><h1 className="text-3xl font-bold">Einstellungen</h1></div>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

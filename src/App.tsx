
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import FileUploadPage from "./pages/FileUploadPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotFound from "./pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/file-upload" element={<FileUploadPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/fleet" element={<div className="p-8"><h1 className="text-3xl font-bold">Fuhrpark</h1></div>} />
                <Route path="/shifts" element={<div className="p-8"><h1 className="text-3xl font-bold">Schichtplanung</h1></div>} />
                <Route path="/scorecard" element={<div className="p-8"><h1 className="text-3xl font-bold">Scorecard</h1></div>} />
                <Route path="/finance" element={<div className="p-8"><h1 className="text-3xl font-bold">Finanzen</h1></div>} />
                <Route path="/settings" element={<div className="p-8"><h1 className="text-3xl font-bold">Einstellungen</h1></div>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

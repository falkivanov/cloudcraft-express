
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";
import { exportEmployeesToCSV } from "@/utils/employeeCSVUtils";
import { Download, Users, UserCheck, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeExportProps {
  employees: Employee[];
}

const EmployeeExport: React.FC<EmployeeExportProps> = ({ employees }) => {
  const { toast } = useToast();

  const handleExportAll = () => {
    if (employees.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine Mitarbeiterdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportEmployeesToCSV(employees, `mitarbeiter_alle_${new Date().toISOString().slice(0, 10)}`);
      toast({
        title: "Export erfolgreich",
        description: `${employees.length} Mitarbeiter wurden erfolgreich exportiert.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleExportActive = () => {
    const activeEmployees = employees.filter(employee => employee.endDate === null);
    
    if (activeEmployees.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine aktiven Mitarbeiterdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportEmployeesToCSV(activeEmployees, `mitarbeiter_aktiv_${new Date().toISOString().slice(0, 10)}`);
      toast({
        title: "Export erfolgreich",
        description: `${activeEmployees.length} aktive Mitarbeiter wurden erfolgreich exportiert.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleExportInactive = () => {
    const inactiveEmployees = employees.filter(employee => employee.endDate !== null);
    
    if (inactiveEmployees.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine ehemaligen Mitarbeiterdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportEmployeesToCSV(inactiveEmployees, `mitarbeiter_ehemalige_${new Date().toISOString().slice(0, 10)}`);
      toast({
        title: "Export erfolgreich",
        description: `${inactiveEmployees.length} ehemalige Mitarbeiter wurden erfolgreich exportiert.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center whitespace-nowrap">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportAll}>
          <Users className="mr-2 h-4 w-4" />
          Alle Mitarbeiter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportActive}>
          <UserCheck className="mr-2 h-4 w-4" />
          Nur aktive Mitarbeiter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportInactive}>
          <UserX className="mr-2 h-4 w-4" />
          Nur ehemalige Mitarbeiter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeExport;

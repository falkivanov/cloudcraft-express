
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportEmployeesToCSV, parseEmployeeCSVImport, generateEmployeeSampleCSV } from "@/utils/employeeCSVUtils";

interface EmployeeFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  employees: Employee[];
  onImportEmployees?: (employees: Employee[]) => void;
}

const EmployeeFilter = ({ 
  searchQuery, 
  onSearchChange,
  employees,
  onImportEmployees
}: EmployeeFilterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (employees.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine Mitarbeiterdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportEmployeesToCSV(employees, `mitarbeiter_export_${new Date().toISOString().slice(0, 10)}`);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      toast({
        title: "Import wird verarbeitet",
        description: "Bitte warten...",
      });
      
      const importedEmployees = await parseEmployeeCSVImport(file);
      
      if (importedEmployees.length === 0) {
        toast({
          title: "Import fehlgeschlagen",
          description: "Keine gültigen Mitarbeiterdaten in der Datei gefunden.",
          variant: "destructive",
        });
        return;
      }
      
      // Call the onImportEmployees callback if provided
      if (onImportEmployees) {
        onImportEmployees(importedEmployees);
        toast({
          title: "Import erfolgreich",
          description: `${importedEmployees.length} Mitarbeiter wurden erfolgreich importiert.`,
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: error instanceof Error ? error.message : "Beim Importieren der Daten ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadSample = () => {
    try {
      generateEmployeeSampleCSV();
      toast({
        title: "Beispieldatei heruntergeladen",
        description: "Eine Vorlage für den Mitarbeiter-Import wurde heruntergeladen.",
      });
    } catch (error) {
      console.error("Template download error:", error);
      toast({
        title: "Download fehlgeschlagen",
        description: "Beim Herunterladen der Vorlage ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Mitarbeitern..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".csv" 
        className="hidden"
        onChange={handleFileChange}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center whitespace-nowrap">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Datei hochladen
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadSample}>
            <FileDown className="mr-2 h-4 w-4" />
            Beispieldatei herunterladen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="outline" onClick={handleExport} className="flex items-center whitespace-nowrap">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default EmployeeFilter;

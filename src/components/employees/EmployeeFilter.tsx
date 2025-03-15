
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

interface EmployeeFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  employees: Employee[];
}

const EmployeeFilter = ({ 
  searchQuery, 
  onSearchChange,
  employees
}: EmployeeFilterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Diese Funktionen können später implementiert werden
  const handleExport = () => {
    toast({
      title: "Export Funktion",
      description: "Export-Funktion noch nicht implementiert.",
    });
  };

  const handleImportClick = () => {
    toast({
      title: "Import Funktion",
      description: "Import-Funktion noch nicht implementiert.",
    });
  };

  const handleDownloadSample = () => {
    toast({
      title: "Beispieldatei",
      description: "Beispieldatei-Funktion noch nicht implementiert.",
    });
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

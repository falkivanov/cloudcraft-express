
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";
import { parseEmployeeCSVImport, generateEmployeeSampleCSV } from "@/utils/employeeCSVUtils";
import { Upload, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveToStorage, STORAGE_KEYS } from "@/utils/storageUtils";

interface EmployeeImportProps {
  onImportEmployees?: (employees: Employee[]) => void;
}

const EmployeeImport: React.FC<EmployeeImportProps> = ({ onImportEmployees }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Save to history
      try {
        // Update file upload history
        const timestamp = Date.now();
        const historyItem = {
          name: file.name,
          type: 'csv',
          category: 'employees',
          timestamp 
        };
        
        // Get existing history
        const historyString = localStorage.getItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY);
        const history = historyString ? JSON.parse(historyString) : [];
        
        // Add new item and save
        history.push(historyItem);
        localStorage.setItem(STORAGE_KEYS.FILE_UPLOAD_HISTORY, JSON.stringify(history));
      } catch (historyError) {
        console.error("Error updating upload history:", historyError);
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
    <>
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
    </>
  );
};

export default EmployeeImport;

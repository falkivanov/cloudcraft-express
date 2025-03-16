
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { parseCSVImport } from "@/utils/csvUtils";
import { FileDown, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FleetImportProps {
  onImportVehicles: (vehicles: Vehicle[]) => void;
}

const FleetImport: React.FC<FleetImportProps> = ({ onImportVehicles }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedVehicles = await parseCSVImport(file);
      onImportVehicles(importedVehicles);
      
      toast({
        title: "Import erfolgreich",
        description: `${importedVehicles.length} Fahrzeuge wurden erfolgreich importiert.`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Datei konnte nicht korrekt importiert werden. Bitte überprüfen Sie das Format.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSample = () => {
    // Create a simple sample with just the headers
    const sampleVehicles: Vehicle[] = [
      {
        id: "sample-1",
        licensePlate: "B-XX 1234",
        brand: "BMW",
        model: "X5",
        vinNumber: "WBAKV210900J39048",
        status: "Aktiv",
        infleetDate: new Date().toISOString().split('T')[0],
        defleetDate: null,
        repairs: [],
        appointments: []
      },
      {
        id: "sample-2",
        licensePlate: "M-YY 5678",
        brand: "Mercedes",
        model: "C-Klasse",
        vinNumber: "WDDWJ4JB9KF089367",
        status: "In Werkstatt",
        infleetDate: new Date().toISOString().split('T')[0],
        defleetDate: null,
        repairs: [],
        appointments: []
      }
    ];
    
    // Import exportToCSV only in this function to avoid circular imports
    import("@/utils/csvUtils").then(({ exportToCSV }) => {
      exportToCSV(sampleVehicles, 'fahrzeug-muster');
      
      toast({
        title: "Beispieldatei heruntergeladen",
        description: "Die Beispieldatei wurde erfolgreich heruntergeladen.",
      });
    });
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

export default FleetImport;

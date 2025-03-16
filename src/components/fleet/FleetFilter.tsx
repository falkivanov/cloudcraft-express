
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload, FileDown, Truck, Car, CarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { exportToCSV, parseCSVImport } from "@/utils/csvUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FleetFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vehicles: Vehicle[];
  onImportVehicles: (vehicles: Vehicle[]) => void;
}

const FleetFilter = ({ 
  searchQuery, 
  onSearchChange, 
  vehicles, 
  onImportVehicles 
}: FleetFilterProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    if (vehicles.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine Fahrzeugdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportToCSV(vehicles, 'fahrzeuge_alle');
      toast({
        title: "Export erfolgreich",
        description: `${vehicles.length} Fahrzeuge wurden erfolgreich exportiert.`,
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
    const activeVehicles = vehicles.filter(vehicle => vehicle.status !== "Defleet");
    
    if (activeVehicles.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine aktiven Fahrzeugdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportToCSV(activeVehicles, 'fahrzeuge_aktiv');
      toast({
        title: "Export erfolgreich",
        description: `${activeVehicles.length} aktive Fahrzeuge wurden erfolgreich exportiert.`,
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
    const inactiveVehicles = vehicles.filter(vehicle => vehicle.status === "Defleet");
    
    if (inactiveVehicles.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Keine defleeten Fahrzeugdaten vorhanden zum Exportieren.",
      });
      return;
    }
    
    try {
      exportToCSV(inactiveVehicles, 'fahrzeuge_defleet');
      toast({
        title: "Export erfolgreich",
        description: `${inactiveVehicles.length} defleete Fahrzeuge wurden erfolgreich exportiert.`,
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
    
    exportToCSV(sampleVehicles, 'fahrzeug-muster');
    
    toast({
      title: "Beispieldatei heruntergeladen",
      description: "Die Beispieldatei wurde erfolgreich heruntergeladen.",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Fahrzeugen..."
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center whitespace-nowrap">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportAll}>
            <Truck className="mr-2 h-4 w-4" />
            Alle Fahrzeuge
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportActive}>
            <Car className="mr-2 h-4 w-4" />
            Nur aktive Fahrzeuge
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportInactive}>
            <CarOff className="mr-2 h-4 w-4" />
            Nur defleete Fahrzeuge
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FleetFilter;

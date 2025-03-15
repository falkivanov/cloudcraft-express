
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { exportToCSV, parseCSVImport } from "@/utils/csvUtils";

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

  const handleExport = () => {
    try {
      exportToCSV(vehicles, 'fahrzeug-liste');
      toast({
        title: "Export erfolgreich",
        description: "Die Fahrzeugdaten wurden erfolgreich exportiert.",
      });
    } catch (error) {
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
      
      <Button variant="outline" onClick={handleImportClick} className="flex items-center whitespace-nowrap">
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      
      <Button variant="outline" onClick={handleExport} className="flex items-center whitespace-nowrap">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default FleetFilter;

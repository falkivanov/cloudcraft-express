
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { exportToCSV } from "@/utils/csvUtils";
import { Ban, Car, Download, Truck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FleetExportProps {
  vehicles: Vehicle[];
}

const FleetExport: React.FC<FleetExportProps> = ({ vehicles }) => {
  const { toast } = useToast();

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
          <Truck className="mr-2 h-4 w-4" />
          Alle Fahrzeuge
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportActive}>
          <Car className="mr-2 h-4 w-4" />
          Nur aktive Fahrzeuge
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportInactive}>
          <Ban className="mr-2 h-4 w-4" />
          Nur defleete Fahrzeuge
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FleetExport;

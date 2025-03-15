
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Download, Upload, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import FleetTable from "@/components/fleet/FleetTable";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

// Beispieldaten für Fahrzeuge
const initialVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "B-AB 1234",
    brand: "BMW",
    model: "X5",
    vinNumber: "WBAKV210900J39048",
    status: "Aktiv",
    infleetDate: "2021-05-15",
    defleetDate: null
  },
  {
    id: "2",
    licensePlate: "M-CD 5678",
    brand: "Mercedes",
    model: "C-Klasse",
    vinNumber: "WDDWJ4JB9KF089367",
    status: "Aktiv",
    infleetDate: "2020-10-23",
    defleetDate: null
  },
  {
    id: "3",
    licensePlate: "K-EF 9012",
    brand: "Volkswagen",
    model: "Golf",
    vinNumber: "WVWZZZ1KZAM654321",
    status: "Aktiv",
    infleetDate: "2022-03-07",
    defleetDate: null
  },
  {
    id: "4",
    licensePlate: "F-GH 3456",
    brand: "Audi",
    model: "A4",
    vinNumber: "WAUZZZ8E57A123456",
    status: "Inaktiv",
    infleetDate: "2019-08-12",
    defleetDate: "2023-01-20"
  },
  {
    id: "5",
    licensePlate: "HH-IJ 7890",
    brand: "Opel",
    model: "Astra",
    vinNumber: "W0L0AHL3572123456",
    status: "Aktiv",
    infleetDate: "2021-11-30",
    defleetDate: null
  }
];

const FleetPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { setOpen } = useSidebar();

  // Reset sidebar state when component unmounts or mounts
  useEffect(() => {
    // Allow sidebar to be interactive again on component mount
    const handleMouseMove = () => {
      // Re-enable sidebar interactivity
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setOpen]);

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    ));
    
    toast({
      title: "Fahrzeug aktualisiert",
      description: `Die Daten des Fahrzeugs ${updatedVehicle.licensePlate} wurden erfolgreich aktualisiert.`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fuhrpark</h1>
        <Button>
          <Car className="mr-2" />
          Neues Fahrzeug
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Fahrzeugen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <FleetTable 
        vehicles={filteredVehicles} 
        onUpdateVehicle={handleUpdateVehicle}
      />
    </div>
  );
};

export default FleetPage;

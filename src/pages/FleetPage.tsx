import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Download, Upload, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FleetTable from "@/components/fleet/FleetTable";
import { Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";

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
    status: "Defleet",
    infleetDate: "2019-08-12",
    defleetDate: "2023-01-20"
  },
  {
    id: "5",
    licensePlate: "HH-IJ 7890",
    brand: "Opel",
    model: "Astra",
    vinNumber: "W0L0AHL3572123456",
    status: "In Werkstatt",
    infleetDate: "2021-11-30",
    defleetDate: null
  }
];

const FleetPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { setOpen } = useSidebar();

  // Reset sidebar state when component unmounts or mounts
  useEffect(() => {
    const handleMouseMove = () => {
      document.body.style.pointerEvents = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setOpen]);

  const activeVehicles = vehicles.filter(
    vehicle => vehicle.status !== "Defleet"
  );

  const defleetedVehicles = vehicles.filter(
    vehicle => vehicle.status === "Defleet"
  );

  const filteredActiveVehicles = activeVehicles.filter((vehicle) =>
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vinNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDefleetedVehicles = defleetedVehicles.filter((vehicle) =>
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vinNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    ));
    
    // If a vehicle was reactivated from defleet status
    if (updatedVehicle.status !== "Defleet" && vehicles.find(v => v.id === updatedVehicle.id)?.status === "Defleet") {
      toast({
        title: "Fahrzeug reaktiviert",
        description: `Das Fahrzeug ${updatedVehicle.licensePlate} wurde reaktiviert.`,
      });
    }
  };

  const handleDefleetVehicle = (vehicle: Vehicle, defleetDate: string) => {
    const updatedVehicle = {
      ...vehicle,
      status: "Defleet" as const,
      defleetDate: defleetDate
    };
    
    setVehicles(vehicles.map(v => 
      v.id === vehicle.id ? updatedVehicle : v
    ));
    
    toast({
      title: "Fahrzeug defleeted",
      description: `Das Fahrzeug ${vehicle.licensePlate} wurde defleeted.`,
    });
  };

  const handleAddVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    // Generate a new ID - in a real app this would be handled by the backend
    const newId = (Math.max(...vehicles.map(v => parseInt(v.id))) + 1).toString();
    
    const newVehicle: Vehicle = {
      id: newId,
      ...vehicleData
    };
    
    setVehicles([...vehicles, newVehicle]);
    
    toast({
      title: "Fahrzeug hinzugefügt",
      description: `Das Fahrzeug ${newVehicle.licensePlate} wurde erfolgreich hinzugefügt.`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fuhrpark</h1>
        <Button onClick={() => setIsNewVehicleDialogOpen(true)}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktive Fahrzeuge</TabsTrigger>
          <TabsTrigger value="defleeted">Defleeted Fahrzeuge</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <FleetTable 
            vehicles={filteredActiveVehicles} 
            onUpdateVehicle={handleUpdateVehicle}
            onDefleet={handleDefleetVehicle}
          />
        </TabsContent>
        
        <TabsContent value="defleeted">
          <FleetTable 
            vehicles={filteredDefleetedVehicles} 
            onUpdateVehicle={handleUpdateVehicle}
            onDefleet={handleDefleetVehicle}
            isDefleetView={true}
          />
        </TabsContent>
      </Tabs>
      
      <NewVehicleDialog 
        open={isNewVehicleDialogOpen}
        onOpenChange={setIsNewVehicleDialogOpen}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
};

export default FleetPage;

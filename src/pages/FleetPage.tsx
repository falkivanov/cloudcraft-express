import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Download, Upload, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FleetTable from "@/components/fleet/FleetTable";
import { Vehicle, RepairEntry, Appointment } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import NewVehicleDialog from "@/components/fleet/NewVehicleDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const sampleRepairs: RepairEntry[] = [
  {
    id: "1",
    date: "2023-05-10",
    description: "Ölwechsel und Inspektion",
    duration: 1,
    totalCost: 350.00,
    companyPaidAmount: 350.00
  },
  {
    id: "2",
    date: "2023-08-22",
    description: "Bremsen vorne erneuert",
    duration: 2,
    totalCost: 520.75,
    companyPaidAmount: 450.00
  }
];

const sampleAppointments: Appointment[] = [
  {
    id: "1",
    date: "2023-12-15",
    time: "10:30",
    description: "Jahresinspektion",
    appointmentType: "Inspektion",
    completed: true
  },
  {
    id: "2",
    date: "2024-02-10",
    time: "14:00",
    description: "Winterreifen wechseln",
    appointmentType: "Reifenwechsel",
    completed: false
  },
  {
    id: "3",
    date: format(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    time: "09:15",
    description: "Softwareupdate Navigationssystem",
    appointmentType: "Sonstiges",
    completed: false
  }
];

const initialVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "B-AB 1234",
    brand: "BMW",
    model: "X5",
    vinNumber: "WBAKV210900J39048",
    status: "Aktiv",
    infleetDate: "2021-05-15",
    defleetDate: null,
    repairs: sampleRepairs,
    appointments: sampleAppointments
  },
  {
    id: "2",
    licensePlate: "M-CD 5678",
    brand: "Mercedes",
    model: "C-Klasse",
    vinNumber: "WDDWJ4JB9KF089367",
    status: "Aktiv",
    infleetDate: "2020-10-23",
    defleetDate: null,
    repairs: [],
    appointments: [
      {
        id: "4",
        date: format(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        time: "11:00",
        description: "Inspektion nach Herstellervorgaben",
        appointmentType: "Inspektion",
        completed: false
      }
    ]
  },
  {
    id: "3",
    licensePlate: "K-EF 9012",
    brand: "Volkswagen",
    model: "Golf",
    vinNumber: "WVWZZZ1KZAM654321",
    status: "Aktiv",
    infleetDate: "2022-03-07",
    defleetDate: null,
    repairs: [],
    appointments: []
  },
  {
    id: "4",
    licensePlate: "F-GH 3456",
    brand: "Audi",
    model: "A4",
    vinNumber: "WAUZZZ8E57A123456",
    status: "Defleet",
    infleetDate: "2019-08-12",
    defleetDate: "2023-01-20",
    repairs: [],
    appointments: []
  },
  {
    id: "5",
    licensePlate: "HH-IJ 7890",
    brand: "Opel",
    model: "Astra",
    vinNumber: "W0L0AHL3572123456",
    status: "In Werkstatt",
    infleetDate: "2021-11-30",
    defleetDate: null,
    repairs: [
      {
        id: "3",
        date: "2023-11-15",
        description: "Getriebeschaden, kompletter Austausch notwendig",
        duration: 14,
        totalCost: 4800.00,
        companyPaidAmount: 3000.00
      }
    ],
    appointments: []
  }
];

const FleetPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { setOpen } = useSidebar();

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

  const formatDateDisplay = (dateString: string | null): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy', { locale: de });
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

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-6 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Fahrzeugen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center whitespace-nowrap">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" className="flex items-center whitespace-nowrap">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktive Fahrzeuge</TabsTrigger>
            <TabsTrigger value="defleeted">Defleeted Fahrzeuge</TabsTrigger>
          </TabsList>
          
          <div className="w-full overflow-x-auto">
            <TabsContent value="active" className="min-w-full">
              <FleetTable 
                vehicles={filteredActiveVehicles} 
                onUpdateVehicle={handleUpdateVehicle}
                onDefleet={handleDefleetVehicle}
              />
            </TabsContent>
            
            <TabsContent value="defleeted" className="min-w-full">
              <FleetTable 
                vehicles={filteredDefleetedVehicles} 
                onUpdateVehicle={handleUpdateVehicle}
                onDefleet={handleDefleetVehicle}
                isDefleetView={true}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <NewVehicleDialog 
        open={isNewVehicleDialogOpen}
        onOpenChange={setIsNewVehicleDialogOpen}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
};

export default FleetPage;

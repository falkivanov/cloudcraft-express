import { useState, useEffect } from "react";
import { Vehicle, RepairEntry, Appointment } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Beispieldaten für die Anwendung
const sampleRepairs: RepairEntry[] = [
  {
    id: "1",
    date: "2023-05-10",
    startDate: "2023-05-10",
    endDate: "2023-05-10",
    location: "ATU Frankfurt",
    description: "Ölwechsel und Inspektion",
    duration: 1,
    totalCost: 350.00,
    companyPaidAmount: 350.00
  },
  {
    id: "2",
    date: "2023-08-22",
    startDate: "2023-08-22",
    endDate: "2023-08-23",
    location: "Mercedes Werkstatt Berlin",
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
    location: "BMW Service Center",
    description: "Jahresinspektion",
    appointmentType: "Inspektion",
    completed: true
  },
  {
    id: "2",
    date: "2024-02-10",
    time: "14:00",
    location: "Reifendienst Schmidt",
    description: "Winterreifen wechseln",
    appointmentType: "Reifenwechsel",
    completed: false
  },
  {
    id: "3",
    date: format(new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    time: "09:15",
    location: "Autohaus Wagner",
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
        location: "Mercedes Service Center",
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
        startDate: "2023-11-15",
        endDate: "2023-11-29",
        location: "Opel Servicecenter Hamburg",
        description: "Getriebeschaden, kompletter Austausch notwendig",
        duration: 14,
        totalCost: 4800.00,
        companyPaidAmount: 3000.00
      }
    ],
    appointments: []
  }
];

export const useVehicleData = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const { toast } = useToast();

  // Filter nach Aktiven und Defleeten Fahrzeugen
  const activeVehicles = vehicles.filter(
    vehicle => vehicle.status !== "Defleet"
  );

  const defleetedVehicles = vehicles.filter(
    vehicle => vehicle.status === "Defleet"
  );

  // Filter nach Suchbegriff
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

  // Fahrzeug aktualisieren
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

  // Fahrzeug defleeten
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

  // Neues Fahrzeug hinzufügen
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

  // Import multiple vehicles
  const handleImportVehicles = (importedVehicles: Vehicle[]) => {
    const lastId = vehicles.length > 0 
      ? Math.max(...vehicles.map(v => parseInt(v.id))) 
      : 0;
    
    const vehiclesWithIds = importedVehicles.map((vehicle, index) => ({
      ...vehicle,
      id: (lastId + index + 1).toString()
    }));
    
    setVehicles([...vehicles, ...vehiclesWithIds]);
  };

  return {
    vehicles,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveVehicles,
    filteredDefleetedVehicles,
    handleUpdateVehicle,
    handleDefleetVehicle,
    handleAddVehicle,
    handleImportVehicles
  };
};

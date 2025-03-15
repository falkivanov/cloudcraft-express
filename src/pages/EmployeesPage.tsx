
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import EmployeeFilter from "@/components/employees/EmployeeFilter";
import EmployeeTabs from "@/components/employees/EmployeeTabs";
import EmployeeDashboard from "@/components/employees/dashboard/EmployeeDashboard";
import { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useEmployeeFilter } from "@/hooks/useEmployeeFilter";

// Beispieldaten für Mitarbeiter
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Max Mustermann",
    email: "max.mustermann@beispiel.de",
    phone: "+49 123 4567890",
    status: "Aktiv",
    transporterId: "TR-001",
    startDate: "2020-01-15",
    endDate: null,
    address: "Hauptstraße 1, 10115 Berlin",
    birthday: "1980-05-10",
    taxId: "DE123456789",
    insuranceId: "SV-12345678",
    workingDaysAWeek: 5,
    preferredVehicle: "BMW X5"
  },
  {
    id: "2",
    name: "Anna Schmidt",
    email: "anna.schmidt@beispiel.de",
    phone: "+49 123 4567891",
    status: "Aktiv",
    transporterId: "TR-002",
    startDate: "2019-08-01",
    endDate: null,
    address: "Lindenstraße 25, 10969 Berlin",
    birthday: "1985-09-15",
    taxId: "DE987654321",
    insuranceId: "SV-87654321",
    workingDaysAWeek: 5,
    preferredVehicle: "VW Golf"
  },
  {
    id: "3",
    name: "Thomas Weber",
    email: "thomas.weber@beispiel.de",
    phone: "+49 123 4567892",
    status: "Aktiv",
    transporterId: "TR-003",
    startDate: "2018-03-01",
    endDate: null,
    address: "Friedrichstraße 123, 10117 Berlin",
    birthday: "1978-12-03",
    taxId: "DE135792468",
    insuranceId: "SV-13579246",
    workingDaysAWeek: 5,
    preferredVehicle: "Mercedes C-Klasse"
  },
  {
    id: "4",
    name: "Lisa Becker",
    email: "lisa.becker@beispiel.de",
    phone: "+49 123 4567893",
    status: "Urlaub",
    transporterId: "TR-004",
    startDate: "2021-06-15",
    endDate: null,
    address: "Kurfürstendamm 234, 10719 Berlin",
    birthday: "1990-04-22",
    taxId: "DE246813579",
    insuranceId: "SV-24681357",
    workingDaysAWeek: 4,
    preferredVehicle: "Audi A4"
  },
  {
    id: "5",
    name: "Michael Schulz",
    email: "michael.schulz@beispiel.de",
    phone: "+49 123 4567894",
    status: "Aktiv",
    transporterId: "TR-005",
    startDate: "2017-11-01",
    endDate: null,
    address: "Alexanderplatz 5, 10178 Berlin",
    birthday: "1983-07-30",
    taxId: "DE369258147",
    insuranceId: "SV-36925814",
    workingDaysAWeek: 5,
    preferredVehicle: "Opel Astra"
  },
  // Füge einen ehemaligen Mitarbeiter hinzu
  {
    id: "6",
    name: "Sarah Meyer",
    email: "sarah.meyer@beispiel.de",
    phone: "+49 123 4567895",
    status: "Inaktiv",
    transporterId: "TR-006",
    startDate: "2018-05-01",
    endDate: "2023-12-31",
    address: "Musterstraße 42, 10115 Berlin",
    birthday: "1988-11-15",
    taxId: "DE123456788",
    insuranceId: "SV-87654322",
    workingDaysAWeek: 5,
    preferredVehicle: "BMW 3er"
  }
];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const { toast } = useToast();
  const { setOpen } = useSidebar();

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredActiveEmployees,
    filteredFormerEmployees
  } = useEmployeeFilter(employees);

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

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    
    toast({
      title: "Mitarbeiter aktualisiert",
      description: `Die Daten von ${updatedEmployee.name} wurden erfolgreich aktualisiert.`,
    });
  };

  const handleNewEmployee = () => {
    toast({
      title: "Neuer Mitarbeiter",
      description: "Diese Funktion wird noch implementiert.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mitarbeiter</h1>
        <Button onClick={handleNewEmployee}>
          <UserPlus className="mr-2" />
          Neuer Mitarbeiter
        </Button>
      </div>

      <EmployeeDashboard employees={employees} />

      <EmployeeFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        employees={employees}
      />

      <div className="w-full overflow-x-auto">
        <EmployeeTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredActiveEmployees={filteredActiveEmployees}
          filteredFormerEmployees={filteredFormerEmployees}
          onUpdateEmployee={handleUpdateEmployee}
        />
      </div>
    </div>
  );
};

export default EmployeesPage;

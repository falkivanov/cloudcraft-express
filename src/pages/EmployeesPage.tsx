
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Download, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import EmployeeTable from "@/components/employees/EmployeeTable";
import { Employee } from "@/types/employee";

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
  }
];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mitarbeiter</h1>
        <Button>
          <UserPlus className="mr-2" />
          Neuer Mitarbeiter
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Mitarbeitern..."
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

      <EmployeeTable employees={filteredEmployees} />
    </div>
  );
};

export default EmployeesPage;

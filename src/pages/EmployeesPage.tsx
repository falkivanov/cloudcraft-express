
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
    position: "Geschäftsführer",
    department: "Management",
    email: "max.mustermann@beispiel.de",
    phone: "+49 123 4567890",
    status: "Aktiv"
  },
  {
    id: "2",
    name: "Anna Schmidt",
    position: "Finanzcontroller",
    department: "Finanzen",
    email: "anna.schmidt@beispiel.de",
    phone: "+49 123 4567891",
    status: "Aktiv"
  },
  {
    id: "3",
    name: "Thomas Weber",
    position: "Vertriebsleiter",
    department: "Vertrieb",
    email: "thomas.weber@beispiel.de",
    phone: "+49 123 4567892",
    status: "Aktiv"
  },
  {
    id: "4",
    name: "Lisa Becker",
    position: "HR-Managerin",
    department: "Personal",
    email: "lisa.becker@beispiel.de",
    phone: "+49 123 4567893",
    status: "Urlaub"
  },
  {
    id: "5",
    name: "Michael Schulz",
    position: "IT-Administrator",
    department: "IT",
    email: "michael.schulz@beispiel.de",
    phone: "+49 123 4567894",
    status: "Aktiv"
  }
];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
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

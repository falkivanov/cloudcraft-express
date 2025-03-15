
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Max Mustermann",
    position: "Fahrzeugführer",
    email: "max.mustermann@finsuite.de",
    phone: "+49 123 456789",
    location: "Berlin",
  },
  {
    id: 2,
    name: "Anna Schmidt",
    position: "Logistik Manager",
    email: "anna.schmidt@finsuite.de", 
    phone: "+49 123 456788",
    location: "München",
  },
  {
    id: 3,
    name: "Thomas Müller",
    position: "Fuhrpark Leiter",
    email: "thomas.mueller@finsuite.de",
    phone: "+49 123 456787",
    location: "Hamburg",
  },
  {
    id: 4,
    name: "Laura Weber",
    position: "Buchhaltung",
    email: "laura.weber@finsuite.de",
    phone: "+49 123 456786",
    location: "Frankfurt",
  },
  {
    id: 5,
    name: "Michael Fischer",
    position: "Geschäftsführer",
    email: "michael.fischer@finsuite.de",
    phone: "+49 123 456785",
    location: "Köln",
  }
];

const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className="h-full w-full rounded-full object-cover" 
            />
          ) : (
            <UserIcon className="h-6 w-6 text-secondary-foreground" />
          )}
        </div>
        <div>
          <CardTitle className="text-xl">{employee.name}</CardTitle>
          <CardDescription>{employee.position}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmployeesPage = () => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mitarbeiter</h1>
        <Button className="flex items-center gap-2">
          <UserPlusIcon className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;

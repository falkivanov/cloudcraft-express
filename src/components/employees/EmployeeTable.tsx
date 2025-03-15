
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  CalendarDays,
  MapPin,
  Cake,
  FileText,
  Shield,
  Clock,
  Car,
  IdCard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/employee";

interface EmployeeTableProps {
  employees: Employee[];
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktiv":
        return <Badge className="bg-green-500">Aktiv</Badge>;
      case "Urlaub":
        return <Badge className="bg-blue-500">Urlaub</Badge>;
      case "Krank":
        return <Badge className="bg-amber-500">Krank</Badge>;
      case "Inaktiv":
        return <Badge className="bg-gray-500">Inaktiv</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Transporter ID</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Abteilung</TableHead>
              <TableHead>Startdatum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Keine Mitarbeiter gefunden
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.transporterId}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{formatDate(employee.startDate)}</TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" title={employee.email}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title={employee.phone}>
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menü öffnen</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                          <IdCard className="mr-2 h-4 w-4" />
                          <span>Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Bearbeiten</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Löschen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mitarbeiterdetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zum Mitarbeiter
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <IdCard className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Transporter ID</p>
                    <p>{selectedEmployee.transporterId}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Startdatum</p>
                    <p>{formatDate(selectedEmployee.startDate)}</p>
                  </div>
                </div>
                
                {selectedEmployee.endDate && (
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Enddatum</p>
                      <p>{formatDate(selectedEmployee.endDate)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p>{selectedEmployee.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Cake className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Geburtsdatum</p>
                    <p>{formatDate(selectedEmployee.birthday)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Steuer ID</p>
                    <p>{selectedEmployee.taxId}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Versicherungsnummer</p>
                    <p>{selectedEmployee.insuranceId}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Arbeitstage pro Woche</p>
                    <p>{selectedEmployee.workingDaysAWeek}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Bevorzugtes Fahrzeug</p>
                    <p>{selectedEmployee.preferredVehicle}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>{selectedEmployee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <p>{selectedEmployee.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 pt-4 flex justify-end">
                <Button onClick={() => setOpenDialog(false)}>Schließen</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeeTable;

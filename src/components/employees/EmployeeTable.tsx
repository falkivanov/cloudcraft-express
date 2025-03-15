
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
  IdCard,
  UserCheck,
  UserMinus
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
import EmployeeForm from "./EmployeeForm";
import ContractEndDialog from "./ContractEndDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface EmployeeTableProps {
  employees: Employee[];
  onUpdateEmployee?: (updatedEmployee: Employee) => void;
  isFormerView?: boolean;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ 
  employees,
  onUpdateEmployee = () => {},
  isFormerView = false
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [isContractEndDialogOpen, setIsContractEndDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

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

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setOpenEditSheet(true);
  };

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    onUpdateEmployee(updatedEmployee);
    setOpenEditSheet(false);
    setEditingEmployee(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const handleOpenContractEndDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsContractEndDialogOpen(true);
  };

  const handleEndContract = () => {
    if (selectedEmployee && onUpdateEmployee) {
      const updatedEmployee = {
        ...selectedEmployee,
        status: "Inaktiv",
        endDate: endDate
      };
      
      onUpdateEmployee(updatedEmployee);
      setIsContractEndDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleReactivateEmployee = (employee: Employee) => {
    if (onUpdateEmployee) {
      const updatedEmployee = {
        ...employee,
        endDate: null,
        status: "Aktiv"
      };
      onUpdateEmployee(updatedEmployee);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Transporter ID</TableHead>
              <TableHead>Startdatum</TableHead>
              {isFormerView && <TableHead>Enddatum</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isFormerView ? 7 : 6} className="text-center py-10 text-muted-foreground">
                  {isFormerView ? "Keine ehemaligen Mitarbeiter gefunden" : "Keine Mitarbeiter gefunden"}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.transporterId}</TableCell>
                  <TableCell>{formatDate(employee.startDate)}</TableCell>
                  {isFormerView && <TableCell>{formatDate(employee.endDate)}</TableCell>}
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
                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Bearbeiten</span>
                        </DropdownMenuItem>
                        {!isFormerView && (
                          <DropdownMenuItem onClick={() => handleOpenContractEndDialog(employee)}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            <span>Vertrag beenden</span>
                          </DropdownMenuItem>
                        )}
                        {isFormerView && (
                          <DropdownMenuItem onClick={() => handleReactivateEmployee(employee)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Reaktivieren</span>
                          </DropdownMenuItem>
                        )}
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
              
              <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedEmployee) {
                      handleEditEmployee(selectedEmployee);
                      setOpenDialog(false);
                    }
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Bearbeiten
                </Button>
                <Button onClick={() => setOpenDialog(false)}>Schließen</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={openEditSheet} onOpenChange={setOpenEditSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Mitarbeiter bearbeiten</SheetTitle>
            <SheetDescription>
              Die Informationen des Mitarbeiters anpassen
            </SheetDescription>
          </SheetHeader>
          {editingEmployee && (
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSaveEmployee}
              onCancel={() => setOpenEditSheet(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <ContractEndDialog
        selectedEmployee={selectedEmployee}
        open={isContractEndDialogOpen}
        endDate={endDate}
        onOpenChange={setIsContractEndDialogOpen}
        onEndDateChange={setEndDate}
        onEndContract={handleEndContract}
      />
    </>
  );
};

export default EmployeeTable;

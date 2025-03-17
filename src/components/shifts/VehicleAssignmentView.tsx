
import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { TruckIcon, UserIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { initialEmployees } from "@/data/sampleEmployeeData";

interface VehicleAssignmentViewProps {
  isEnabled: boolean;
}

// Musterfahrzeugdaten für die Demonstration
const sampleVehicles = [
  { id: "v1", licensePlate: "B-AB 1234", brand: "VW", model: "Transporter", status: "Aktiv" },
  { id: "v2", licensePlate: "B-CD 5678", brand: "Mercedes", model: "Sprinter", status: "Aktiv" },
  { id: "v3", licensePlate: "B-EF 9012", brand: "Ford", model: "Transit", status: "Aktiv" },
  { id: "v4", licensePlate: "B-GH 3456", brand: "BMW", model: "X5", status: "In Werkstatt" },
  { id: "v5", licensePlate: "B-IJ 7890", brand: "Audi", model: "A4", status: "Aktiv" },
];

// Beispiel für zugewiesene Schichten (in einer echten App würden diese aus einer API geladen)
const assignedShifts = [
  { employeeId: "1", date: format(new Date(), "yyyy-MM-dd"), shiftType: "Früh" },
  { employeeId: "2", date: format(new Date(), "yyyy-MM-dd"), shiftType: "Spät" },
  { employeeId: "3", date: format(addDays(new Date(), 1), "yyyy-MM-dd"), shiftType: "Früh" },
];

const VehicleAssignmentView: React.FC<VehicleAssignmentViewProps> = ({ isEnabled }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Filtern Sie Mitarbeiter mit Schichten am ausgewählten Tag
  const employeesWithShifts = initialEmployees.filter(emp => 
    assignedShifts.some(shift => 
      shift.employeeId === emp.id && shift.date === selectedDate
    )
  );
  
  // Status der Fahrzeugzuweisung pro Mitarbeiter
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  
  const handleAssignVehicle = (employeeId: string, vehicleId: string) => {
    setAssignments(prev => ({
      ...prev,
      [employeeId]: vehicleId
    }));
  };
  
  if (!isEnabled) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <TruckIcon className="mx-auto h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-lg font-semibold mb-2">Fahrzeugzuordnung nicht verfügbar</h3>
        <p>Bitte finalisieren Sie zuerst den Dienstplan, um Fahrzeuge zuordnen zu können.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <Select defaultValue={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Datum auswählen" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(new Date(), i);
              return (
                <SelectItem key={i} value={format(date, "yyyy-MM-dd")}>
                  {format(date, "EEEE, dd.MM.yyyy", { locale: de })}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
      {employeesWithShifts.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <UserIcon className="mx-auto h-16 w-16 mb-4 opacity-20" />
          <p>Keine geplanten Mitarbeiter für diesen Tag gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employeesWithShifts.map(employee => {
            const employeeShift = assignedShifts.find(shift => 
              shift.employeeId === employee.id && shift.date === selectedDate
            );
            
            return (
              <Card key={employee.id} className={cn(
                "overflow-hidden transition-all",
                assignments[employee.id] && "border-green-500"
              )}>
                <div className={cn(
                  "p-2 text-white",
                  employeeShift?.shiftType === "Früh" ? "bg-yellow-500" :
                  employeeShift?.shiftType === "Spät" ? "bg-blue-500" : "bg-indigo-800"
                )}>
                  {employeeShift?.shiftType}-Schicht
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.preferredVehicle}</p>
                    </div>
                    {assignments[employee.id] && (
                      <Badge variant="outline" className="bg-green-50">Zugewiesen</Badge>
                    )}
                  </div>
                  
                  <Select 
                    value={assignments[employee.id]} 
                    onValueChange={(value) => handleAssignVehicle(employee.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fahrzeug zuweisen" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleVehicles
                        .filter(v => v.status === "Aktiv")
                        .map(vehicle => {
                          const isPreferred = vehicle.brand + " " + vehicle.model === employee.preferredVehicle;
                          const isAssigned = Object.values(assignments).includes(vehicle.id);
                          
                          return (
                            <SelectItem 
                              key={vehicle.id} 
                              value={vehicle.id}
                              disabled={isAssigned && assignments[employee.id] !== vehicle.id}
                              className={isPreferred ? "font-medium bg-green-50" : ""}
                            >
                              {isPreferred && "✓ "}{vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                              {isAssigned && assignments[employee.id] !== vehicle.id && " - bereits zugewiesen"}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="pt-4 flex justify-end">
        <Button disabled={employeesWithShifts.length === 0}>
          Zuordnungen speichern
        </Button>
      </div>
    </div>
  );
};

export default VehicleAssignmentView;


import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Car, WandSparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { toast } from "sonner";
import { initialVehicles } from "@/data/sampleVehicleData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Sample vehicles for demonstration from our data source
const activeVehicles = initialVehicles.filter(vehicle => vehicle.status === "Aktiv").map(vehicle => ({
  id: vehicle.id,
  licensePlate: vehicle.licensePlate,
  brand: vehicle.brand,
  model: vehicle.model
}));

interface DailyVehicleAssignmentProps {
  isScheduleFinalized: boolean;
}

const DailyVehicleAssignment: React.FC<DailyVehicleAssignmentProps> = ({ isScheduleFinalized }) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const formattedToday = format(today, "dd.MM.yyyy", { locale: de });
  const formattedTomorrow = format(tomorrow, "dd.MM.yyyy", { locale: de });
  
  // Today's assignments (which vehicles are assigned to which employees)
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  
  // Tomorrow's assignments (which will be empty until auto-assignment is made)
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  
  // Load today's assignments (simulated)
  useEffect(() => {
    // In a real application, this would fetch from an API
    const mockTodayAssignments: Record<string, string> = {
      "1": "1", // Vehicle 1 is assigned to employee 1 (Max Mustermann)
      "2": "3", // Vehicle 2 is assigned to employee 3 (Thomas Weber)
      "3": "2", // Vehicle 3 is assigned to employee 2 (Anna Schmidt)
      "6": "5", // Vehicle 6 is assigned to employee 5 (Michael Schulz)
      "9": "7", // Vehicle 9 is assigned to employee 7 (Julia Fischer)
    };
    setTodayAssignments(mockTodayAssignments);
  }, []);
  
  // Automatic assignment for tomorrow
  const handleAutoAssign = () => {
    if (!isScheduleFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeuge zuzuordnen, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    const newAssignments: Record<string, string> = {};
    
    // Get list of active employees
    const activeEmployees = initialEmployees.filter(emp => emp.status === "Aktiv");
    
    // Simple algorithm: assign vehicles based on preferences if possible
    activeVehicles.forEach(vehicle => {
      // First check if any employee prefers this vehicle
      const employeeWithPreference = activeEmployees.find(
        emp => emp.preferredVehicle === vehicle.licensePlate && 
              !Object.values(newAssignments).includes(emp.id)
      );
      
      if (employeeWithPreference) {
        newAssignments[vehicle.id] = employeeWithPreference.id;
      } else {
        // If no preference, assign to any available employee
        const availableEmployee = activeEmployees.find(
          emp => !Object.values(newAssignments).includes(emp.id)
        );
        
        if (availableEmployee) {
          newAssignments[vehicle.id] = availableEmployee.id;
        }
      }
    });
    
    setTomorrowAssignments(newAssignments);
    
    toast.success(`${Object.keys(newAssignments).length} Fahrzeuge für ${formattedTomorrow} automatisch zugewiesen`, {
      description: "Überprüfen Sie die Zuordnungen und speichern Sie diese bei Bedarf."
    });
  };
  
  // Save tomorrow's assignments (in a real app this would be sent to an API)
  const handleSaveAssignments = () => {
    if (!isScheduleFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeugzuordnungen zu speichern, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    if (Object.keys(tomorrowAssignments).length === 0) {
      toast.warning("Keine Zuordnungen vorhanden", {
        description: "Bitte führen Sie zuerst eine Auto-Zuordnung durch."
      });
      return;
    }
    
    const savedAssignments = Object.entries(tomorrowAssignments).map(([vehicleId, employeeId]) => {
      const vehicle = activeVehicles.find(v => v.id === vehicleId);
      const employee = initialEmployees.find(e => e.id === employeeId);
      return {
        id: `${vehicleId}-${employeeId}-${format(tomorrow, "yyyy-MM-dd")}`,
        vehicleId,
        vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
        employeeId,
        employeeName: employee?.name || "",
        date: format(tomorrow, "yyyy-MM-dd"),
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin"
      };
    });
    
    console.log("Saved assignments for tomorrow:", savedAssignments);
    // Here would be the API call in a real app
    
    toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
  };
  
  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId: string) => {
    const employee = initialEmployees.find(e => e.id === employeeId);
    return employee ? employee.name : "Nicht zugewiesen";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Fahrzeugzuordnung</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleAutoAssign}
            className="gap-2"
          >
            <WandSparkles className="h-4 w-4" />
            Auto-Zuordnung für {formattedTomorrow}
          </Button>
          <Button 
            disabled={Object.keys(tomorrowAssignments).length === 0}
            onClick={handleSaveAssignments}
          >
            <Car className="h-4 w-4 mr-2" />
            Zuordnungen speichern
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>{formattedToday}</TableHead>
            <TableHead>{formattedTomorrow}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeVehicles.map(vehicle => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div className="font-medium">{vehicle.licensePlate}</div>
                <div className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</div>
              </TableCell>
              <TableCell>
                {todayAssignments[vehicle.id] ? (
                  <div>{getEmployeeName(todayAssignments[vehicle.id])}</div>
                ) : (
                  <div className="text-muted-foreground">Nicht zugewiesen</div>
                )}
              </TableCell>
              <TableCell>
                {tomorrowAssignments[vehicle.id] ? (
                  <div>{getEmployeeName(tomorrowAssignments[vehicle.id])}</div>
                ) : (
                  <div className="text-muted-foreground">Noch nicht zugewiesen</div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailyVehicleAssignment;

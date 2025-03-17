
import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { Car, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { toast } from "sonner";
import { initialVehicles } from "@/data/sampleVehicleData";
import { ShiftType } from "../utils/shift-utils";

// Sample vehicles for demonstration from our data source
const sampleVehicles = initialVehicles.map(vehicle => ({
  id: vehicle.id,
  licensePlate: vehicle.licensePlate,
  brand: vehicle.brand,
  model: vehicle.model,
  status: vehicle.status === "Aktiv" ? "Aktiv" : "In Werkstatt"
}));

// Example of assigned shifts
const assignedShifts = [
  { employeeId: "1", date: format(new Date(), "yyyy-MM-dd"), shiftType: "Arbeit" as ShiftType },
  { employeeId: "2", date: format(new Date(), "yyyy-MM-dd"), shiftType: "Arbeit" as ShiftType },
  { employeeId: "3", date: format(new Date(), "yyyy-MM-dd"), shiftType: "Arbeit" as ShiftType },
];

const DailyVehicleAssignment: React.FC = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  
  // Filter employees with shifts today
  const employeesWithShifts = initialEmployees.filter(emp => 
    assignedShifts.some(shift => 
      shift.employeeId === emp.id && shift.date === today
    )
  );
  
  // Status of vehicle assignments per employee
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // Previous day's assignments
  const [previousAssignments, setPreviousAssignments] = useState<Record<string, string>>({});
  
  // Load previous day's assignments (simulated)
  useEffect(() => {
    // In a real application, this would fetch from an API
    const mockPreviousAssignments: Record<string, string> = {
      "1": "1", // Employee 1 had vehicle 1
      "2": "3", // Employee 2 had vehicle 3
      "3": "5", // Employee 3 had vehicle 5
    };
    setPreviousAssignments(mockPreviousAssignments);
  }, []);
  
  // Automatic assignment based on employee preferences
  const handleAutoAssign = () => {
    const newAssignments: Record<string, string> = {};
    const availableVehicles = new Set(sampleVehicles
      .filter(v => v.status === "Aktiv")
      .map(v => v.id));
    
    // First try to assign preferred vehicles
    employeesWithShifts.forEach(employee => {
      // Find the employee's preferred vehicle by license plate
      const preferredVehicle = sampleVehicles.find(
        v => v.licensePlate === employee.preferredVehicle && v.status === "Aktiv"
      );
      
      if (preferredVehicle && availableVehicles.has(preferredVehicle.id)) {
        newAssignments[employee.id] = preferredVehicle.id;
        availableVehicles.delete(preferredVehicle.id);
      }
    });
    
    // Then assign remaining employees with available vehicles
    employeesWithShifts.forEach(employee => {
      if (!newAssignments[employee.id] && availableVehicles.size > 0) {
        const nextVehicleId = Array.from(availableVehicles)[0];
        newAssignments[employee.id] = nextVehicleId;
        availableVehicles.delete(nextVehicleId);
      }
    });
    
    setAssignments(newAssignments);
    
    // Show success message
    toast.success(`Fahrzeuge automatisch zugewiesen: ${Object.keys(newAssignments).length} von ${employeesWithShifts.length} Mitarbeitern`, {
      description: availableVehicles.size === 0 && Object.keys(newAssignments).length < employeesWithShifts.length 
        ? "Nicht genügend Fahrzeuge für alle Mitarbeiter verfügbar." 
        : undefined
    });
  };
  
  // Save assignments (in a real app this would be sent to an API)
  const handleSaveAssignments = () => {
    const savedAssignments = Object.entries(assignments).map(([employeeId, vehicleId]) => {
      const employee = initialEmployees.find(e => e.id === employeeId);
      const vehicle = sampleVehicles.find(v => v.id === vehicleId);
      return {
        id: `${employeeId}-${vehicleId}-${today}`,
        employeeId,
        employeeName: employee?.name || "",
        vehicleId,
        vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
        date: today,
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin"
      };
    });
    
    console.log("Saved assignments:", savedAssignments);
    // Here would be the API call in a real app
    
    toast.success("Fahrzeugzuordnungen wurden gespeichert!");
  };
  
  // Helper function to get vehicle info by ID
  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = sampleVehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Nicht zugewiesen";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Fahrzeugzuordnung für heute</h2>
        <Button 
          variant="outline"
          onClick={handleAutoAssign}
          disabled={employeesWithShifts.length === 0}
          className="gap-2"
        >
          <WandSparkles className="h-4 w-4" />
          Auto-Zuordnung
        </Button>
      </div>
      
      {employeesWithShifts.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <p>Keine geplanten Mitarbeiter für heute gefunden.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Vorherige Zuordnung</TableHead>
              <TableHead>Neue Zuordnung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeesWithShifts.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Präferenz: {employee.preferredVehicle || "Keine"}
                  </div>
                </TableCell>
                <TableCell>
                  {previousAssignments[employee.id] ? (
                    getVehicleInfo(previousAssignments[employee.id])
                  ) : (
                    "Keine vorherige Zuordnung"
                  )}
                </TableCell>
                <TableCell>
                  {assignments[employee.id] ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50">
                        {getVehicleInfo(assignments[employee.id])}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Noch nicht zugewiesen</div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <div className="pt-4 flex justify-end">
        <Button 
          disabled={employeesWithShifts.length === 0 || Object.keys(assignments).length === 0}
          onClick={handleSaveAssignments}
        >
          <Car className="mr-2 h-4 w-4" />
          Zuordnungen speichern
        </Button>
      </div>
    </div>
  );
};

export default DailyVehicleAssignment;

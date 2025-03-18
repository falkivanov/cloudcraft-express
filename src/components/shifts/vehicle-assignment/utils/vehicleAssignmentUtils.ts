
import { initialEmployees } from "@/data/sampleEmployeeData";
import { initialVehicles } from "@/data/sampleVehicleData";

export const activeVehicles = initialVehicles.filter(vehicle => vehicle.status === "Aktiv").map(vehicle => ({
  id: vehicle.id,
  licensePlate: vehicle.licensePlate,
  brand: vehicle.brand,
  model: vehicle.model
}));

export const getEmployeeName = (employeeId: string) => {
  const employee = initialEmployees.find(e => e.id === employeeId);
  return employee ? employee.name : "Nicht zugewiesen";
};

export const needsKeyChange = (todayAssignments: Record<string, string>, vehicleId: string, employeeId: string): "new" | "exchange" | null => {
  if (!employeeId) return null;
  
  const todayVehicleId = Object.entries(todayAssignments).find(
    ([vId, eId]) => eId === employeeId
  )?.[0];
  
  if (!todayVehicleId) return "new";
  
  if (todayVehicleId !== vehicleId) return "exchange";
  
  return null;
};

export const getKeyChangeStyle = (status: "new" | "exchange" | null) => {
  switch (status) {
    case "new":
      return "bg-blue-50";
    case "exchange":
      return "bg-amber-50";
    default:
      return "";
  }
};

export const notAssignedPreferredVehicle = (employeeId: string, vehicleId: string): boolean => {
  if (!employeeId) return false;
  
  const employee = initialEmployees.find(e => e.id === employeeId);
  if (!employee || !employee.preferredVehicle) return false;
  
  const vehicle = activeVehicles.find(v => v.id === vehicleId);
  if (!vehicle) return false;
  
  return employee.preferredVehicle !== vehicle.licensePlate;
};

// Verbesserte Funktion zur Generierung von Fahrzeugzuweisungen
// Versucht, Mitarbeiter mit ihren bevorzugten Fahrzeugen zu verbinden
export const generateAssignments = () => {
  const newAssignments: Record<string, string> = {};
  
  const activeEmployees = initialEmployees.filter(emp => emp.status === "Aktiv");
  
  // Zuerst zuweisen: Mitarbeiter, die ein bestimmtes Fahrzeug bevorzugen
  activeVehicles.forEach(vehicle => {
    const employeeWithPreference = activeEmployees.find(
      emp => emp.preferredVehicle === vehicle.licensePlate && 
            !Object.values(newAssignments).includes(emp.id)
    );
    
    if (employeeWithPreference) {
      newAssignments[vehicle.id] = employeeWithPreference.id;
    }
  });
  
  // Dann: Verbleibende Fahrzeuge den verbleibenden Mitarbeitern zuweisen
  activeVehicles.forEach(vehicle => {
    if (!newAssignments[vehicle.id]) {
      const availableEmployee = activeEmployees.find(
        emp => !Object.values(newAssignments).includes(emp.id)
      );
      
      if (availableEmployee) {
        newAssignments[vehicle.id] = availableEmployee.id;
      }
    }
  });
  
  return newAssignments;
};

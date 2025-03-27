
import { Employee } from "@/types/employee";
import { Vehicle } from "@/types/vehicle";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { initialVehicles } from "@/data/sampleVehicleData";

// Define interface for the simplified vehicle objects
export interface VehicleBasic {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
}

// Dynamisch aktive Fahrzeuge aus localStorage laden, mit Fallback
export const getActiveVehicles = (): VehicleBasic[] => {
  try {
    const savedVehicles = localStorage.getItem('vehicles');
    if (savedVehicles) {
      const parsedVehicles = JSON.parse(savedVehicles);
      if (Array.isArray(parsedVehicles) && parsedVehicles.length > 0) {
        return parsedVehicles
          .filter(vehicle => vehicle.status === "Aktiv")
          .map(vehicle => ({
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model
          }));
      }
    }
  } catch (error) {
    console.error('Error loading vehicles from localStorage:', error);
  }
  
  // Fallback zu initialVehicles wenn localStorage leer oder fehlerhaft ist
  return initialVehicles
    .filter(vehicle => vehicle.status === "Aktiv")
    .map(vehicle => ({
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model
    }));
};

// Lazy-evaluierte aktive Fahrzeuge beim ersten Aufruf
let activeVehiclesCache: VehicleBasic[] | null = null;
export const activeVehicles = (): VehicleBasic[] => {
  if (!activeVehiclesCache) {
    activeVehiclesCache = getActiveVehicles();
  }
  return activeVehiclesCache;
};

// Dynamisch Mitarbeiter aus localStorage laden, mit Fallback
const getEmployees = (): Employee[] => {
  try {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      const parsedEmployees = JSON.parse(savedEmployees);
      if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
        return parsedEmployees;
      }
    }
  } catch (error) {
    console.error('Error loading employees from localStorage:', error);
  }
  
  return initialEmployees;
};

export const getEmployeeName = (employeeId: string) => {
  const employees = getEmployees();
  const employee = employees.find(e => e.id === employeeId);
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
  
  const employees = getEmployees();
  const employee = employees.find(e => e.id === employeeId);
  if (!employee || !employee.preferredVehicle) return false;
  
  const vehicle = activeVehicles().find(v => v.id === vehicleId);
  if (!vehicle) return false;
  
  return employee.preferredVehicle !== vehicle.licensePlate;
};

// Verbesserte Funktion zur Generierung von Fahrzeugzuweisungen
// Versucht, Mitarbeiter mit ihren bevorzugten Fahrzeugen zu verbinden
export const generateAssignments = () => {
  const newAssignments: Record<string, string> = {};
  
  const employees = getEmployees();
  const activeEmployeesList = employees.filter(emp => emp.status === "Aktiv");
  const availableVehicles = activeVehicles();
  
  // Zuerst zuweisen: Mitarbeiter, die ein bestimmtes Fahrzeug bevorzugen
  availableVehicles.forEach(vehicle => {
    const employeeWithPreference = activeEmployeesList.find(
      emp => emp.preferredVehicle === vehicle.licensePlate && 
            !Object.values(newAssignments).includes(emp.id)
    );
    
    if (employeeWithPreference) {
      newAssignments[vehicle.id] = employeeWithPreference.id;
    }
  });
  
  // Dann: Verbleibende Fahrzeuge den verbleibenden Mitarbeitern zuweisen
  availableVehicles.forEach(vehicle => {
    if (!newAssignments[vehicle.id]) {
      const availableEmployee = activeEmployeesList.find(
        emp => !Object.values(newAssignments).includes(emp.id)
      );
      
      if (availableEmployee) {
        newAssignments[vehicle.id] = availableEmployee.id;
      }
    }
  });
  
  return newAssignments;
};

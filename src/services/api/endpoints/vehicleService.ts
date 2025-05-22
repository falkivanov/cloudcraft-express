
import { Vehicle, RepairEntry, Appointment } from '@/types/vehicle';
import { VehicleAssignment } from '@/types/shift';
import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

// Alle Fahrzeuge abrufen
export async function getAllVehicles(options?: { 
  status?: string;
  brand?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.status) params.status = options.status;
    if (options?.brand) params.brand = options.brand;
    if (options?.search) params.search = options.search;
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<Vehicle[]>(API_ENDPOINTS.vehicles.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return { success: false, error: "Fehler beim Abrufen der Fahrzeuge", data: [] as Vehicle[] };
  }
}

// Einzelnes Fahrzeug abrufen
export async function getVehicleById(id: string) {
  try {
    const response = await get<Vehicle>(API_ENDPOINTS.vehicles.getById(id));
    return response;
  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Abrufen des Fahrzeugs" };
  }
}

// Neues Fahrzeug erstellen
export async function createVehicle(vehicle: Omit<Vehicle, "id">) {
  try {
    const response = await post<Vehicle>(API_ENDPOINTS.vehicles.create, vehicle);
    return response;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: "Fehler beim Erstellen des Fahrzeugs" };
  }
}

// Mehrere Fahrzeuge erstellen (für Import)
export async function createVehiclesBatch(vehicles: Omit<Vehicle, "id">[]) {
  try {
    const response = await post<{
      success: boolean;
      message: string;
      created: Vehicle[];
      skipped: number;
      skippedDetails: Array<{ vehicle: Omit<Vehicle, "id">; reason: string }>;
    }>(API_ENDPOINTS.vehicles.createBatch, vehicles);
    return response;
  } catch (error) {
    console.error("Error creating vehicle batch:", error);
    return { 
      success: false, 
      error: "Fehler beim Importieren der Fahrzeuge",
      data: { 
        success: false, 
        message: "Import fehlgeschlagen", 
        created: [], 
        skipped: 0,
        skippedDetails: []
      } 
    };
  }
}

// Fahrzeug aktualisieren
export async function updateVehicle(id: string, vehicle: Vehicle) {
  try {
    const response = await put<Vehicle>(API_ENDPOINTS.vehicles.update(id), vehicle);
    return response;
  } catch (error) {
    console.error(`Error updating vehicle with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Aktualisieren des Fahrzeugs" };
  }
}

// Fahrzeug löschen
export async function deleteVehicle(id: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.vehicles.delete(id));
  } catch (error) {
    console.error(`Error deleting vehicle with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Löschen des Fahrzeugs" };
  }
}

// Reparatur zu einem Fahrzeug hinzufügen
export async function addRepair(vehicleId: string, repair: Omit<RepairEntry, "id" | "date" | "duration">) {
  try {
    const response = await post<RepairEntry>(API_ENDPOINTS.vehicles.repairs.add(vehicleId), repair);
    return response;
  } catch (error) {
    console.error(`Error adding repair to vehicle ${vehicleId}:`, error);
    return { success: false, error: "Fehler beim Hinzufügen der Reparatur" };
  }
}

// Reparatur aktualisieren
export async function updateRepair(repairId: string, repair: Partial<RepairEntry>) {
  try {
    const response = await put<RepairEntry>(API_ENDPOINTS.vehicles.repairs.update(repairId), repair);
    return response;
  } catch (error) {
    console.error(`Error updating repair ${repairId}:`, error);
    return { success: false, error: "Fehler beim Aktualisieren der Reparatur" };
  }
}

// Reparatur löschen
export async function deleteRepair(repairId: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.vehicles.repairs.delete(repairId));
  } catch (error) {
    console.error(`Error deleting repair ${repairId}:`, error);
    return { success: false, error: "Fehler beim Löschen der Reparatur" };
  }
}

// Alle Reparaturen abrufen
export async function getAllRepairs(options?: {
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.startDate) params.start_date = options.startDate;
    if (options?.endDate) params.end_date = options.endDate;
    if (options?.vehicleId) params.vehicle_id = options.vehicleId;
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<RepairEntry[]>(API_ENDPOINTS.vehicles.repairs.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return { success: false, error: "Fehler beim Abrufen der Reparaturen", data: [] as RepairEntry[] };
  }
}

// Termin zu einem Fahrzeug hinzufügen
export async function addAppointment(vehicleId: string, appointment: Omit<Appointment, "id">) {
  try {
    const response = await post<Appointment>(API_ENDPOINTS.vehicles.appointments.add(vehicleId), appointment);
    return response;
  } catch (error) {
    console.error(`Error adding appointment to vehicle ${vehicleId}:`, error);
    return { success: false, error: "Fehler beim Hinzufügen des Termins" };
  }
}

// Termin aktualisieren
export async function updateAppointment(appointmentId: string, appointment: Partial<Appointment>) {
  try {
    const response = await put<Appointment>(API_ENDPOINTS.vehicles.appointments.update(appointmentId), appointment);
    return response;
  } catch (error) {
    console.error(`Error updating appointment ${appointmentId}:`, error);
    return { success: false, error: "Fehler beim Aktualisieren des Termins" };
  }
}

// Termin löschen
export async function deleteAppointment(appointmentId: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.vehicles.appointments.delete(appointmentId));
  } catch (error) {
    console.error(`Error deleting appointment ${appointmentId}:`, error);
    return { success: false, error: "Fehler beim Löschen des Termins" };
  }
}

// Alle Termine abrufen
export async function getAllAppointments(options?: {
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
  completed?: boolean;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.startDate) params.start_date = options.startDate;
    if (options?.endDate) params.end_date = options.endDate;
    if (options?.vehicleId) params.vehicle_id = options.vehicleId;
    if (options?.completed !== undefined) params.completed = options.completed.toString();
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<Appointment[]>(API_ENDPOINTS.vehicles.appointments.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: "Fehler beim Abrufen der Termine", data: [] as Appointment[] };
  }
}

// Fahrzeugzuweisung erstellen
export async function createVehicleAssignment(assignment: {
  vehicleId: string;
  employeeId: string;
  date: string;
  assignedBy: string;
}) {
  try {
    const response = await post<VehicleAssignment>(API_ENDPOINTS.vehicles.assignments.create, assignment);
    return response;
  } catch (error) {
    console.error("Error creating vehicle assignment:", error);
    return { success: false, error: "Fehler beim Erstellen der Fahrzeugzuweisung" };
  }
}

// Fahrzeugzuweisungen abrufen
export async function getVehicleAssignments(options?: {
  date?: string;
  vehicleId?: string;
  employeeId?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.date) params.date = options.date;
    if (options?.vehicleId) params.vehicle_id = options.vehicleId;
    if (options?.employeeId) params.employee_id = options.employeeId;
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<VehicleAssignment[]>(API_ENDPOINTS.vehicles.assignments.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching vehicle assignments:", error);
    return { success: false, error: "Fehler beim Abrufen der Fahrzeugzuweisungen", data: [] as VehicleAssignment[] };
  }
}

// Fahrzeugzuweisung löschen
export async function deleteVehicleAssignment(assignmentId: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.vehicles.assignments.delete(assignmentId));
  } catch (error) {
    console.error(`Error deleting vehicle assignment ${assignmentId}:`, error);
    return { success: false, error: "Fehler beim Löschen der Fahrzeugzuweisung" };
  }
}

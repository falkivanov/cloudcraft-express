
import { ShiftAssignment, ShiftPlanRequest, ShiftPlanResponse } from '@/types/shift';
import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

// Alle Schichten abrufen
export async function getAllShifts(options?: { 
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  status?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.startDate) params.startDate = options.startDate;
    if (options?.endDate) params.endDate = options.endDate;
    if (options?.employeeId) params.employeeId = options.employeeId;
    if (options?.status) params.status = options.status;
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<ShiftAssignment[]>(API_ENDPOINTS.shifts.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return { success: false, error: "Fehler beim Abrufen der Schichten", data: [] as ShiftAssignment[] };
  }
}

// Schichten für ein bestimmtes Datum abrufen
export async function getShiftsByDate(date: string) {
  try {
    const response = await get<ShiftAssignment[]>(API_ENDPOINTS.shifts.getByDate(date));
    return response;
  } catch (error) {
    console.error(`Error fetching shifts for date ${date}:`, error);
    return { success: false, error: "Fehler beim Abrufen der Schichten für das angegebene Datum", data: [] as ShiftAssignment[] };
  }
}

// Schichten für einen bestimmten Mitarbeiter abrufen
export async function getShiftsByEmployee(employeeId: string) {
  try {
    const response = await get<ShiftAssignment[]>(API_ENDPOINTS.shifts.getByEmployee(employeeId));
    return response;
  } catch (error) {
    console.error(`Error fetching shifts for employee ${employeeId}:`, error);
    return { success: false, error: "Fehler beim Abrufen der Schichten für den Mitarbeiter", data: [] as ShiftAssignment[] };
  }
}

// Neue Schicht erstellen
export async function createShift(shift: ShiftAssignment) {
  try {
    const response = await post<ShiftAssignment>(API_ENDPOINTS.shifts.create, shift);
    return response;
  } catch (error) {
    console.error("Error creating shift:", error);
    return { success: false, error: "Fehler beim Erstellen der Schicht" };
  }
}

// Mehrere Schichten erstellen (für Batch-Import)
export async function createShiftsBatch(shifts: ShiftAssignment[]) {
  try {
    const response = await post<ShiftAssignment[]>(API_ENDPOINTS.shifts.createBatch, shifts);
    return response;
  } catch (error) {
    console.error("Error creating shift batch:", error);
    return { success: false, error: "Fehler beim Erstellen der Schichten", data: [] as ShiftAssignment[] };
  }
}

// Schicht aktualisieren
export async function updateShift(id: string, shift: ShiftAssignment) {
  try {
    const response = await put<ShiftAssignment>(API_ENDPOINTS.shifts.update(id), shift);
    return response;
  } catch (error) {
    console.error(`Error updating shift with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Aktualisieren der Schicht" };
  }
}

// Schicht löschen
export async function deleteShift(id: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.shifts.delete(id));
  } catch (error) {
    console.error(`Error deleting shift with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Löschen der Schicht" };
  }
}

// Schichten für einen Tag löschen
export async function deleteShiftsByDate(date: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.shifts.deleteByDate(date));
  } catch (error) {
    console.error(`Error deleting shifts for date ${date}:`, error);
    return { success: false, error: "Fehler beim Löschen der Schichten für das angegebene Datum" };
  }
}

// Schichtplan generieren
export async function generateShiftPlan(planRequest: ShiftPlanRequest) {
  try {
    const response = await post<ShiftPlanResponse>(API_ENDPOINTS.shifts.generatePlan, planRequest);
    return response;
  } catch (error) {
    console.error("Error generating shift plan:", error);
    return { 
      success: false, 
      error: "Fehler beim Generieren des Schichtplans", 
      data: {
        date: planRequest.date,
        assignments: [],
        unassignedEmployees: [],
        waveDistribution: {}
      } as ShiftPlanResponse 
    };
  }
}

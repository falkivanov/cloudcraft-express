
import { Employee } from '@/types/employee';
import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, EmployeeBatchResponse } from '../types';

// Alle Mitarbeiter abrufen
export async function getAllEmployees(options?: { 
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  try {
    const params: Record<string, string> = {};
    
    if (options?.status) params.status = options.status;
    if (options?.search) params.search = options.search;
    if (options?.skip) params.skip = options.skip.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const response = await get<Employee[]>(API_ENDPOINTS.employees.getAll, params);
    return response;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: "Fehler beim Abrufen der Mitarbeiter", data: [] as Employee[] };
  }
}

// Einzelnen Mitarbeiter abrufen
export async function getEmployeeById(id: string) {
  try {
    const response = await get<Employee>(API_ENDPOINTS.employees.getById(id));
    return response;
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Abrufen des Mitarbeiters" };
  }
}

// Neuen Mitarbeiter erstellen
export async function createEmployee(employee: Employee) {
  try {
    const response = await post<Employee>(API_ENDPOINTS.employees.create, employee);
    return response;
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Fehler beim Erstellen des Mitarbeiters" };
  }
}

// Mehrere Mitarbeiter erstellen (für Import)
export async function createEmployeesBatch(employees: Employee[]) {
  try {
    const response = await post<EmployeeBatchResponse>(API_ENDPOINTS.employees.createBatch, employees);
    return response;
  } catch (error) {
    console.error("Error creating employee batch:", error);
    return { 
      success: false, 
      error: "Fehler beim Importieren der Mitarbeiter",
      data: { success: false, message: "Import fehlgeschlagen", created: [], skipped: 0 } 
    } as ApiResponse<EmployeeBatchResponse>;
  }
}

// Mitarbeiter aktualisieren
export async function updateEmployee(id: string, employee: Employee) {
  try {
    const response = await put<Employee>(API_ENDPOINTS.employees.update(id), employee);
    return response;
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Aktualisieren des Mitarbeiters" };
  }
}

// Mitarbeiter löschen
export async function deleteEmployee(id: string) {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.delete(id));
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    return { success: false, error: "Fehler beim Löschen des Mitarbeiters" };
  }
}

// Alle Mitarbeiter löschen
export async function deleteAllEmployees() {
  try {
    return await del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.deleteAll);
  } catch (error) {
    console.error("Error deleting all employees:", error);
    return { success: false, error: "Fehler beim Löschen aller Mitarbeiter" };
  }
}

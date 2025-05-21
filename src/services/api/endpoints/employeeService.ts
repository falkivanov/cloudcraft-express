
import { Employee } from '@/types/employee';
import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../config';

// Alle Mitarbeiter abrufen
export async function getAllEmployees(options?: { 
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}) {
  const params: Record<string, string> = {};
  
  if (options?.status) params.status = options.status;
  if (options?.search) params.search = options.search;
  if (options?.skip) params.skip = options.skip.toString();
  if (options?.limit) params.limit = options.limit.toString();
  
  return get<Employee[]>(API_ENDPOINTS.employees.getAll, params);
}

// Einzelnen Mitarbeiter abrufen
export async function getEmployeeById(id: string) {
  return get<Employee>(API_ENDPOINTS.employees.getById(id));
}

// Neuen Mitarbeiter erstellen
export async function createEmployee(employee: Employee) {
  return post<Employee>(API_ENDPOINTS.employees.create, employee);
}

// Mehrere Mitarbeiter erstellen (für Import)
export async function createEmployeesBatch(employees: Employee[]) {
  return post<{ 
    success: boolean; 
    message: string; 
    created: Employee[]; 
    skipped: number;
  }>(API_ENDPOINTS.employees.createBatch, employees);
}

// Mitarbeiter aktualisieren
export async function updateEmployee(id: string, employee: Employee) {
  return put<Employee>(API_ENDPOINTS.employees.update(id), employee);
}

// Mitarbeiter löschen
export async function deleteEmployee(id: string) {
  return del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.delete(id));
}

// Alle Mitarbeiter löschen
export async function deleteAllEmployees() {
  return del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.deleteAll);
}

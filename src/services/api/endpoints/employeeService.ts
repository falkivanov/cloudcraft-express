
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
  const params: Record<string, string> = {};
  
  if (options?.status) params.status = options.status;
  if (options?.search) params.search = options.search;
  if (options?.skip) params.skip = options.skip.toString();
  if (options?.limit) params.limit = options.limit.toString();
  
  const response = await get<Employee[]>(API_ENDPOINTS.employees.getAll, params);
  return response.data || [];
}

// Einzelnen Mitarbeiter abrufen
export async function getEmployeeById(id: string) {
  const response = await get<Employee>(API_ENDPOINTS.employees.getById(id));
  return response.data;
}

// Neuen Mitarbeiter erstellen
export async function createEmployee(employee: Employee) {
  const response = await post<Employee>(API_ENDPOINTS.employees.create, employee);
  return response.data;
}

// Mehrere Mitarbeiter erstellen (für Import)
export async function createEmployeesBatch(employees: Employee[]) {
  const response = await post<EmployeeBatchResponse>(API_ENDPOINTS.employees.createBatch, employees);
  return response.data;
}

// Mitarbeiter aktualisieren
export async function updateEmployee(id: string, employee: Employee) {
  const response = await put<Employee>(API_ENDPOINTS.employees.update(id), employee);
  return response.data;
}

// Mitarbeiter löschen
export async function deleteEmployee(id: string) {
  return del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.delete(id));
}

// Alle Mitarbeiter löschen
export async function deleteAllEmployees() {
  return del<{ success: boolean; message: string }>(API_ENDPOINTS.employees.deleteAll);
}

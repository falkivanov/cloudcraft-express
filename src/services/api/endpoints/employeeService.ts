
import { Employee } from '@/types/employee';
import { get, post, put, del } from '../client';
import { API_ENDPOINTS } from '../config';

// Wir müssen das API_ENDPOINTS-Objekt um employee-Endpunkte erweitern
const EMPLOYEE_ENDPOINTS = {
  getAll: '/api/v1/employees',
  getById: (id: string) => `/api/v1/employees/${id}`,
  create: '/api/v1/employees',
  createBatch: '/api/v1/employees/batch',
  update: (id: string) => `/api/v1/employees/${id}`,
  delete: (id: string) => `/api/v1/employees/${id}`,
  deleteAll: '/api/v1/employees',
};

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
  
  return get<Employee[]>(EMPLOYEE_ENDPOINTS.getAll, params);
}

// Einzelnen Mitarbeiter abrufen
export async function getEmployeeById(id: string) {
  return get<Employee>(EMPLOYEE_ENDPOINTS.getById(id));
}

// Neuen Mitarbeiter erstellen
export async function createEmployee(employee: Employee) {
  return post<Employee>(EMPLOYEE_ENDPOINTS.create, employee);
}

// Mehrere Mitarbeiter erstellen (für Import)
export async function createEmployeesBatch(employees: Employee[]) {
  return post<{ 
    success: boolean; 
    message: string; 
    created: Employee[]; 
    skipped: number;
  }>(EMPLOYEE_ENDPOINTS.createBatch, employees);
}

// Mitarbeiter aktualisieren
export async function updateEmployee(id: string, employee: Employee) {
  return put<Employee>(EMPLOYEE_ENDPOINTS.update(id), employee);
}

// Mitarbeiter löschen
export async function deleteEmployee(id: string) {
  return del<{ success: boolean; message: string }>(EMPLOYEE_ENDPOINTS.delete(id));
}

// Alle Mitarbeiter löschen
export async function deleteAllEmployees() {
  return del<{ success: boolean; message: string }>(EMPLOYEE_ENDPOINTS.deleteAll);
}

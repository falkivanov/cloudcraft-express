
/**
 * API-Service-Haupteinstiegspunkt
 * 
 * Exportiert alle API-bezogenen Dienste und Funktionen.
 */

// Re-export der Konfiguration
export * from './config';

// Re-export der Typen
export * from './types';

// Re-export des Basis-Clients
export * from './client';

// Re-export der Domain-spezifischen Services
export * from './endpoints/pdfService';
// Import scorecardService explicitly to avoid naming conflicts
import * as scorecardService from './endpoints/scorecardService';
export { scorecardService };
export * from './endpoints/employeeService';
export * from './endpoints/shiftService';
export * from './endpoints/vehicleService';
export * from './endpoints/qualityService';

// Import der Typen
import { Employee } from '@/types/employee';
import { ShiftAssignment, ShiftPlanRequest, ShiftPlanResponse } from '@/types/shift';
import { Vehicle, RepairEntry, Appointment } from '@/types/vehicle';
import { ApiResponse, EmployeeBatchResponse, ShiftBatchResponse } from './types';

// Liste der verfügbaren API-Funktionen für die vereinfachte Verwendung
export const api = {
  // System
  checkHealth: () => import('./client').then(m => m.checkApiHealth()),
  
  // PDF-Verarbeitung
  pdf: {
    upload: (file: File, options?: { extractText?: boolean, extractStructure?: boolean }) => 
      import('./endpoints/pdfService').then(m => m.uploadPDF(file, options)),
      
    extractText: (file: File) => 
      import('./endpoints/pdfService').then(m => m.extractTextFromPDF(file)),
      
    extractStructure: (file: File) => 
      import('./endpoints/pdfService').then(m => m.extractStructureFromPDF(file))
  },
  
  // Scorecard-spezifische Funktionen
  scorecard: {
    extract: (file: File) => 
      import('./endpoints/scorecardService').then(m => m.extractScorecardFromPDF(file)),
      
    extractDrivers: (text: string, pageData?: Record<number, any>) => 
      import('./endpoints/scorecardService').then(m => m.extractDriverKPIs(text, pageData)),
      
    extractCompany: (text: string, pageData?: Record<number, any>) => 
      import('./endpoints/scorecardService').then(m => m.extractCompanyKPIs(text, pageData)),
      
    extractMetadata: (text: string, filename: string) => 
      import('./endpoints/scorecardService').then(m => m.extractMetadata(text, filename))
  },
  
  // Mitarbeiter-Funktionen
  employees: {
    getAll: (options?: { status?: string; search?: string; skip?: number; limit?: number }) =>
      import('./endpoints/employeeService').then(m => m.getAllEmployees(options)),
      
    getById: (id: string) =>
      import('./endpoints/employeeService').then(m => m.getEmployeeById(id)),
      
    create: (employee: Employee) =>
      import('./endpoints/employeeService').then(m => m.createEmployee(employee)),
      
    createBatch: (employees: Employee[]) =>
      import('./endpoints/employeeService').then(m => m.createEmployeesBatch(employees)),
      
    update: (id: string, employee: Employee) =>
      import('./endpoints/employeeService').then(m => m.updateEmployee(id, employee)),
      
    delete: (id: string) =>
      import('./endpoints/employeeService').then(m => m.deleteEmployee(id)),
      
    deleteAll: () =>
      import('./endpoints/employeeService').then(m => m.deleteAllEmployees())
  },
  
  // Schichtplanung-Funktionen
  shifts: {
    getAll: (options?: { startDate?: string; endDate?: string; employeeId?: string; status?: string; skip?: number; limit?: number }) =>
      import('./endpoints/shiftService').then(m => m.getAllShifts(options)),
      
    getByDate: (date: string) =>
      import('./endpoints/shiftService').then(m => m.getShiftsByDate(date)),
      
    getByEmployee: (employeeId: string) =>
      import('./endpoints/shiftService').then(m => m.getShiftsByEmployee(employeeId)),
      
    create: (shift: ShiftAssignment) =>
      import('./endpoints/shiftService').then(m => m.createShift(shift)),
      
    createBatch: (shifts: ShiftAssignment[]) =>
      import('./endpoints/shiftService').then(m => m.createShiftsBatch(shifts)),
      
    update: (id: string, shift: ShiftAssignment) =>
      import('./endpoints/shiftService').then(m => m.updateShift(id, shift)),
      
    delete: (id: string) =>
      import('./endpoints/shiftService').then(m => m.deleteShift(id)),
      
    deleteByDate: (date: string) =>
      import('./endpoints/shiftService').then(m => m.deleteShiftsByDate(date)),
      
    generatePlan: (planRequest: ShiftPlanRequest) =>
      import('./endpoints/shiftService').then(m => m.generateShiftPlan(planRequest))
  },
  
  // Fahrzeugverwaltung
  vehicles: {
    getAll: (options?: { status?: string; brand?: string; search?: string; skip?: number; limit?: number }) =>
      import('./endpoints/vehicleService').then(m => m.getAllVehicles(options)),
      
    getById: (id: string) =>
      import('./endpoints/vehicleService').then(m => m.getVehicleById(id)),
      
    create: (vehicle: Omit<Vehicle, "id">) =>
      import('./endpoints/vehicleService').then(m => m.createVehicle(vehicle)),
      
    createBatch: (vehicles: Omit<Vehicle, "id">[]) =>
      import('./endpoints/vehicleService').then(m => m.createVehiclesBatch(vehicles)),
      
    update: (id: string, vehicle: Vehicle) =>
      import('./endpoints/vehicleService').then(m => m.updateVehicle(id, vehicle)),
      
    delete: (id: string) =>
      import('./endpoints/vehicleService').then(m => m.deleteVehicle(id)),
      
    // Reparaturen
    repairs: {
      getAll: (options?: { startDate?: string; endDate?: string; vehicleId?: string; skip?: number; limit?: number }) =>
        import('./endpoints/vehicleService').then(m => m.getAllRepairs(options)),
        
      add: (vehicleId: string, repair: Omit<RepairEntry, "id" | "date" | "duration">) =>
        import('./endpoints/vehicleService').then(m => m.addRepair(vehicleId, repair)),
        
      update: (repairId: string, repair: Partial<RepairEntry>) =>
        import('./endpoints/vehicleService').then(m => m.updateRepair(repairId, repair)),
        
      delete: (repairId: string) =>
        import('./endpoints/vehicleService').then(m => m.deleteRepair(repairId))
    },
      
    // Termine
    appointments: {
      getAll: (options?: { startDate?: string; endDate?: string; vehicleId?: string; completed?: boolean; skip?: number; limit?: number }) =>
        import('./endpoints/vehicleService').then(m => m.getAllAppointments(options)),
        
      add: (vehicleId: string, appointment: Omit<Appointment, "id">) =>
        import('./endpoints/vehicleService').then(m => m.addAppointment(vehicleId, appointment)),
        
      update: (appointmentId: string, appointment: Partial<Appointment>) =>
        import('./endpoints/vehicleService').then(m => m.updateAppointment(appointmentId, appointment)),
        
      delete: (appointmentId: string) =>
        import('./endpoints/vehicleService').then(m => m.deleteAppointment(appointmentId))
    },
      
    // Fahrzeugzuweisungen
    assignments: {
      getAll: (options?: { date?: string; vehicleId?: string; employeeId?: string; skip?: number; limit?: number }) =>
        import('./endpoints/vehicleService').then(m => m.getVehicleAssignments(options)),
        
      create: (assignment: { vehicleId: string; employeeId: string; date: string; assignedBy: string }) =>
        import('./endpoints/vehicleService').then(m => m.createVehicleAssignment(assignment)),
        
      delete: (assignmentId: string) =>
        import('./endpoints/vehicleService').then(m => m.deleteVehicleAssignment(assignmentId))
    }
  },
  
  // Qualitätsdaten
  quality: {
    // Scorecard-Statistiken
    getScorecardStats: (timePeriod?: string, location?: string) =>
      import('./endpoints/qualityService').then(m => m.getScorecardStatistics(timePeriod, location)),
      
    // Fahrer-Performance
    getDriverPerformance: (timePeriod?: string, metricType?: string, minScore?: number, maxScore?: number) =>
      import('./endpoints/qualityService').then(m => m.getDriverPerformance(timePeriod, metricType, minScore, maxScore)),
      
    // Kundenkontakt-Compliance
    getCustomerContactCompliance: (week?: number, year?: number) =>
      import('./endpoints/qualityService').then(m => m.getCustomerContactCompliance(week, year)),
      
    // Qualitätsberichte filtern
    filterReports: (options?: { reportType?: string; startDate?: string; endDate?: string; location?: string; search?: string }) =>
      import('./endpoints/qualityService').then(m => m.filterQualityReports(options)),
      
    // Metrik-Trends
    getMetricsTrends: (metricType: string, timePeriod?: string, location?: string) =>
      import('./endpoints/qualityService').then(m => m.getMetricsTrends(metricType, timePeriod, location))
  },
  
  // Verarbeitungsstatus
  processing: {
    checkStatus: (processingId: string) => 
      import('./endpoints/pdfService').then(m => m.checkProcessingStatus(processingId)),
      
    cancel: (processingId: string) => 
      import('./endpoints/pdfService').then(m => m.cancelProcessing(processingId))
  }
};


// Re-export utilities from specialized files
export * from './date-utils';
export * from './employee-availability';

// Import the specialized shift-status and explicitly re-export with a different name
import { hasSpecialShift as checkSpecialShift } from './shift-status';
export { checkSpecialShift };

// Export the balance-forecast/distribution-helpers with explicit naming to avoid conflicts
import { 
  assignUnderutilizedEmployeeToDay as assignEmployeeToUnderstaffedDay,
  findAvailableUnderutilizedEmployees as findAvailableEmployeesForDay
} from './passes/balance-forecast/distribution-helpers';
export { 
  assignEmployeeToUnderstaffedDay,
  findAvailableEmployeesForDay
};

// Export the new reorganized rebalancing helpers
export * from './passes/balance-forecast/helpers';

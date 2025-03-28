
// Re-export utilities from specialized files
export * from './date-utils';
export * from './employee-availability';

// Import the specialized shift-status and explicitly re-export with a different name
import { hasSpecialShift as checkSpecialShift } from './shift-status';
export { checkSpecialShift };

// Export employee assignment helpers with explicit naming to avoid conflicts
import { 
  assignUnderutilizedEmployeeToDay as assignEmployeeToUnderstaffedDay,
  findAvailableUnderutilizedEmployees as findAvailableEmployeesForDay,
  prioritizeWeekendStaffing as balanceWeekendStaffing
} from './passes/balance-forecast/helpers/employee-assignment';

export { 
  assignEmployeeToUnderstaffedDay,
  findAvailableEmployeesForDay,
  balanceWeekendStaffing
};

// Export the new reorganized rebalancing helpers
import * as rebalancingHelpers from './passes/balance-forecast/helpers';
export { rebalancingHelpers };

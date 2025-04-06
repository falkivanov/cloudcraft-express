
/**
 * Represents a single concession item
 */
export interface ConcessionItem {
  transportId: string;
  trackingId: string;
  deliveryDateTime: string;
  reason: string;
  cost: number;
}

/**
 * Represents a grouped concession by transport ID
 */
export interface GroupedConcession {
  transportId: string;
  driverName: string;  // Added this field for driver names
  count: number;
  totalCost: number;
  items: ConcessionItem[];
}

/**
 * Represents the concessions data stored in localStorage
 */
export interface ConcessionsData {
  fileName: string;
  uploadDate: string;
  currentWeek: string;
  availableWeeks: string[];
  items: ConcessionItem[];
  totalCost: number;
  weekToItems?: Record<string, ConcessionItem[]>; // Items organized by week
}

export interface ConcessionsContentProps {
  concessionsData: ConcessionsData | null;
}

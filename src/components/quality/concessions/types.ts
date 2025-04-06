
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

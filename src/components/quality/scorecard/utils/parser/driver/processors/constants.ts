
/**
 * Constants used for driver metrics processing
 */

// Metric definitions with targets and units
export const METRIC_DEFINITIONS = {
  "Delivered": { target: 0, unit: "" },
  "DCR": { target: 98.5, unit: "%" },
  "DNR DPMO": { target: 1500, unit: "DPMO" },
  "POD": { target: 98, unit: "%" },
  "CC": { target: 95, unit: "%" },
  "CE": { target: 0, unit: "" },
  "DEX": { target: 95, unit: "%" }
};

// Default column order for metrics when header isn't available
export const DEFAULT_METRIC_ORDER = [
  "Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"
];

// Default fallback cell indexes for specific metrics
export const FALLBACK_CELL_INDEXES = {
  "Delivered": 1,
  "DCR": 2,
  "DNR DPMO": 3,
  "POD": 4,
  "CC": 5,
  "CE": 6,
  "DEX": 7
};

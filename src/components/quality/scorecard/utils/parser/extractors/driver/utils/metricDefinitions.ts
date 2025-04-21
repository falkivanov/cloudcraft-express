
/**
 * Default definitions for metrics
 */
export const METRIC_NAMES = ["Delivered", "DCR", "DNR DPMO", "LoR DPMO", "POD", "CC", "CE", "DEX"];
export const METRIC_TARGETS = [0, 98.5, 1500, 1000, 98, 95, 0, 95];
export const METRIC_UNITS = ["", "%", "DPMO", "DPMO", "%", "%", "", "%"];

// Function to get the pre-KW14 metric setup (without LoR DPMO)
export const getLegacyMetricNames = () => ["Delivered", "DCR", "DNR DPMO", "POD", "CC", "CE", "DEX"];
export const getLegacyMetricTargets = () => [0, 98.5, 1500, 98, 95, 0, 95];
export const getLegacyMetricUnits = () => ["", "%", "DPMO", "%", "%", "", "%"];


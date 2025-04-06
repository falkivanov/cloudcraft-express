
import { METRIC_DEFINITIONS } from './constants';
import { determineStatus } from '../../../helpers/statusHelper';
import { extractNumeric } from '../../extractors/driver/structural/valueExtractor';

/**
 * Helper function to get the target value for a metric
 */
export function getTargetForMetric(metricName: string): number {
  return METRIC_DEFINITIONS[metricName]?.target || 0;
}

/**
 * Helper function to get the unit for a metric
 */
export function getUnitForMetric(metricName: string): string {
  return METRIC_DEFINITIONS[metricName]?.unit || "";
}

/**
 * Create a metric object from a value string
 */
export function createMetricFromValue(metricName: string, valueStr: string) {
  if (valueStr === "-") {
    return {
      name: metricName,
      value: 0,
      target: getTargetForMetric(metricName),
      unit: getUnitForMetric(metricName),
      status: "none" as const
    };
  } else {
    // Extract value without any transformations
    const value = extractNumeric(valueStr);
    return {
      name: metricName,
      value,
      target: getTargetForMetric(metricName),
      unit: getUnitForMetric(metricName),
      status: determineStatus(metricName, value)
    };
  }
}


/**
 * Main data provider for Scorecard data
 * Re-exports all utilities from utility files
 */

// Re-export utilities from their respective files
export { parseWeekIdentifier, isDataAvailableForWeek } from './utils/weekIdentifier';
export { getDataFunctionForWeek } from './utils/dataFetcher';
export { getAllAvailableWeeks } from './utils/weeksDiscovery';
export { getScorecardData, getPreviousWeekData } from './utils/dataProvider';
export { getNextWeekIdentifier, getPreviousWeekIdentifier, hasNextWeekData } from './utils/adjacentWeeks';


import { ScoreCardData } from '../../../types';
import { extractWeekFromFilename } from '../weekUtils';
import { createBasicScorecard } from './basicScorecard';
import { extractStructuredScorecard } from './structuredExtractor';

/**
 * Create a simple scorecard with basic data
 * @param weekNum The week number for the scorecard
 * @returns A simple ScoreCardData object
 */
export const createSimpleScorecard = (weekNum: number): ScoreCardData => {
  return createBasicScorecard(weekNum);
};

export { extractStructuredScorecard };

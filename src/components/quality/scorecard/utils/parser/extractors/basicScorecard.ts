
import { ScoreCardData } from '../../../types';
import { KPIStatus } from '../../helpers/statusHelper';

/**
 * Create a basic scorecard with sample data
 * @param weekNum The week number for the scorecard
 * @returns A simple ScoreCardData object
 */
export const createBasicScorecard = (weekNum: number): ScoreCardData => {
  const currentYear = new Date().getFullYear();
  
  return {
    week: weekNum,
    year: currentYear,
    location: 'DSU1',
    overallScore: 85,
    overallStatus: 'Great',
    rank: 5,
    rankNote: 'Up 2 places from last week',
    companyKPIs: [
      {
        name: 'Delivery Completion Rate (DCR)',
        value: 98.5,
        target: 98.0,
        unit: '%',
        trend: 'up',
        status: 'fantastic' as KPIStatus
      },
      {
        name: 'Delivered Not Received (DNR DPMO)',
        value: 2500,
        target: 3000,
        unit: 'DPMO',
        trend: 'down',
        status: 'great' as KPIStatus
      },
      {
        name: 'Contact Compliance',
        value: 92,
        target: 95,
        unit: '%',
        trend: 'up',
        status: 'fair' as KPIStatus
      }
    ],
    driverKPIs: [
      {
        name: 'TR-001',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 98, target: 100, unit: '%', status: 'great' as KPIStatus },
          { name: 'DNR DPMO', value: 2500, target: 3000, unit: 'DPMO', status: 'great' as KPIStatus },
          { name: 'Contact Compliance', value: 92, target: 95, unit: '%', status: 'fair' as KPIStatus }
        ]
      },
      {
        name: 'TR-002',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 99, target: 100, unit: '%', status: 'fantastic' as KPIStatus },
          { name: 'DNR DPMO', value: 2000, target: 3000, unit: 'DPMO', status: 'fantastic' as KPIStatus },
          { name: 'Contact Compliance', value: 96, target: 95, unit: '%', status: 'fantastic' as KPIStatus }
        ]
      }
    ],
    recommendedFocusAreas: ['Contact Compliance', 'DNR DPMO'],
  };
};

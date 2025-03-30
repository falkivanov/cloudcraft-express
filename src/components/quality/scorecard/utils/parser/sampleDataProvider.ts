
import { ScoreCardData } from '../../types';

/**
 * Helper to get sample data with a specific week number
 * @param weekNum The week number to use in the sample data
 * @returns A ScoreCardData object with sample data
 */
export async function getSampleDataWithWeek(weekNum: number): Promise<ScoreCardData> {
  return {
    week: weekNum,
    year: new Date().getFullYear(),
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
        status: 'fantastic'
      },
      {
        name: 'Delivered Not Received (DNR DPMO)',
        value: 2500,
        target: 3000,
        unit: 'DPMO',
        trend: 'down',
        status: 'great'
      },
      {
        name: 'Contact Compliance',
        value: 92,
        target: 95,
        unit: '%',
        trend: 'up',
        status: 'fair'
      }
    ],
    driverKPIs: [
      {
        name: 'TR-001',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 98, target: 100, unit: '%', status: 'great' },
          { name: 'DNR DPMO', value: 2500, target: 3000, unit: 'DPMO', status: 'great' },
          { name: 'Contact Compliance', value: 92, target: 95, unit: '%', status: 'fair' }
        ]
      },
      {
        name: 'TR-002',
        status: 'active',
        metrics: [
          { name: 'Delivered', value: 99, target: 100, unit: '%', status: 'fantastic' },
          { name: 'DNR DPMO', value: 2000, target: 3000, unit: 'DPMO', status: 'fantastic' },
          { name: 'Contact Compliance', value: 96, target: 95, unit: '%', status: 'fantastic' }
        ]
      }
    ],
    recommendedFocusAreas: ['Contact Compliance', 'DNR DPMO'],
  };
}

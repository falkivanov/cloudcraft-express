
import { DriverKPI } from '../../../../types';

/**
 * Generate diverse sample driver data with realistic values
 */
export const generateSampleDrivers = (): DriverKPI[] => {
  // Create more diverse driver IDs
  const driverIdPatterns = [
    // Amazon-style driver IDs
    'A1RBHQXDC55B', 'A2NPJR1DNCQSWT', 'A3NRSY7GUNAC6L', 
    'A1ON8E0ODQHBPK', 'A2QQ7SAZ5YNVFY', 'A3DIG631DG25QY',
    'A2V82R55OSFX13', 'A10PTSFT1G664', 'AKLXATMRADBNI',
    'A35YAZ4QX53UUC', 'A81RBHQXDC55B', 'ACYZ1MJ3N1Y6L',
    
    // TR-style driver IDs
    'TR-001', 'TR-002', 'TR-003', 'TR-004', 'TR-005'
  ];
  
  // Create a diverse set of driver data
  return driverIdPatterns.map((driverId, index) => {
    // Generate different score patterns for different drivers
    const scorePattern = index % 4; // 0 = excellent, 1 = good, 2 = average, 3 = needs improvement
    
    // Base values that will be adjusted by pattern
    let dcrBase = 98.0;
    let dnrDpmoBase = 1200;
    let podBase = 98.5;
    let ccBase = 93;
    let ceBase = 0;
    let dexBase = 96;
    
    // Adjust metrics based on pattern
    switch (scorePattern) {
      case 0: // Excellent driver
        dcrBase = 99.2 + (Math.random() * 0.8); // 99.2 - 100
        dnrDpmoBase = 300 + (Math.random() * 400); // 300 - 700
        podBase = 99.5 + (Math.random() * 0.5); // 99.5 - 100
        ccBase = 97 + (Math.random() * 3); // 97 - 100
        ceBase = 0; // Perfect CE
        dexBase = 98 + (Math.random() * 2); // 98 - 100
        break;
      case 1: // Good driver
        dcrBase = 98.5 + (Math.random() * 1.0); // 98.5 - 99.5
        dnrDpmoBase = 800 + (Math.random() * 400); // 800 - 1200
        podBase = 98.8 + (Math.random() * 0.8); // 98.8 - 99.6
        ccBase = 94 + (Math.random() * 4); // 94 - 98
        ceBase = Math.random() < 0.7 ? 0 : 1; // Mostly 0, sometimes 1
        dexBase = 96 + (Math.random() * 3); // 96 - 99
        break;
      case 2: // Average driver
        dcrBase = 97.5 + (Math.random() * 1.0); // 97.5 - 98.5
        dnrDpmoBase = 1300 + (Math.random() * 500); // 1300 - 1800
        podBase = 97.5 + (Math.random() * 1.0); // 97.5 - 98.5
        ccBase = 90 + (Math.random() * 4); // 90 - 94
        ceBase = Math.random() < 0.5 ? 1 : 2; // 50% chance of 1 or 2
        dexBase = 94 + (Math.random() * 2); // 94 - 96
        break;
      case 3: // Needs improvement
        dcrBase = 96.0 + (Math.random() * 1.5); // 96 - 97.5
        dnrDpmoBase = 1800 + (Math.random() * 700); // 1800 - 2500
        podBase = 96.0 + (Math.random() * 1.5); // 96 - 97.5
        ccBase = 85 + (Math.random() * 5); // 85 - 90
        ceBase = Math.random() < 0.3 ? 2 : 3; // Usually 3, sometimes 2
        dexBase = 92 + (Math.random() * 2); // 92 - 94
        break;
    }
    
    // Round values to appropriate precision
    const dcr = parseFloat(dcrBase.toFixed(2));
    const dnrDpmo = Math.round(dnrDpmoBase);
    const pod = parseFloat(podBase.toFixed(2));
    const cc = parseFloat(ccBase.toFixed(2));
    const ce = Math.round(ceBase);
    const dex = parseFloat(dexBase.toFixed(2));
    
    return {
      name: driverId,
      status: "active",
      metrics: [
        {
          name: "Delivered",
          value: 95 + (index % 5),
          target: 0,
          unit: "",
          status: "great"
        },
        {
          name: "DCR",
          value: dcr,
          target: 98.5,
          unit: "%",
          status: dcr >= 98.5 ? "fantastic" : dcr >= 97.5 ? "great" : "fair"
        },
        {
          name: "DNR DPMO",
          value: dnrDpmo,
          target: 1500,
          unit: "DPMO",
          status: dnrDpmo <= 1000 ? "fantastic" : dnrDpmo <= 1500 ? "great" : "fair"
        },
        {
          name: "POD",
          value: pod,
          target: 98,
          unit: "%",
          status: pod >= 99 ? "fantastic" : pod >= 98 ? "great" : "fair"
        },
        {
          name: "CC",
          value: cc,
          target: 95,
          unit: "%",
          status: cc >= 95 ? "fantastic" : cc >= 90 ? "great" : "fair"
        },
        {
          name: "CE",
          value: ce,
          target: 0,
          unit: "",
          status: ce === 0 ? "fantastic" : ce <= 1 ? "great" : "fair"
        },
        {
          name: "DEX",
          value: dex,
          target: 95,
          unit: "%",
          status: dex >= 97 ? "fantastic" : dex >= 95 ? "great" : "fair"
        }
      ]
    };
  });
};

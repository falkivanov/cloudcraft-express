
import { ScoreCardData } from "../types";

// Get data for KW 6 2025
export const getWeek6Data = (): ScoreCardData => {
  return {
    week: 6,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 71.39,
    overallStatus: "Great",
    rank: 5,
    rankNote: "+2 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 98.04, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 751, target: 800, unit: "", trend: "up", status: "fair" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 15, target: 10, unit: "", trend: "down", status: "fair" },
      { name: "Mentor Adoption Rate", value: 73.39, target: 80, unit: "%", trend: "up", status: "fair" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 84.78, target: 100, unit: "%", trend: "up", status: "poor" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 48, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.07, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.55, target: 99, unit: "%", trend: "up", status: "great" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1371, target: 1100, unit: "", trend: "down", status: "fair" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.59, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 88.68, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 108.04, target: 100, unit: "%", trend: "up", status: "fantastic" },
    ],
    driverKPIs: [
      // Using placeholder driver data - could be updated with actual driver data if available
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 960, target: 0, unit: "" },
          { name: "DCR", value: 98.55, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1371, target: 1100, unit: "", status: "fair" },
          { name: "POD", value: 98.59, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 88.68, target: 98, unit: "%", status: "poor" }
        ]
      },
    ],
    recommendedFocusAreas: [
      "Working Hours Compliance (WHC)",
      "Contact Compliance",
      "Delivered Not Received (DNR DPMO)"
    ],
    sectionRatings: {
      complianceAndSafety: "Fair",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};

// Get data for KW 7 2025
export const getWeek7Data = (): ScoreCardData => {
  return {
    week: 7,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 69.71,
    overallStatus: "Great",
    rank: 5,
    rankNote: "0 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 100, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 766, target: 800, unit: "", trend: "up", status: "fair" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 12, target: 10, unit: "", trend: "down", status: "great" },
      { name: "Mentor Adoption Rate", value: 76.33, target: 80, unit: "%", trend: "up", status: "great" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 96, target: 100, unit: "%", trend: "up", status: "great" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 21, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.3, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.15, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1752, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.9, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 85.62, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 103.83, target: 100, unit: "%", trend: "up", status: "fantastic" },
    ],
    driverKPIs: [
      // Using placeholder driver data
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 980, target: 0, unit: "" },
          { name: "DCR", value: 98.15, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1752, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.9, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 85.62, target: 98, unit: "%", status: "poor" }
        ]
      },
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance",
      "Delivery Completion Rate (DCR)"
    ],
    sectionRatings: {
      complianceAndSafety: "Great",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};

// Get data for KW 8 2025
export const getWeek8Data = (): ScoreCardData => {
  return {
    week: 8,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 72.44,
    overallStatus: "Great",
    rank: 6,
    rankNote: "-1 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 100, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 790, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 10, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 85.85, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 95.83, target: 100, unit: "%", trend: "up", status: "fair" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 21, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.41, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.35, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 2067, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.85, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 86.52, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 100, target: 100, unit: "%", trend: "up", status: "fantastic" },
    ],
    driverKPIs: [
      // Using placeholder driver data
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 98.35, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2067, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.85, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 86.52, target: 98, unit: "%", status: "poor" }
        ]
      },
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance",
      "Delivery Completion Rate (DCR)"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};

// Get data for KW 9 2025
export const getWeek9Data = (): ScoreCardData => {
  return {
    week: 9,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 68.84,
    overallStatus: "Great",
    rank: 6,
    rankNote: "0 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 98.04, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Safe Driving Metric (FICO)", value: 800, target: 800, unit: "", trend: "up", status: "fantastic" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 86.54, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 95.65, target: 100, unit: "%", trend: "up", status: "fair" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 61, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.04, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.16, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 2220, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.17, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 86.95, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 97.16, target: 100, unit: "%", trend: "up", status: "great" },
    ],
    driverKPIs: [
      // Using placeholder driver data
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1010, target: 0, unit: "" },
          { name: "DCR", value: 98.16, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2220, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.17, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 86.95, target: 98, unit: "%", status: "poor" }
        ]
      },
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Contact Compliance",
      "Delivery Completion Rate (DCR)"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Poor",
      capacity: "Great"
    },
    currentWeekTips: "Coming Soon"
  };
};

// Dummy data for Week 10 (existing function)
export const getDummyScoreCardData = (): ScoreCardData => {
  return {
    week: 10,
    year: 2025,
    location: "MASC at DSU1",
    overallScore: 75.01,
    overallStatus: "Great",
    rank: 6,
    rankNote: "0 WoW",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 97.92, target: 98, unit: "%", trend: "up", status: "great" },
      { name: "Safe Driving Metric (FICO)", value: 795, target: 800, unit: "", trend: "up", status: "great" },
      { name: "DVIC Compliance", value: 100, target: 95, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 8, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 85.64, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 100, target: 100, unit: "%", trend: "up", status: "fantastic" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 40, target: 0, unit: "", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 94.82, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.32, target: 99, unit: "%", trend: "up", status: "fair" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1939, target: 1100, unit: "", trend: "down", status: "poor" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.35, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 91.61, target: 98, unit: "%", trend: "up", status: "fair" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 100.51, target: 100, unit: "%", trend: "up", status: "fantastic" },
    ],
    driverKPIs: [
      { 
        name: "A10PTFSFT1G664", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 1057, target: 0, unit: "" },
          { name: "DCR", value: 98.88, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2838, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 99.54, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 89.36, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A13INOOSIM0DQP", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 995, target: 0, unit: "" },
          { name: "DCR", value: 99.8, target: 99, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 2010, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.77, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 50, target: 98, unit: "%", status: "poor" }
        ]
      },
      { 
        name: "A152NJUHX8M2KZ", 
        status: "active",
        metrics: [
          { name: "Delivered", value: 740, target: 0, unit: "" },
          { name: "DCR", value: 97.24, target: 99, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 4054, target: 1100, unit: "", status: "poor" },
          { name: "POD", value: 98.84, target: 97, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 9.09, target: 98, unit: "%", status: "poor" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Delivered Not Received (DNR DPMO)",
      "Delivery Completion Rate (DCR)",
      "Contact Compliance"
    ],
    sectionRatings: {
      complianceAndSafety: "Fantastic",
      qualityAndSWC: "Fair",
      capacity: "Fantastic"
    },
    currentWeekTips: "Coming Soon"
  };
};

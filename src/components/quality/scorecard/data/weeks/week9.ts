
import { ScoreCardData } from "../../types";

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
          { name: "Contact Compliance", value: 86.95, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 61, target: 0, unit: "", status: "great" },
          { name: "DEX", value: 95.04, target: 85, unit: "%", status: "fantastic" }
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

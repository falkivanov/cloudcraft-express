
import { ScoreCardData } from "../../types";

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
      { name: "Customer escalation DPMO", value: 48, target: 0, unit: "DPMO", trend: "down", status: "great" },
      { name: "Customer Delivery Feedback", value: 95.07, target: 85, unit: "%", trend: "up", status: "fantastic" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.55, target: 99, unit: "%", trend: "up", status: "great" },
      { name: "Delivered Not Received (DNR DPMO)", value: 1371, target: 1100, unit: "DPMO", trend: "down", status: "fair" },
      { name: "Lost on Road (LoR) DPMO)", value: 370, target: 350, unit: "", trend: "down", status: "fair" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.59, target: 97, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 88.68, target: 98, unit: "%", trend: "up", status: "poor" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 108.04, target: 100, unit: "%", trend: "up", status: "fantastic" },
      { name: "Next Day Capacity Reliability", value: 105.3, target: 100, unit: "%", trend: "up", status: "fantastic" },
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
          { name: "Contact Compliance", value: 88.68, target: 98, unit: "%", status: "poor" },
          { name: "CE", value: 48, target: 0, unit: "", status: "great" },
          { name: "DEX", value: 95.07, target: 85, unit: "%", status: "fantastic" }
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


import { ScoreCardData } from "../../types";

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
          { name: "DCR", value: 98.15, target: 99, unit: "%" },
          { name: "DNR DPMO", value: 1752, target: 1100, unit: "" },
          { name: "POD", value: 98.9, target: 97, unit: "%" },
          { name: "Contact Compliance", value: 85.62, target: 98, unit: "%" },
          { name: "CE", value: 21, target: 0, unit: "" },
          { name: "DEX", value: 95.3, target: 85, unit: "%" }
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

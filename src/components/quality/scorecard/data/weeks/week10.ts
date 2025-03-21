
import { ScoreCardData } from "../../types";

// Get data for KW 10 2025
export const getWeek10Data = (): ScoreCardData => {
  return {
    week: 10,
    year: 2025,
    location: "DSU1",
    overallScore: 80.5,
    overallStatus: "Great",
    rank: 6,
    rankNote: "Down 2 places from last week",
    companyKPIs: [
      // Safety KPIs
      { name: "Vehicle Audit (VSA) Compliance", value: 97.8, target: 98, unit: "%", trend: "up", status: "fair" },
      { name: "Safe Driving Metric (FICO)", value: 798, target: 800, unit: "", trend: "up", status: "fair" },
      { name: "DVIC Compliance", value: 99.5, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Speeding Event Rate (Per 100 Trips)", value: 9, target: 10, unit: "", trend: "down", status: "fantastic" },
      { name: "Mentor Adoption Rate", value: 90.5, target: 80, unit: "%", trend: "up", status: "fantastic" },
      
      // Compliance KPIs
      { name: "Breach of Contract (BOC)", value: 0, target: 0, unit: "", trend: "down", status: "none" },
      { name: "Working Hours Compliance (WHC)", value: 97.2, target: 100, unit: "%", trend: "up", status: "great" },
      { name: "Comprehensive Audit Score (CAS)", value: 100, target: 100, unit: "%", trend: "up", status: "in compliance" },
      
      // Customer Experience KPIs
      { name: "Customer escalation DPMO", value: 60, target: 50, unit: "DPMO", trend: "up", status: "fair" },
      { name: "Customer Delivery Feedback", value: 84.5, target: 85, unit: "%", trend: "up", status: "fair" },
      
      // Quality KPIs
      { name: "Delivery Completion Rate (DCR)", value: 98.5, target: 98.0, unit: "%", trend: "up", status: "fantastic" },
      { name: "Delivered Not Received (DNR DPMO)", value: 2500, target: 3000, unit: "DPMO", trend: "down", status: "great" },
      { name: "Lost on Road (LoR) DPMO", value: 380, target: 350, unit: "", trend: "down", status: "fair" },
      
      // Standard Work Compliance
      { name: "Photo-On-Delivery", value: 98.1, target: 98.0, unit: "%", trend: "up", status: "fantastic" },
      { name: "Contact Compliance", value: 92, target: 95, unit: "%", trend: "up", status: "fair" },
      
      // Capacity KPIs
      { name: "Capacity Reliability", value: 98.5, target: 98, unit: "%", trend: "up", status: "fantastic" },
      { name: "Next Day Capacity Reliability", value: 99.2, target: 100, unit: "%", trend: "up", status: "great" },
    ],
    driverKPIs: [
      {
        name: "Michael Schmidt",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1050, target: 0, unit: "", status: "none" },
          { name: "DCR", value: 99.2, target: 98.5, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 1200, target: 1500, unit: "DPMO", status: "great" },
          { name: "POD", value: 99.1, target: 98, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 97.2, target: 95, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "DPMO", status: "fantastic" },
          { name: "DEX", value: 95.4, target: 95, unit: "%", status: "fantastic" }
        ]
      },
      {
        name: "Lukas Weber",
        status: "active",
        metrics: [
          { name: "Delivered", value: 980, target: 0, unit: "", status: "none" },
          { name: "DCR", value: 98.3, target: 98.5, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1700, target: 1500, unit: "DPMO", status: "fair" },
          { name: "POD", value: 97.5, target: 98, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 94.5, target: 95, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "DPMO", status: "fantastic" },
          { name: "DEX", value: 93.2, target: 95, unit: "%", status: "fair" }
        ]
      },
      {
        name: "Emma Müller",
        status: "active",
        metrics: [
          { name: "Delivered", value: 920, target: 0, unit: "", status: "none" },
          { name: "DCR", value: 97.8, target: 98.5, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 2200, target: 1500, unit: "DPMO", status: "poor" },
          { name: "POD", value: 96.9, target: 98, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 92.3, target: 95, unit: "%", status: "fair" },
          { name: "CE", value: 1, target: 0, unit: "DPMO", status: "fair" },
          { name: "DEX", value: 91.8, target: 95, unit: "%", status: "fair" }
        ]
      },
      {
        name: "Felix Becker",
        status: "active",
        metrics: [
          { name: "Delivered", value: 1100, target: 0, unit: "", status: "none" },
          { name: "DCR", value: 99.5, target: 98.5, unit: "%", status: "fantastic" },
          { name: "DNR DPMO", value: 800, target: 1500, unit: "DPMO", status: "fantastic" },
          { name: "POD", value: 99.3, target: 98, unit: "%", status: "fantastic" },
          { name: "Contact Compliance", value: 98.7, target: 95, unit: "%", status: "fantastic" },
          { name: "CE", value: 0, target: 0, unit: "DPMO", status: "fantastic" },
          { name: "DEX", value: 97.8, target: 95, unit: "%", status: "fantastic" }
        ]
      },
      {
        name: "Sophie Wagner",
        status: "active",
        metrics: [
          { name: "Delivered", value: 970, target: 0, unit: "", status: "none" },
          { name: "DCR", value: 98.1, target: 98.5, unit: "%", status: "fair" },
          { name: "DNR DPMO", value: 1950, target: 1500, unit: "DPMO", status: "fair" },
          { name: "POD", value: 97.9, target: 98, unit: "%", status: "fair" },
          { name: "Contact Compliance", value: 93.1, target: 95, unit: "%", status: "fair" },
          { name: "CE", value: 0, target: 0, unit: "DPMO", status: "fantastic" },
          { name: "DEX", value: 94.3, target: 95, unit: "%", status: "fair" }
        ]
      }
    ],
    recommendedFocusAreas: [
      "Contact Compliance",
      "DNR DPMO",
      "Safe Driving (FICO)"
    ],
    sectionRatings: {
      complianceAndSafety: "Good",
      qualityAndSWC: "Great",
      capacity: "Fantastic"
    }
  };
};

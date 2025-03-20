
import { DriverComplianceData } from "./types";

// Style for compliance values
export const getComplianceStyle = (percentage: number) => {
  if (percentage < 85) return "bg-red-100 text-red-800 font-semibold";
  if (percentage < 98) return "bg-amber-100 text-amber-800 font-semibold";
  return "bg-green-100 text-green-800 font-semibold";
};

export const getProgressColor = (percentage: number) => {
  if (percentage < 85) return "bg-red-500";
  if (percentage < 98) return "bg-amber-500";
  return "bg-green-500";
};

// Generate personalized message for drivers with compliance below 98%
export const generateDriverMessage = (driver: DriverComplianceData) => {
  const missingContacts = driver.totalAddresses - driver.totalContacts;
  return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktieren, hast aber nur ${driver.totalContacts} kontaktiert (${missingContacts} fehlende Kontakte). Bitte versuch diese Woche auf 100% zu kommen.`;
};

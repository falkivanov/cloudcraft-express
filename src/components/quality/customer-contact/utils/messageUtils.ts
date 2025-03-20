
import { DriverComplianceData } from "../types";

// Generate personalized message for drivers with compliance below 98%
export const generateDriverMessage = (driver: DriverComplianceData) => {
  const missingContacts = driver.totalAddresses - driver.totalContacts;
  return `Hi ${driver.firstName}, letzte Woche musstest du ${driver.totalAddresses} Kunden kontaktieren, hast aber nur ${driver.totalContacts} kontaktiert (${missingContacts} fehlende Kontakte). Bitte versuch diese Woche auf 100% zu kommen.`;
};

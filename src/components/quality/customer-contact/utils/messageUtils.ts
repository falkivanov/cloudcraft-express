
export const getComplianceMessage = (percentage: number): string => {
  if (percentage < 85) {
    return "Kritisch - Sofortige Verbesserung notwendig";
  } 
  if (percentage < 98) {
    return "Verbesserungsbedarf";
  }
  return "Gut";
};

export const getSuggestedAction = (percentage: number): string => {
  if (percentage < 85) {
    return "Training zur Compliance-Steigerung notwendig";
  }
  if (percentage < 98) {
    return "Überprüfung des Kundenkontakt-Prozesses empfohlen";
  }
  return "Weiter so!";
};

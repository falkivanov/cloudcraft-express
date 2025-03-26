
import { FileText, File, FileSpreadsheet, Award } from "lucide-react";

export const fileCategories = [
  { 
    id: "scorecard", 
    name: "Scorecard", 
    expectedType: "pdf",
    icon: File,
    description: "Scorecard-Daten im PDF-Format"
  },
  { 
    id: "customerContact", 
    name: "Customer Contact", 
    expectedType: "html",
    icon: FileText,
    description: "Customer Contact Berichte im HTML-Format"
  },
  { 
    id: "concessions", 
    name: "Concessions", 
    expectedType: "excel",
    icon: FileSpreadsheet,
    description: "Concessions-Daten im Excel-Format (.xlsx)"
  },
  { 
    id: "mentor", 
    name: "Mentor", 
    expectedType: "excel",
    icon: Award,
    description: "Mentor-Programm Daten im Excel-Format (.xlsx)"
  },
];

export const getCategoryInfo = (categoryId: string) => {
  return fileCategories.find(category => category.id === categoryId);
};

export const getCategoryByFileType = (fileName: string, fileType: string): string => {
  // Konkrete Zuordnung basierend auf Dateityp und Kategorie
  if (fileType === "html") {
    return "customerContact";
  } else if (fileType === "excel" && fileName.toLowerCase().includes(".xlsx")) {
    return "concessions";
  } else if (fileType === "pdf") {
    // Bei PDFs prüfen wir den Dateinamen für die Unterscheidung
    if (fileName.toLowerCase().includes("scorecard") || fileName.toLowerCase().includes("score")) {
      return "scorecard";
    } else if (fileName.toLowerCase().includes("mentor")) {
      return "mentor";
    }
    return "scorecard"; // Default für PDF-Dateien
  }
  return "unknown";
};

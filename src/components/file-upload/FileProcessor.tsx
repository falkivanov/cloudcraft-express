
import { toast } from "sonner";
import { addItemToHistory } from "@/utils/fileUploadHistory";
import { ScorecardProcessor } from "./processors/ScorecardProcessor";
import { CustomerContactProcessor } from "./processors/CustomerContactProcessor";
import { ConcessionsProcessor } from "./processors/ConcessionsProcessor";
import { MentorProcessor } from "./processors/MentorProcessor";
import { GenericProcessor } from "./processors/GenericProcessor";

interface FileUploadItem {
  name: string;
  type: string;
  timestamp: string;
  category: string;
}

/**
 * Process an uploaded file based on its type and category
 */
export const processFile = async (file: File, type: string, category: string): Promise<void> => {
  console.log(`Processing ${category} file:`, file);
  
  try {
    // Create the appropriate processor based on category
    if (category === "scorecard") {
      const processor = new ScorecardProcessor(file);
      await processor.process();
    } else if (category === "customerContact") {
      const processor = new CustomerContactProcessor(file);
      await processor.process();
    } else if (category === "concessions") {
      const processor = new ConcessionsProcessor(file);
      await processor.process();
    } else if (category === "mentor") {
      const processor = new MentorProcessor(file);
      await processor.process();
    } else {
      // Use generic processor for other types
      const processor = new GenericProcessor(file, category);
      await processor.process();
    }
    
    // Log successful upload to history
    const newItem: FileUploadItem = {
      name: file.name,
      type: type,
      timestamp: new Date().toISOString(),
      category: category
    };
    
    addItemToHistory(newItem);
  } catch (error) {
    console.error(`Error processing ${category} file:`, error);
    toast.error(`Fehler bei der Verarbeitung der ${category} Datei`, {
      description: error instanceof Error ? error.message : `Unbekannter Fehler beim Verarbeiten von ${file.name}`,
    });
    throw error;
  }
};

/**
 * Determine the appropriate file reader method based on file type and category
 */
export const getFileReaderMethod = (file: File, type: string, category: string): 'readAsArrayBuffer' | 'readAsText' => {
  if ((type === "excel" || category === "concessions" || category === "mentor") && file.type.includes('excel')) {
    return 'readAsArrayBuffer';
  } else if (type === "html" || category === "customerContact") {
    return 'readAsText';
  } else if (type === "pdf" && (category === "pod" || category === "scorecard")) {
    return 'readAsArrayBuffer';
  }
  
  // Default to text for unknown types
  return 'readAsText';
};

/**
 * Process the content after file is read
 */
export const processFileContent = (
  result: string | ArrayBuffer, 
  file: File, 
  type: string, 
  category: string
): void => {
  if (category === "customerContact" && type === "html") {
    localStorage.setItem("customerContactData", result as string);
    toast.success(
      `Customer Contact Datei erfolgreich verarbeitet: ${file.name}`,
      {
        description: `Wochendaten wurden aktualisiert`,
      }
    );
  } else if (category === "pod") {
    localStorage.setItem("podData", JSON.stringify({
      content: result,
      type: type,
      fileName: file.name
    }));
    toast.success(
      `POD Datei erfolgreich verarbeitet: ${file.name}`,
      {
        description: `POD-Daten wurden aktualisiert`,
      }
    );
  } else if (category === "concessions") {
    localStorage.setItem("concessionsData", JSON.stringify({
      content: result,
      type: type,
      fileName: file.name
    }));
    toast.success(
      `Concessions Datei erfolgreich verarbeitet: ${file.name}`,
      {
        description: `Concessions-Daten wurden aktualisiert`,
      }
    );
  } else if (category === "mentor") {
    localStorage.setItem("mentorData", JSON.stringify({
      content: result,
      type: type,
      fileName: file.name
    }));
    toast.success(
      `Mentor Datei erfolgreich verarbeitet: ${file.name}`,
      {
        description: `Mentor-Daten wurden aktualisiert`,
      }
    );
  }
};

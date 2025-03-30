
import { toast } from "sonner";
import { addItemToHistory } from "@/utils/fileUploadHistory";

interface FileUploadItem {
  name: string;
  type: string;
  timestamp: string;
  category: string;
}

/**
 * Process an uploaded file based on its type and category
 */
export const processFile = (file: File, type: string, category: string): void => {
  console.log(`Processing ${category} file:`, file);
    
  const newItem: FileUploadItem = {
    name: file.name,
    type: type,
    timestamp: new Date().toISOString(),
    category: category
  };
    
  addItemToHistory(newItem);
    
  const reader = new FileReader();
    
  reader.onload = (e) => {
    if (e.target?.result) {
      if (category === "customerContact" && type === "html") {
        localStorage.setItem("customerContactData", e.target.result as string);
        toast.success(
          `Customer Contact Datei erfolgreich verarbeitet: ${file.name}`,
          {
            description: `Wochendaten wurden aktualisiert`,
          }
        );
      } else if (category === "pod") {
        localStorage.setItem("podData", JSON.stringify({
          content: e.target.result,
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
          content: e.target.result,
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
          content: e.target.result,
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
    }
  };
    
  reader.onerror = () => {
    toast.error(`Fehler beim Lesen der Datei: ${file.name}`);
  };
    
  if ((type === "excel" || category === "concessions" || category === "mentor") && file.type.includes('excel')) {
    reader.readAsArrayBuffer(file);
  } else if (type === "html" || category === "customerContact") {
    reader.readAsText(file);
  } else if (type === "pdf" && category === "pod") {
    reader.readAsArrayBuffer(file);
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
  } else if (type === "pdf" && category === "pod") {
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

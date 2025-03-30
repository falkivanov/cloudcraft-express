
import { toast } from "sonner";
import { addItemToHistory } from "@/utils/fileUploadHistory";

interface FileProcessorProps {
  file: File;
  type: string;
  category: string;
}

const FileProcessor: React.FC<FileProcessorProps> = ({ file, type, category }) => {
  const processFile = () => {
    console.log(`Processing ${category} file:`, file);
    
    const newItem = {
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

  return null; // This is a utility component, no UI
};

export default FileProcessor;
export const processFile = (file: File, type: string, category: string) => {
  const processor = new FileProcessor({ file, type, category });
  return processor.processFile();
};

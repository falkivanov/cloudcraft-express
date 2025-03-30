
import { useState, useRef } from "react";
import { validateFile } from "./utils/fileValidator";
import { FileProcessor } from "./processors/FileProcessor";
import { toast } from "sonner";

export const useFileUpload = (onFileUpload?: (file: File, type: string, category: string) => void) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("scorecard");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const validateAndSetFile = (selectedFile: File) => {
    const isValid = validateFile(selectedFile, selectedCategory);
    if (isValid) {
      setFile(selectedFile);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (file) {
      setProcessing(true);
      
      try {
        console.log(`Uploading ${selectedCategory} file: ${file.name}`);
        const fileProcessor = new FileProcessor(file, selectedCategory, onFileUpload);
        const success = await fileProcessor.process();
        
        if (success) {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          
          if (selectedCategory === "scorecard") {
            // Special treatment for scorecard uploads
            setTimeout(() => {
              toast.success(
                "Scorecard erfolgreich verarbeitet und gespeichert",
                {
                  description: "Möchten Sie die Scorecard-Daten jetzt ansehen?",
                  action: {
                    label: "Ja",
                    onClick: () => {
                      window.location.href = "/quality/scorecard";
                    }
                  },
                  duration: 10000,
                }
              );
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error in file upload:", error);
        toast.error("Ein Fehler ist aufgetreten", {
          description: error instanceof Error ? error.message : "Unbekannter Fehler bei der Datei-Verarbeitung",
        });
      } finally {
        setProcessing(false);
      }
    } else {
      toast.error("Bitte wählen Sie zuerst eine Datei aus");
    }
  };

  return {
    selectedCategory,
    file,
    fileInputRef,
    processing,
    handleCategoryChange,
    validateAndSetFile,
    handleUpload
  };
};


import { useState, useRef } from "react";
import { validateFile } from "./utils/fileValidator";
import { handleFileUpload } from "./hooks/useFileUploader";

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
      const success = await handleFileUpload(
        file, 
        selectedCategory, 
        onFileUpload,
        setProcessing
      );
      
      if (success) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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

// Import toast separately to avoid circular dependencies
import { toast } from "sonner";

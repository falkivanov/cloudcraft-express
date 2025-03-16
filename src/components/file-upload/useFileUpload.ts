
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getFileTypeInfo } from "./fileTypes";

export const useFileUpload = (onFileUpload?: (file: File, type: string) => void) => {
  const [selectedFileType, setSelectedFileType] = useState<string>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    const fileTypeInfo = getFileTypeInfo(selectedFileType);
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    
    if (fileTypeInfo?.extensions.includes(fileExtension)) {
      setFile(selectedFile);
      toast.success(`Datei "${selectedFile.name}" ausgewählt`);
    } else {
      toast.error(`Ungültiger Dateityp. Bitte wählen Sie eine ${fileTypeInfo?.name} Datei aus.`);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedFileType(value);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (file) {
      onFileUpload?.(file, selectedFileType);
      toast.success(`Datei "${file.name}" erfolgreich hochgeladen`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      toast.error("Bitte wählen Sie zuerst eine Datei aus");
    }
  };

  return {
    selectedFileType,
    file,
    fileInputRef,
    handleTypeChange,
    validateAndSetFile,
    handleUpload
  };
};

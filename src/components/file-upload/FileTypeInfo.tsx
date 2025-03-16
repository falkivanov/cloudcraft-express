
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileTypeInfoProps {
  fileType: string;
}

const FileTypeInfo: React.FC<FileTypeInfoProps> = ({ fileType }) => {
  const getFileTypeDescription = () => {
    switch (fileType) {
      case "pdf":
        return "PDF-Dateien werden für Dokumentenanalyse verwendet.";
      case "excel":
        return "Excel-Dateien werden für Datenimport und -analyse verwendet.";
      case "csv":
        return "CSV-Dateien werden für Datenimport und -analyse verwendet.";
      case "html":
        return "HTML-Dateien werden für Web-Scraping und -Analyse verwendet.";
      default:
        return "Bitte wählen Sie einen Dateityp.";
    }
  };

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        {getFileTypeDescription()}
      </AlertDescription>
    </Alert>
  );
};

export default FileTypeInfo;

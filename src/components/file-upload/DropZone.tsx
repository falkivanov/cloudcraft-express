
import React, { useState } from "react";
import { FileType, Check, Upload, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getFileTypeInfo, getFileIcon } from "./fileTypes";

interface DropZoneProps {
  selectedFileType: string;
  file: File | null;
  onFileChange: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const DropZone: React.FC<DropZoneProps> = ({
  selectedFileType,
  file,
  onFileChange,
  fileInputRef,
}) => {
  const [dragging, setDragging] = useState(false);
  const [dragError, setDragError] = useState(false);
  const fileTypeInfo = getFileTypeInfo(selectedFileType);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    setDragError(false);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Get file extension
      const fileExtension = `.${e.dataTransfer.files[0].name.split('.').pop()?.toLowerCase()}`;
      
      // Check if the file type is acceptable
      if (fileTypeInfo && fileTypeInfo.extensions.includes(fileExtension)) {
        onFileChange(e.dataTransfer.files[0]);
        setDragError(false);
      } else {
        setDragError(true);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
      setDragError(false);
    }
  };

  const iconColorClass = getFileIcon(selectedFileType);
  
  // Check if the file name contains KW information (for Scorecard PDFs)
  const weekInfo = file && selectedFileType === "pdf" ? 
    file.name.match(/KW[_\s]*(\d+)/i) : null;
  
  const weekNumber = weekInfo && weekInfo[1] ? parseInt(weekInfo[1], 10) : null;

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
        dragging ? "border-primary bg-primary/5" : dragError ? "border-red-400 bg-red-50" : "border-border"
      } ${file ? "bg-green-50 border-green-200" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {file ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <Check className="h-12 w-12 text-green-500" />
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
            {weekNumber && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                KW {weekNumber}
              </span>
            )}
          </p>
        </div>
      ) : dragError ? (
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="font-medium text-red-600">
            Ungültiger Dateityp
          </p>
          <p className="text-sm text-red-500">
            Bitte wählen Sie eine {fileTypeInfo?.extensions.join(", ")} Datei
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <FileType className={`h-12 w-12 ${iconColorClass}`} />
          <p className="font-medium">
            Klicken oder Dateien hierher ziehen
          </p>
          <p className="text-sm text-muted-foreground">
            Unterstützte Formate: {fileTypeInfo?.extensions.join(", ")}
          </p>
        </div>
      )}
      <Input
        type="file"
        ref={fileInputRef}
        accept={fileTypeInfo?.extensions.join(",")}
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default DropZone;

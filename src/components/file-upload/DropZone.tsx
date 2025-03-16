
import React, { useState } from "react";
import { FileType, Check } from "lucide-react";
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
  const fileTypeInfo = getFileTypeInfo(selectedFileType);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const iconColorClass = getFileIcon(selectedFileType);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
        dragging ? "border-primary bg-primary/5" : "border-border"
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

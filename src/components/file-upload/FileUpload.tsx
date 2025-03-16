
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileTypeSelector from "./FileTypeSelector";
import DropZone from "./DropZone";
import FileTypeInfo from "./FileTypeInfo";
import UploadButton from "./UploadButton";
import { useFileUpload } from "./useFileUpload";

interface FileUploadProps {
  onFileUpload?: (file: File, type: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const {
    selectedFileType,
    file,
    fileInputRef,
    handleTypeChange,
    validateAndSetFile,
    handleUpload
  } = useFileUpload(onFileUpload);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Datei hochladen</CardTitle>
        <CardDescription>
          Laden Sie Ihre Dateien hoch für die Analyse und Verarbeitung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <FileTypeSelector 
              selectedFileType={selectedFileType}
              onTypeChange={handleTypeChange}
            />
          </div>
          
          <div className="md:col-span-3">
            <DropZone
              selectedFileType={selectedFileType}
              file={file}
              onFileChange={validateAndSetFile}
              fileInputRef={fileInputRef}
            />
          </div>
        </div>

        <FileTypeInfo fileType={selectedFileType} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <UploadButton 
          onUpload={handleUpload}
          disabled={!file}
        />
      </CardFooter>
    </Card>
  );
};

export default FileUpload;

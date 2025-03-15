
import React, { useState, useRef } from "react";
import { Upload, FileType, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const allowedFileTypes = [
  { id: "pdf", name: "PDF", extensions: [".pdf"] },
  { id: "excel", name: "Excel", extensions: [".xlsx", ".xls"] },
  { id: "csv", name: "CSV", extensions: [".csv"] },
  { id: "html", name: "HTML", extensions: [".html", ".htm"] },
];

interface FileUploadProps {
  onFileUpload?: (file: File, type: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [selectedFileType, setSelectedFileType] = useState<string>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileTypeInfo = allowedFileTypes.find(type => type.id === selectedFileType);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    
    if (fileTypeInfo?.extensions.includes(fileExtension)) {
      setFile(selectedFile);
      toast.success(`Datei "${selectedFile.name}" ausgewählt`);
    } else {
      toast.error(`Ungültiger Dateityp. Bitte wählen Sie eine ${fileTypeInfo?.name} Datei aus.`);
    }
  };

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
      validateAndSetFile(e.dataTransfer.files[0]);
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

  const getFileIcon = () => {
    switch (selectedFileType) {
      case "pdf":
        return <FileType className="h-12 w-12 text-red-500" />;
      case "excel":
        return <FileType className="h-12 w-12 text-green-500" />;
      case "csv":
        return <FileType className="h-12 w-12 text-blue-500" />;
      case "html":
        return <FileType className="h-12 w-12 text-orange-500" />;
      default:
        return <FileType className="h-12 w-12" />;
    }
  };

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
            <Select
              value={selectedFileType}
              onValueChange={value => {
                setSelectedFileType(value);
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dateityp auswählen" />
              </SelectTrigger>
              <SelectContent>
                {allowedFileTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
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
                  {getFileIcon()}
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
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {fileTypeInfo && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              {selectedFileType === "pdf" && "PDF-Dateien werden für Dokumentenanalyse verwendet. OCR wird automatisch für gescannte Dokumente angewendet."}
              {selectedFileType === "excel" && "Excel-Dateien werden für Datenimport und -analyse verwendet."}
              {selectedFileType === "csv" && "CSV-Dateien werden für Datenimport und -analyse verwendet."}
              {selectedFileType === "html" && "HTML-Dateien werden für Web-Scraping und -Analyse verwendet."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpload} 
          disabled={!file}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Hochladen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;


import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileCategorySelector from "./FileTypeSelector";
import DropZone from "./DropZone";
import UploadButton from "./UploadButton";
import { useFileUpload } from "./useFileUpload";
import { getCategoryInfo } from "./fileCategories";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileUploadProps {
  onFileUpload?: (file: File, type: string, category: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const {
    selectedCategory,
    file,
    fileInputRef,
    processing,
    handleCategoryChange,
    validateAndSetFile,
    handleUpload
  } = useFileUpload(onFileUpload);

  const categoryInfo = getCategoryInfo(selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Datei hochladen</CardTitle>
        <CardDescription>
          Wählen Sie die Kategorie der Datei und laden Sie diese hoch
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <FileCategorySelector 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          
          <div className="md:col-span-3">
            <DropZone
              selectedFileType={categoryInfo?.expectedType || ""}
              file={file}
              onFileChange={validateAndSetFile}
              fileInputRef={fileInputRef}
            />
          </div>
        </div>

        {categoryInfo && (
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              {React.createElement(categoryInfo.icon, { className: "h-4 w-4" })}
              {categoryInfo.name}
            </h3>
            <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
            
            {selectedCategory === "scorecard" && (
              <div className="mt-2 text-xs text-amber-600">
                <p>Das System extrahiert automatisch KPIs, Scores und Fahrerdaten aus dem PDF.</p>
                <p className="mt-1">Tipp: Benennen Sie Ihre Datei mit "KW" und der Wochennummer (z.B. "Scorecard_KW12.pdf"), damit die Woche automatisch erkannt wird.</p>
              </div>
            )}
            
            {selectedCategory === "customerContact" && (
              <div className="mt-2 text-xs text-blue-600">
                <p>HTML-Dateien werden analysiert und Kundenkontaktdaten werden extrahiert.</p>
              </div>
            )}
            
            {selectedCategory === "pod" && (
              <div className="mt-2 text-xs text-purple-600">
                <p>PDF-Dateien werden als Liefernachweise (POD) gespeichert.</p>
              </div>
            )}
            
            {selectedCategory === "concessions" && (
              <div className="mt-2 text-xs text-orange-600">
                <p>Excel-Dateien werden als Concessions-Daten verarbeitet.</p>
              </div>
            )}
            
            {selectedCategory === "mentor" && (
              <div className="mt-2 text-xs text-green-600">
                <p>Excel-Dateien vom Mentor-Programm werden verarbeitet. Das System erwartet Dateien im Format "Driver Report YYYY-MM-DD.xlsx".</p>
                <p className="mt-1">Die Datei sollte Spalten für Fahrernamen, Station, Fahrten, Stunden und verschiedene Risikobewertungen enthalten.</p>
              </div>
            )}
          </div>
        )}
        
        {selectedCategory === "scorecard" && (
          <Alert variant="warning" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hinweis zur Scorecard-Verarbeitung</AlertTitle>
            <AlertDescription>
              Nach dem Hochladen werden die Daten automatisch extrahiert und können anschließend unter "Qualität → Scorecard" angezeigt werden.
            </AlertDescription>
          </Alert>
        )}
        
        {selectedCategory === "mentor" && (
          <Alert variant="warning" className="bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hinweis zur Mentor-Verarbeitung</AlertTitle>
            <AlertDescription>
              Nach dem Hochladen werden die Mentor-Daten automatisch extrahiert und können anschließend unter "Qualität → Mentor" angezeigt werden.
              Das System erkennt automatisch die Kalenderwoche basierend auf dem Datum im Dateinamen.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <UploadButton 
          onUpload={handleUpload}
          disabled={!file || processing}
          loading={processing}
          categoryName={categoryInfo?.name}
        />
      </CardFooter>
    </Card>
  );
};

export default FileUpload;

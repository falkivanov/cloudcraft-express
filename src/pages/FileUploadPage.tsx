
import React, { useState, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import FileHistory from "@/components/FileHistory";
import { FileProcessingService, ProcessedFile } from "@/services/fileProcessingService";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const FileUploadPage = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    // Lade gespeicherte Dateien beim Start
    const savedFiles = FileProcessingService.getProcessedFiles();
    setFiles(savedFiles);
  }, []);

  const handleFileUpload = async (file: File, type: string) => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Simuliere Fortschritt während der Verarbeitung
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      // Verarbeite die Datei mit unserem Service
      const processedFile = await FileProcessingService.processFile(file, type);
      
      // Speichere die verarbeitete Datei
      FileProcessingService.saveProcessedFile(processedFile);
      
      // Aktualisiere die Dateiliste
      setFiles(FileProcessingService.getProcessedFiles());
      
      // Setze Fortschritt auf 100%
      clearInterval(progressInterval);
      setProgress(100);
      
      // Zeige Erfolgsmeldung
      toast.success(
        `Datei erfolgreich verarbeitet: ${file.name}`,
        {
          description: `Dateityp: ${type.toUpperCase()}, Größe: ${(file.size / 1024).toFixed(2)} KB`,
        }
      );
      
      // Wechsle zum Verlaufs-Tab
      setTimeout(() => {
        setActiveTab("history");
      }, 1000);
      
    } catch (error) {
      console.error("Fehler bei der Dateiverarbeitung:", error);
      toast.error(`Fehler beim Verarbeiten der Datei: ${file.name}`);
    } finally {
      // Bereinige den Status
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Datei-Uploads</h1>
      
      {isProcessing && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Datei wird verarbeitet...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <Tabs 
        defaultValue="upload" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Neue Datei hochladen</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <FileUpload onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <FileHistory files={files} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileUploadPage;

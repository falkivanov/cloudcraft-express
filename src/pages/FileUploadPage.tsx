import React from "react";
import FileUpload from "@/components/file-upload/FileUpload";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

const FileUploadPage = () => {
  const handleFileUpload = (file: File, type: string) => {
    console.log(`Processing ${type} file:`, file);
    
    // Here you would typically send the file to your server/API
    // For now, we'll just log and show a toast
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // This is where you would process the file data
      console.log(`File loaded successfully, size: ${file.size} bytes`);
      
      // In a real app, you'd send the file to a server
      // For demo purposes, we'll just show a success message
      toast.success(
        `Datei erfolgreich verarbeitet: ${file.name}`,
        {
          description: `Dateityp: ${type.toUpperCase()}, Größe: ${(file.size / 1024).toFixed(2)} KB`,
        }
      );
    };
    
    reader.onerror = () => {
      toast.error(`Fehler beim Lesen der Datei: ${file.name}`);
    };
    
    if (type === "pdf" || type === "excel") {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Datei-Uploads</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Neue Datei hochladen</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <FileUpload onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <div className="rounded-lg border bg-card p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Keine hochgeladenen Dateien</h3>
            <p className="text-muted-foreground">
              Hochgeladene Dateien werden hier angezeigt
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileUploadPage;

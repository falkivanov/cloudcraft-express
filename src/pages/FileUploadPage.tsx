
import React, { useState } from "react";
import FileUpload from "@/components/file-upload/FileUpload";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

const FileUploadPage = () => {
  const [uploadHistory, setUploadHistory] = useState<{
    name: string;
    type: string;
    timestamp: Date;
    category: string;
  }[]>([]);

  const handleFileUpload = (file: File, type: string) => {
    console.log(`Processing ${type} file:`, file);
    
    // Datei-Kategorie basierend auf dem Dateityp und Namen bestimmen
    let fileCategory = "Allgemein";
    
    // Versuchen, die Kategorie aus dem Dateinamen zu erkennen
    const fileName = file.name.toLowerCase();
    if (fileName.includes("customer") || fileName.includes("contact") || fileName.includes("cc")) {
      fileCategory = "Customer Contact";
    } else if (fileName.includes("scorecard") || fileName.includes("score")) {
      fileCategory = "Scorecard";
    } else if (fileName.includes("pod") || fileName.includes("delivery")) {
      fileCategory = "POD";
    } else if (fileName.includes("concession") || fileName.includes("exception")) {
      fileCategory = "Concessions";
    }
    
    // File Reader zum Verarbeiten der Datei
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        // Dateiinhalt in LocalStorage speichern für die entsprechende Kategorie
        if (fileCategory === "Customer Contact" && type === "html") {
          localStorage.setItem("customerContactData", e.target.result as string);
          toast.success(
            `Customer Contact Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Wochendaten wurden aktualisiert`,
            }
          );
        } else if (fileCategory === "Scorecard") {
          localStorage.setItem("scorecardData", JSON.stringify({
            content: e.target.result,
            type: type,
            fileName: file.name
          }));
          toast.success(
            `Scorecard Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Scorecard-Daten wurden aktualisiert`,
            }
          );
        } else if (fileCategory === "POD") {
          localStorage.setItem("podData", JSON.stringify({
            content: e.target.result,
            type: type,
            fileName: file.name
          }));
          toast.success(
            `POD Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `POD-Daten wurden aktualisiert`,
            }
          );
        } else if (fileCategory === "Concessions") {
          localStorage.setItem("concessionsData", JSON.stringify({
            content: e.target.result,
            type: type,
            fileName: file.name
          }));
          toast.success(
            `Concessions Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Concessions-Daten wurden aktualisiert`,
            }
          );
        } else {
          toast.success(
            `Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Dateityp: ${type.toUpperCase()}, Kategorie: ${fileCategory}`,
            }
          );
        }
        
        // Zum Upload-Verlauf hinzufügen
        setUploadHistory(prev => [
          {
            name: file.name,
            type: type,
            timestamp: new Date(),
            category: fileCategory
          },
          ...prev
        ]);
      }
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
          <div className="mb-4 p-4 border rounded-lg bg-amber-50 text-amber-800">
            <h3 className="font-medium">Hinweis zur Dateizuordnung:</h3>
            <p className="text-sm">
              Dateien werden basierend auf ihrem Namen automatisch zugeordnet. Für eine korrekte Zuordnung, benennen Sie Ihre Dateien wie folgt:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Customer Contact: Enthält "customer", "contact" oder "cc" im Namen</li>
              <li>Scorecard: Enthält "scorecard" oder "score" im Namen</li>
              <li>POD: Enthält "pod" oder "delivery" im Namen</li>
              <li>Concessions: Enthält "concession" oder "exception" im Namen</li>
            </ul>
          </div>
          <FileUpload onFileUpload={handleFileUpload} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          {uploadHistory.length > 0 ? (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Dateiname</th>
                      <th className="p-3 text-left font-medium">Kategorie</th>
                      <th className="p-3 text-left font-medium">Typ</th>
                      <th className="p-3 text-left font-medium">Zeitpunkt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistory.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.category === "Customer Contact" ? "bg-blue-100 text-blue-800" :
                            item.category === "Scorecard" ? "bg-green-100 text-green-800" :
                            item.category === "POD" ? "bg-purple-100 text-purple-800" :
                            item.category === "Concessions" ? "bg-orange-100 text-orange-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 uppercase">{item.type}</td>
                        <td className="p-3">{item.timestamp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Keine hochgeladenen Dateien</h3>
              <p className="text-muted-foreground">
                Hochgeladene Dateien werden hier angezeigt
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileUploadPage;

import React, { useState, useEffect } from "react";
import FileUpload from "@/components/file-upload/FileUpload";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";

interface UploadHistoryItem {
  name: string;
  type: string;
  timestamp: string;
  category: string;
}

const FileUploadPage = () => {
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);

  useEffect(() => {
    try {
      const historyJSON = localStorage.getItem('fileUploadHistory');
      if (historyJSON) {
        const history = JSON.parse(historyJSON);
        setUploadHistory(history);
      }
    } catch (error) {
      console.error("Error loading upload history:", error);
    }
  }, []);

  const handleFileUpload = (file: File, type: string, category: string) => {
    console.log(`Processing ${category} file:`, file);
    
    const newItem = {
      name: file.name,
      type: type,
      timestamp: new Date().toISOString(),
      category: category
    };
    
    setUploadHistory(prev => [newItem, ...prev]);
    
    try {
      const historyJSON = localStorage.getItem('fileUploadHistory');
      const history = historyJSON ? JSON.parse(historyJSON) : [];
      history.unshift(newItem);
      
      const trimmedHistory = history.slice(0, 100);
      localStorage.setItem('fileUploadHistory', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("Error updating upload history:", error);
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        if (category === "customerContact" && type === "html") {
          localStorage.setItem("customerContactData", e.target.result as string);
          toast.success(
            `Customer Contact Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Wochendaten wurden aktualisiert`,
            }
          );
        } else if (category === "pod") {
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
        } else if (category === "concessions") {
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
        }
      }
    };
    
    reader.onerror = () => {
      toast.error(`Fehler beim Lesen der Datei: ${file.name}`);
    };
    
    if ((type === "excel" || category === "concessions") && file.type.includes('excel')) {
      reader.readAsArrayBuffer(file);
    } else if (type === "html" || category === "customerContact") {
      reader.readAsText(file);
    } else if (type === "pdf" && category === "pod") {
      reader.readAsArrayBuffer(file);
    }
  };

  const getCategoryDisplayName = (categoryId: string) => {
    switch (categoryId) {
      case "scorecard": return "Scorecard";
      case "customerContact": return "Customer Contact";
      case "pod": return "POD";
      case "concessions": return "Concessions";
      default: return categoryId;
    }
  };

  const getCategoryColorClass = (categoryId: string) => {
    switch (categoryId) {
      case "scorecard": return "bg-green-100 text-green-800";
      case "customerContact": return "bg-blue-100 text-blue-800";
      case "pod": return "bg-purple-100 text-purple-800";
      case "concessions": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Container>
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
              Wählen Sie die passende Kategorie für Ihre Datei aus und laden Sie sie im richtigen Format hoch:
            </p>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Scorecard: PDF-Format (.pdf)</li>
              <li>Customer Contact: HTML-Format (.html, .htm)</li>
              <li>POD: PDF-Format (.pdf)</li>
              <li>Concessions: Excel-Format (.xlsx)</li>
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
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColorClass(item.category)}`}>
                            {getCategoryDisplayName(item.category)}
                          </span>
                        </td>
                        <td className="p-3 uppercase">{item.type}</td>
                        <td className="p-3">{formatDate(item.timestamp)}</td>
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
    </Container>
  );
};

export default FileUploadPage;

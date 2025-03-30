
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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
        } else if (category === "mentor") {
          localStorage.setItem("mentorData", JSON.stringify({
            content: e.target.result,
            type: type,
            fileName: file.name
          }));
          toast.success(
            `Mentor Datei erfolgreich verarbeitet: ${file.name}`,
            {
              description: `Mentor-Daten wurden aktualisiert`,
            }
          );
        }
      }
    };
    
    reader.onerror = () => {
      toast.error(`Fehler beim Lesen der Datei: ${file.name}`);
    };
    
    if ((type === "excel" || category === "concessions" || category === "mentor") && file.type.includes('excel')) {
      reader.readAsArrayBuffer(file);
    } else if (type === "html" || category === "customerContact") {
      reader.readAsText(file);
    } else if (type === "pdf" && category === "pod") {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDeleteFile = (item: UploadHistoryItem, index: number) => {
    // Entferne den Eintrag aus dem State
    setUploadHistory(prev => prev.filter((_, i) => i !== index));
    
    // Entferne den Eintrag aus dem localStorage History
    try {
      const historyJSON = localStorage.getItem('fileUploadHistory');
      if (historyJSON) {
        const history = JSON.parse(historyJSON);
        const updatedHistory = history.filter((historyItem: UploadHistoryItem) => 
          !(historyItem.name === item.name && 
            historyItem.timestamp === item.timestamp && 
            historyItem.category === item.category)
        );
        localStorage.setItem('fileUploadHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Error removing item from history:", error);
    }
    
    // Lösche die zugehörigen Daten aus dem localStorage
    if (item.category === "customerContact") {
      localStorage.removeItem("customerContactData");
      localStorage.removeItem("parsedCustomerContactData");
    } else if (item.category === "pod") {
      localStorage.removeItem("podData");
    } else if (item.category === "concessions") {
      localStorage.removeItem("concessionsData");
    } else if (item.category === "mentor") {
      localStorage.removeItem("mentorData");
    } else if (item.category === "scorecard") {
      // Hier könnte eine komplexere Logik für Scorecard-Daten stehen
      // Da Scorecards nach Wochen organisiert sind, müssten wir prüfen, ob andere Dateien
      // aus der gleichen Woche existieren, bevor wir alles löschen
    }
    
    toast.success(`Datei ${item.name} erfolgreich gelöscht`, {
      description: `Die zugehörigen Daten wurden ebenfalls entfernt`,
    });
  };

  const getCategoryDisplayName = (categoryId: string) => {
    switch (categoryId) {
      case "scorecard": return "Scorecard";
      case "customerContact": return "Customer Contact";
      case "pod": return "POD";
      case "concessions": return "Concessions";
      case "mentor": return "Mentor";
      default: return categoryId;
    }
  };

  const getCategoryColorClass = (categoryId: string) => {
    switch (categoryId) {
      case "scorecard": return "bg-green-100 text-green-800";
      case "customerContact": return "bg-blue-100 text-blue-800";
      case "pod": return "bg-purple-100 text-purple-800";
      case "concessions": return "bg-orange-100 text-orange-800";
      case "mentor": return "bg-indigo-100 text-indigo-800";
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
              <li>Mentor: Excel-Format (.xlsx)</li>
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
                      <th className="p-3 text-left font-medium">Aktionen</th>
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
                        <td className="p-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Löschen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Datei löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sind Sie sicher, dass Sie die Datei "{item.name}" löschen möchten? 
                                  Alle zugehörigen Daten werden ebenfalls gelöscht und dieser Vorgang kann nicht rückgängig gemacht werden.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteFile(item, index)}
                                >
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
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

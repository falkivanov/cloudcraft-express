import React, { useState, useEffect } from "react";
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
import { 
  UploadHistoryItem, 
  getUploadHistory, 
  removeItemFromHistory, 
  getCategoryDisplayName, 
  getCategoryColorClass, 
  formatDate 
} from "@/utils/fileUploadHistory";

const UploadHistoryTab: React.FC = () => {
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setUploadHistory(getUploadHistory());
    };
    
    loadHistory();
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'fileUploadHistory') {
        loadHistory();
      }
    });
    
    return () => {
      window.removeEventListener('storage', loadHistory);
    };
  }, []);

  const handleDeleteFile = (item: UploadHistoryItem, index: number) => {
    if (removeItemFromHistory(item, index)) {
      setUploadHistory(getUploadHistory());
      
      const currentPath = window.location.pathname;
      if (
        (item.category === "scorecard" && currentPath.includes("/quality/scorecard")) ||
        (item.category === "customerContact" && currentPath.includes("/quality/customer-contact")) ||
        (item.category === "concessions" && currentPath.includes("/quality/concessions")) ||
        (item.category === "mentor" && currentPath.includes("/quality/mentor"))
      ) {
        window.dispatchEvent(new Event(`${item.category}DataRemoved`));
      }
    }
  };

  if (uploadHistory.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Keine hochgeladenen Dateien</h3>
        <p className="text-muted-foreground">
          Hochgeladene Dateien werden hier angezeigt
        </p>
      </div>
    );
  }

  return (
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
  );
};

export default UploadHistoryTab;


import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ConcessionsContentProps {
  concessionsData: any | null;
}

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData }) => {
  if (!concessionsData) {
    return renderNoDataMessage("Concessions");
  }

  return (
    <div className="mt-6 p-4 border rounded bg-slate-50">
      <h3 className="text-lg font-semibold mb-2">Geladene Concessions-Daten</h3>
      <p>Dateiname: {concessionsData.fileName}</p>
      <p>Dateityp: {concessionsData.type.toUpperCase()}</p>
      {/* Hier könnte eine spezifische Darstellung der Concessions-Daten erfolgen */}
    </div>
  );
};

// Helper function for "No data" message
const renderNoDataMessage = (category: string) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
      <p className="text-lg font-medium mb-3">Keine {category}-Daten verfügbar</p>
      <p className="text-muted-foreground mb-4">
        Bitte laden Sie zuerst eine Datei hoch, um die Daten hier anzuzeigen.
      </p>
      <Button asChild>
        <Link to="/file-upload" className="flex items-center gap-2">
          <UploadIcon className="h-4 w-4" />
          <span>Zur Upload-Seite</span>
        </Link>
      </Button>
    </div>
  );
};

export default ConcessionsContent;

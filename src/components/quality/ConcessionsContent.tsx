
import React from "react";
import NoDataMessage from "./NoDataMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, CalendarIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ConcessionsContentProps {
  concessionsData: any | null;
}

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData }) => {
  if (!concessionsData) {
    return <NoDataMessage category="Concessions" />;
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-orange-500" /> 
              Concessions Daten
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/file-upload" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Neue Datei hochladen</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <CalendarIcon className="h-4 w-4" />
            <span>Dateiname: {concessionsData.fileName}</span>
            <span className="text-sm text-muted-foreground">
              • Dateityp: {concessionsData.type.toUpperCase()}
            </span>
          </div>

          <div className="border p-4 rounded-md bg-orange-50/50">
            <p className="text-muted-foreground italic">
              Die Darstellung der Concessions-Daten kann hier erweitert werden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConcessionsContent;


import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, FileSpreadsheet, CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MentorTable from "./mentor/MentorTable";

interface MentorContentProps {
  mentorData: any | null;
}

const MentorContent: React.FC<MentorContentProps> = ({ mentorData }) => {
  if (!mentorData) {
    return renderNoDataMessage();
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-500" /> 
              Mentor Programm - KW{mentorData.weekNumber}/{mentorData.year}
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
            <span>Dateiname: {mentorData.fileName}</span>
            <span className="text-sm text-muted-foreground">
              • {mentorData.drivers?.length || 0} Fahrer
            </span>
          </div>
          
          <MentorTable data={mentorData} />
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for "No data" message
const renderNoDataMessage = () => {
  return (
    <div className="p-6 border rounded-lg bg-gray-50 text-center">
      <p className="text-lg font-medium mb-3">Keine Mentor-Daten verfügbar</p>
      <p className="text-muted-foreground mb-4">
        Bitte laden Sie zuerst Mentor-Daten hoch, um diese hier anzuzeigen.
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

export default MentorContent;

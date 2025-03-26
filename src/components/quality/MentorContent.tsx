
import React from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

interface MentorContentProps {
  mentorData: any | null;
}

const MentorContent: React.FC<MentorContentProps> = ({ mentorData }) => {
  if (!mentorData) {
    return renderNoDataMessage();
  }

  return (
    <div className="p-4 border rounded-lg bg-background w-full">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Programm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <h3 className="text-lg font-semibold mb-2">Geladene Mentor-Daten</h3>
            <p>Dateiname: {mentorData.fileName}</p>
            <p>Dateityp: {mentorData.type.toUpperCase()}</p>
            {/* Spezifische Darstellung der Mentor-Daten hier */}
          </div>
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

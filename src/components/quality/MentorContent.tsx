
import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, CalendarIcon, UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MentorTable from "./mentor/MentorTable";
import NoDataMessage from "./NoDataMessage";
import { format } from "date-fns";

interface MentorContentProps {
  mentorData: any | null;
}

const MentorContent: React.FC<MentorContentProps> = ({ mentorData }) => {
  if (!mentorData || !mentorData.drivers || mentorData.drivers.length === 0) {
    return <NoDataMessage category="Mentor" />;
  }

  // Format date in German format
  const getFormattedDate = () => {
    if (!mentorData.reportDate) return "";
    
    try {
      const date = new Date(mentorData.reportDate);
      return format(date, "dd.MM.yyyy");
    } catch (error) {
      return mentorData.reportDate;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-slate-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-500" /> 
              <span className="text-indigo-700">Mentor Auswertung - KW{mentorData.weekNumber}/{mentorData.year}</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/file-upload" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span>Neue Datei hochladen</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Dateiname: {mentorData.fileName || 'unbekannt'}</span>
            </div>
            <span className="text-sm text-muted-foreground mx-2">
              • Daten vom {getFormattedDate()}
            </span>
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

export default MentorContent;

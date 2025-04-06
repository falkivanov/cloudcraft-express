
import React, { useEffect } from "react";
import MentorTable from "./mentor/MentorTable";
import { MentorReport } from "@/components/file-upload/processors/mentor/types";
import NoDataMessage from "./NoDataMessage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MentorWeekSelector from "./mentor/components/MentorWeekSelector";
import { useMentorWeek } from "./mentor/hooks/useMentorWeek";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorContentProps {
  mentorData?: MentorReport;
}

const MentorContent: React.FC<MentorContentProps> = ({ mentorData: propsMentorData }) => {
  const navigate = useNavigate();
  const { 
    selectedWeek, 
    setSelectedWeek, 
    weekData, 
    mentorData, 
    isLoading 
  } = useMentorWeek();

  // Use props data only on initial render if provided and no week is selected
  useEffect(() => {
    // If we have props data but no week selected yet, find the corresponding week
    if (propsMentorData && propsMentorData.weekNumber && propsMentorData.year && selectedWeek === "week-0-0") {
      const weekId = `week-${propsMentorData.weekNumber}-${propsMentorData.year}`;
      console.log(`Setting initial week from props: ${weekId}`);
      setSelectedWeek(weekId);
    }
  }, [propsMentorData, selectedWeek, setSelectedWeek]);

  // Handle upload button click
  const handleUploadClick = () => {
    navigate("/file-upload");
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <MentorWeekSelector 
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
          <Button onClick={handleUploadClick}>Mentor Daten hochladen</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              <Skeleton className="h-6 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data view
  if (!mentorData || !mentorData.drivers || mentorData.drivers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <MentorWeekSelector 
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
          <Button onClick={handleUploadClick}>Mentor Daten hochladen</Button>
        </div>
        <NoDataMessage
          category="mentor"
          title="Keine Mentor Daten verfügbar"
          description={`Keine Daten für KW${weekData.weekNumber}/${weekData.year} vorhanden`}
          buttonText="Mentor Daten hochladen"
          onButtonClick={handleUploadClick}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <MentorWeekSelector 
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
        <Button onClick={handleUploadClick}>Neue Mentor Daten hochladen</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            Mentor Übersicht KW{mentorData.weekNumber}/{mentorData.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MentorTable data={mentorData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorContent;

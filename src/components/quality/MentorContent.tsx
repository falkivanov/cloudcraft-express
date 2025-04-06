
import React, { useEffect, useState } from "react";
import MentorTable from "./mentor/MentorTable";
import { MentorDriverData, MentorReport } from "@/components/file-upload/processors/mentor/types";
import NoDataMessage from "./NoDataMessage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MentorWeekSelector from "./mentor/components/MentorWeekSelector";
import { useMentorWeek } from "./mentor/hooks/useMentorWeek";
import { loadFromStorage } from "@/utils/storage";

interface MentorContentProps {
  mentorData?: MentorReport;
}

const MentorContent: React.FC<MentorContentProps> = ({ mentorData: propsMentorData }) => {
  const [mentorData, setMentorData] = useState<MentorReport | null>(null);
  
  const navigate = useNavigate();
  const { selectedWeek, setSelectedWeek, weekData } = useMentorWeek();

  useEffect(() => {
    const handleMentorDataRemoved = () => {
      console.log("Mentor data removed event detected");
      setMentorData(null);
    };

    window.addEventListener("mentorDataRemoved", handleMentorDataRemoved);
    
    return () => {
      window.removeEventListener("mentorDataRemoved", handleMentorDataRemoved);
    };
  }, []);

  useEffect(() => {
    try {
      // First check if we have data from props
      if (propsMentorData) {
        setMentorData(propsMentorData);
        return;
      }
      
      // Check if we have data for the selected week
      if (weekData.weekNumber > 0 && weekData.year > 0) {
        // Try to load data for the selected week
        const weekKey = `mentor_data_week_${weekData.weekNumber}_${weekData.year}`;
        const weekSpecificData = loadFromStorage<MentorReport>(weekKey);
        
        if (weekSpecificData) {
          console.log(`Found week-specific mentor data for KW${weekData.weekNumber}/${weekData.year}`);
          setMentorData(weekSpecificData);
          return;
        }
      }
      
      // Otherwise try to load from localStorage
      const storedData = localStorage.getItem("mentorData");
      if (storedData) {
        const data = JSON.parse(storedData);
        setMentorData(data);
      } else {
        setMentorData(null);
      }
    } catch (error) {
      console.error("Error loading mentor data:", error);
      setMentorData(null);
    }
  }, [weekData, propsMentorData]);

  const handleUploadClick = () => {
    navigate("/file-upload");
  };

  if (!mentorData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <MentorWeekSelector 
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
          />
        </div>
        <NoDataMessage
          category="mentor"
          title="Keine Mentor Daten verfügbar"
          description="Bitte laden Sie eine Mentor Excel-Datei hoch."
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

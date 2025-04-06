
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

  // Event listener for data updates/removals
  useEffect(() => {
    const handleMentorDataRemoved = () => {
      console.log("Mentor data removed event detected");
      setMentorData(null);
    };

    const handleMentorDataUpdated = (event: CustomEvent) => {
      console.log("Mentor data updated event detected", event.detail);
      // Only reload data if it matches our currently selected week
      if (event.detail && 
          event.detail.weekNumber === weekData.weekNumber && 
          event.detail.year === weekData.year) {
        console.log("Reloading data for the current week due to update");
        loadMentorData();
      }
    };

    window.addEventListener("mentorDataRemoved", handleMentorDataRemoved);
    window.addEventListener("mentorDataUpdated", handleMentorDataUpdated as EventListener);
    
    return () => {
      window.removeEventListener("mentorDataRemoved", handleMentorDataRemoved);
      window.removeEventListener("mentorDataUpdated", handleMentorDataUpdated as EventListener);
    };
  }, [weekData]);

  // Load mentor data whenever the selected week changes
  const loadMentorData = () => {
    try {
      // First check if we have data from props
      if (propsMentorData) {
        console.log("Using mentor data from props");
        setMentorData(propsMentorData);
        return;
      }
      
      // If there's a selected week, try to load data for that specific week
      if (weekData.weekNumber > 0 && weekData.year > 0) {
        const weekKey = `mentor_data_week_${weekData.weekNumber}_${weekData.year}`;
        console.log(`Looking for mentor data with key: ${weekKey}`);
        const weekSpecificData = loadFromStorage<MentorReport>(weekKey);
        
        if (weekSpecificData && weekSpecificData.drivers && weekSpecificData.drivers.length > 0) {
          console.log(`Found week-specific mentor data for KW${weekData.weekNumber}/${weekData.year}`, weekSpecificData);
          setMentorData(weekSpecificData);
        } else {
          console.log(`No valid data found for key: ${weekKey}`);
          setMentorData(null);
        }
        return;
      }
      
      // Fallback to legacy storage
      const storedData = localStorage.getItem("mentorData");
      if (storedData) {
        const data = JSON.parse(storedData) as MentorReport;
        if (data && data.drivers && data.drivers.length > 0) {
          setMentorData(data);
        } else {
          setMentorData(null);
        }
      } else {
        setMentorData(null);
      }
    } catch (error) {
      console.error("Error loading mentor data:", error);
      setMentorData(null);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    navigate("/file-upload");
  };

  // Load mentor data when selected week changes or props change
  useEffect(() => {
    console.log("Selected week or week data changed, loading mentor data", {
      weekNumber: weekData.weekNumber,
      year: weekData.year,
      weekId: selectedWeek
    });
    loadMentorData();
  }, [selectedWeek, weekData, propsMentorData]);

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


import { useState, useEffect, useCallback } from "react";
import { loadFromStorage } from "@/utils/storage";
import { AvailableWeek, parseWeekKey, createWeekId, sortWeeks, getNoDataWeek } from "../utils/weekSelectorUtils";

interface UseAvailableWeeksProps {
  selectedWeek: string;
  setSelectedWeek: (value: string) => void;
}

export function useAvailableWeeks({ selectedWeek, setSelectedWeek }: UseAvailableWeeksProps) {
  const [availableWeeks, setAvailableWeeks] = useState<AvailableWeek[]>([getNoDataWeek()]);

  // Load all available weeks from storage
  const loadAvailableWeeks = useCallback(() => {
    try {
      const weeks: AvailableWeek[] = [];
      
      // Scan all localStorage keys for mentor data by week
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mentor_data_week_')) {
          const weekInfo = parseWeekKey(key);
          
          if (weekInfo) {
            const { weekNum, year } = weekInfo;
            const weekId = createWeekId(weekNum, year);
            
            // Check if this week already exists in our array
            if (!weeks.some(w => w.id === weekId)) {
              // Verify the data exists and is valid
              const weekData = loadFromStorage(key);
              if (weekData) {
                weeks.push({
                  id: weekId,
                  label: `KW ${weekNum}/${year}`,
                  weekNum,
                  year
                });
                console.log(`Added week ${weekNum}/${year} to available weeks`);
              }
            }
          }
        }
      }
      
      // Check current mentor data (for backward compatibility)
      const mentorDataString = localStorage.getItem("mentorData");
      if (mentorDataString) {
        try {
          const mentorData = JSON.parse(mentorDataString);
          if (mentorData && mentorData.weekNumber && mentorData.year) {
            const weekId = createWeekId(mentorData.weekNumber, mentorData.year);
            // Only add if not already in the list
            if (!weeks.some(w => w.id === weekId)) {
              weeks.push({
                id: weekId,
                label: `KW ${mentorData.weekNumber}/${mentorData.year}`,
                weekNum: mentorData.weekNumber,
                year: mentorData.year
              });
            }
          }
        } catch (e) {
          console.error("Error parsing current mentor data:", e);
        }
      }
      
      // Check upload history for additional mentor files
      const historyString = localStorage.getItem('fileUploadHistory');
      if (historyString) {
        try {
          const history = JSON.parse(historyString);
          const mentorUploads = history.filter((item: any) => 
            item.category === "mentor" && 
            item.weekNumber && 
            item.year
          );
          
          // Add unique weeks from history
          mentorUploads.forEach((upload: any) => {
            const weekId = createWeekId(upload.weekNumber, upload.year);
            if (!weeks.some(w => w.id === weekId)) {
              // Check if data exists for this week
              const weekKey = `mentor_data_week_${upload.weekNumber}_${upload.year}`;
              const weekData = loadFromStorage(weekKey);
              
              if (weekData) {
                weeks.push({
                  id: weekId,
                  label: `KW ${upload.weekNumber}/${upload.year}`,
                  weekNum: upload.weekNumber,
                  year: upload.year
                });
              }
            }
          });
        } catch (e) {
          console.error("Error processing upload history:", e);
        }
      }
      
      // Sort weeks by year and week number (newest first)
      const sortedWeeks = sortWeeks(weeks);
      
      // If we have weeks, update the state
      if (sortedWeeks.length > 0) {
        setAvailableWeeks(sortedWeeks);
        
        // If current selection is not valid, select the latest week
        if (!selectedWeek || !sortedWeeks.some(w => w.id === selectedWeek)) {
          console.log(`Current selection ${selectedWeek} not found in available weeks, selecting newest ${sortedWeeks[0].id}`);
          setSelectedWeek(sortedWeeks[0].id);
        }
      } else {
        // No data available
        setAvailableWeeks([getNoDataWeek()]);
        setSelectedWeek("week-0-0");
      }
    } catch (error) {
      console.error("Error loading available mentor weeks:", error);
      setAvailableWeeks([{
        id: "week-0-0",
        label: "Fehler beim Laden",
        weekNum: 0,
        year: 0
      }]);
    }
  }, [selectedWeek, setSelectedWeek]);

  // Set up event listeners for data changes
  useEffect(() => {
    loadAvailableWeeks();

    // Listen for mentor data updates and removals
    const handleDataChange = () => {
      console.log("Mentor data updated/removed event received, refreshing available weeks");
      loadAvailableWeeks();
    };

    window.addEventListener('mentorDataUpdated', handleDataChange);
    window.addEventListener('mentorDataRemoved', handleDataChange);
    
    return () => {
      window.removeEventListener('mentorDataUpdated', handleDataChange);
      window.removeEventListener('mentorDataRemoved', handleDataChange);
    };
  }, [loadAvailableWeeks]);

  return { availableWeeks, loadAvailableWeeks };
}

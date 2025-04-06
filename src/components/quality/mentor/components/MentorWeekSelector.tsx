
import React, { useState, useEffect, useCallback } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MentorReport } from "@/components/file-upload/processors/mentor/types";
import { loadFromStorage } from "@/utils/storage";

interface MentorWeekSelectorProps {
  selectedWeek: string;
  setSelectedWeek: (week: string) => void;
}

const MentorWeekSelector: React.FC<MentorWeekSelectorProps> = ({ selectedWeek, setSelectedWeek }) => {
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [weekLabels, setWeekLabels] = useState<Record<string, string>>({});

  // Find all available weeks using a similar approach to Scorecard
  const findAvailableWeeks = useCallback(() => {
    console.log("Finding available mentor weeks...");
    const weeks: string[] = [];
    const labels: Record<string, string> = {};
    
    // Check local storage for mentor data with pattern: mentor_data_week_X_YYYY
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const match = key.match(/^mentor_data_week_(\d+)_(\d+)$/);
      if (match) {
        const weekNum = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        
        try {
          // Verify data is valid by checking if it has drivers array
          const data = loadFromStorage<MentorReport>(key);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            const weekId = `week-${weekNum}-${year}`;
            weeks.push(weekId);
            labels[weekId] = `KW${weekNum}/${year}`;
            console.log(`Found valid mentor data for KW${weekNum}/${year}`);
          }
        } catch (error) {
          console.error(`Error loading mentor data for key ${key}:`, error);
        }
      }
    }
    
    // Check for legacy data (using the old storage key)
    try {
      const legacyData = localStorage.getItem("mentorData");
      if (legacyData) {
        const data = JSON.parse(legacyData) as MentorReport;
        if (data && data.weekNumber && data.year && Array.isArray(data.drivers) && data.drivers.length > 0) {
          const weekId = `week-${data.weekNumber}-${data.year}`;
          if (!weeks.includes(weekId)) {
            weeks.push(weekId);
            labels[weekId] = `KW${data.weekNumber}/${data.year}`;
            console.log(`Found legacy mentor data for KW${data.weekNumber}/${data.year}`);
          }
        }
      }
    } catch (error) {
      console.error("Error loading legacy mentor data:", error);
    }
    
    // Sort weeks by year and week number (newest first)
    weeks.sort((a, b) => {
      const [, aWeek, aYear] = a.split('-').map(Number);
      const [, bWeek, bYear] = b.split('-').map(Number);
      
      if (aYear !== bYear) {
        return bYear - aYear; // Newer year first
      }
      return bWeek - aWeek; // Newer week first
    });
    
    console.log("Found available mentor weeks:", weeks);
    setAvailableWeeks(weeks);
    setWeekLabels(labels);
    
    // If no week is currently selected but we have weeks, select the first one
    if ((selectedWeek === "week-0-0" || !selectedWeek) && weeks.length > 0) {
      console.log("Auto-selecting first available mentor week:", weeks[0]);
      setSelectedWeek(weeks[0]);
    }
  }, [selectedWeek, setSelectedWeek]);

  // Load available weeks on component mount and when storage changes
  useEffect(() => {
    findAvailableWeeks();

    // Listen for storage changes to refresh available weeks
    const handleStorageChange = () => {
      findAvailableWeeks();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("mentorDataUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("mentorDataUpdated", handleStorageChange);
    };
  }, [findAvailableWeeks]);

  // Handle week navigation
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = availableWeeks.indexOf(selectedWeek);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex + 1;
      if (newIndex >= availableWeeks.length) newIndex = 0;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = availableWeeks.length - 1;
    }
    
    console.log(`Navigating ${direction} from week ${selectedWeek} to week ${availableWeeks[newIndex]}`);
    setSelectedWeek(availableWeeks[newIndex]);
  }, [availableWeeks, selectedWeek, setSelectedWeek]);

  // If no weeks are available, show a message
  if (availableWeeks.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Keine Daten verfügbar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('prev')}
        disabled={availableWeeks.length <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="relative min-w-24">
        <Select
          value={selectedWeek}
          onValueChange={(value) => {
            console.log(`Mentor select changed to: ${value}`);
            setSelectedWeek(value);
          }}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue>
              {weekLabels[selectedWeek] || "Woche wählen"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {availableWeeks.map(weekId => (
              <SelectItem key={weekId} value={weekId}>
                {weekLabels[weekId]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('next')}
        disabled={availableWeeks.length <= 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MentorWeekSelector;

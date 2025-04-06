
import { toast } from "sonner";
import { STORAGE_KEYS, clearStorageItem } from "@/utils/storage";

export interface UploadHistoryItem {
  name: string;
  type: string;
  timestamp: string;
  category: string;
  weekNumber?: number;
  year?: number;
  driversCount?: number;
}

export const getUploadHistory = (): UploadHistoryItem[] => {
  try {
    const historyJSON = localStorage.getItem('fileUploadHistory');
    if (historyJSON) {
      return JSON.parse(historyJSON);
    }
  } catch (error) {
    console.error("Error loading upload history:", error);
  }
  return [];
};

export const addItemToHistory = (item: UploadHistoryItem): void => {
  try {
    const history = getUploadHistory();
    history.unshift(item);
    
    const trimmedHistory = history.slice(0, 100);
    localStorage.setItem('fileUploadHistory', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Error updating upload history:", error);
  }
};

export const removeItemFromHistory = (item: UploadHistoryItem, index: number): boolean => {
  try {
    const history = getUploadHistory();
    const updatedHistory = history.filter((historyItem: UploadHistoryItem, i: number) => 
      !(historyItem.name === item.name && 
        historyItem.timestamp === item.timestamp && 
        historyItem.category === item.category)
    );
    localStorage.setItem('fileUploadHistory', JSON.stringify(updatedHistory));
    
    if (item.category === "customerContact") {
      // Remove only the specific week data if a week is specified
      if (item.weekNumber && item.year) {
        const weekKey = `week-${item.weekNumber}-${item.year}`;
        const htmlStorageKey = `customerContactData_${weekKey}`;
        const parsedStorageKey = `parsedCustomerContactData_${weekKey}`;
        
        localStorage.removeItem(htmlStorageKey);
        localStorage.removeItem(parsedStorageKey);
        console.log(`Removed week-specific customer contact data: ${weekKey}`);
        
        // Check if this was the active week
        const activeWeek = localStorage.getItem("customerContactActiveWeek");
        if (activeWeek === weekKey) {
          localStorage.removeItem("customerContactActiveWeek");
          localStorage.removeItem("customerContactData");
          localStorage.removeItem("parsedCustomerContactData");
          console.log(`Removed active week data as it matched the deleted week: ${weekKey}`);
        }
      } else {
        // Remove all customer contact data if no specific week
        localStorage.removeItem("customerContactData");
        localStorage.removeItem("parsedCustomerContactData");
        localStorage.removeItem("customerContactActiveWeek");
        
        // Also remove all week-specific data
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("customerContactData_week-") || 
                       key.startsWith("parsedCustomerContactData_week-"))) {
            localStorage.removeItem(key);
          }
        }
      }
      
      // Dispatch event to notify components that customer contact data was removed
      window.dispatchEvent(new CustomEvent('customerContactDataRemoved'));
    } else if (item.category === "pod") {
      localStorage.removeItem("podData");
    } else if (item.category === "concessions") {
      localStorage.removeItem("concessionsData");
    } else if (item.category === "mentor") {
      // For Mentor data, also remove week-specific data
      if (item.weekNumber && item.year) {
        const weekKey = `mentor_data_week_${item.weekNumber}_${item.year}`;
        clearStorageItem(weekKey);
        console.log(`Removed week-specific mentor data: ${weekKey}`);
      }
      
      // Remove current mentor data only if it's for the same week
      const currentMentorData = localStorage.getItem("mentorData");
      if (currentMentorData) {
        try {
          const data = JSON.parse(currentMentorData);
          if (data.weekNumber === item.weekNumber && data.year === item.year) {
            localStorage.removeItem("mentorData");
            console.log("Removed current mentor data that matches deleted week");
          }
        } catch (e) {
          console.error("Error parsing current mentor data:", e);
        }
      }
      
      window.dispatchEvent(new CustomEvent('mentorDataRemoved'));
    } else if (item.category === "scorecard") {
      localStorage.removeItem("scorecard_week");
      localStorage.removeItem("scorecard_year");
      localStorage.removeItem("scorecard_data");
      localStorage.removeItem("scorecardData");
      
      clearStorageItem(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      localStorage.removeItem("extractedScorecardData");
      
      const year = new Date().getFullYear();
      for (let week = 1; week <= 53; week++) {
        const weekKey = `scorecard_data_week_${week}_${year}`;
        clearStorageItem(weekKey);
      }
      
      const prevYear = year - 1;
      for (let week = 50; week <= 53; week++) {
        const weekKey = `scorecard_data_week_${week}_${prevYear}`;
        clearStorageItem(weekKey);
      }
      
      console.log("All scorecard data cleared from localStorage");
      
      window.dispatchEvent(new CustomEvent('scorecardDataRemoved'));
    }
    
    toast.success(`Datei ${item.name} erfolgreich gelöscht`, {
      description: `Die zugehörigen Daten wurden ebenfalls entfernt`,
    });
    
    return true;
  } catch (error) {
    console.error("Error removing item from history:", error);
    return false;
  }
};

export const getCategoryDisplayName = (categoryId: string) => {
  switch (categoryId) {
    case "scorecard": return "Scorecard";
    case "customerContact": return "Customer Contact";
    case "pod": return "POD";
    case "concessions": return "Concessions";
    case "mentor": return "Mentor";
    default: return categoryId;
  }
};

export const getCategoryColorClass = (categoryId: string) => {
  switch (categoryId) {
    case "scorecard": return "bg-green-100 text-green-800";
    case "customerContact": return "bg-blue-100 text-blue-800";
    case "pod": return "bg-purple-100 text-purple-800";
    case "concessions": return "bg-orange-100 text-orange-800";
    case "mentor": return "bg-indigo-100 text-indigo-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return dateString;
  }
};


import { toast } from "sonner";
import { STORAGE_KEYS } from "@/utils/storageUtils";

export interface UploadHistoryItem {
  name: string;
  type: string;
  timestamp: string;
  category: string;
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
    
    // Delete associated data
    if (item.category === "customerContact") {
      localStorage.removeItem("customerContactData");
      localStorage.removeItem("parsedCustomerContactData");
    } else if (item.category === "pod") {
      localStorage.removeItem("podData");
    } else if (item.category === "concessions") {
      localStorage.removeItem("concessionsData");
    } else if (item.category === "mentor") {
      localStorage.removeItem("mentorData");
    } else if (item.category === "scorecard") {
      // Remove all scorecard-related data from localStorage
      localStorage.removeItem("scorecard_week");
      localStorage.removeItem("scorecard_year");
      localStorage.removeItem("scorecard_data");
      localStorage.removeItem("scorecardData");
      localStorage.removeItem(STORAGE_KEYS.EXTRACTED_SCORECARD_DATA);
      localStorage.removeItem("extractedScorecardData");
      
      // Dispatch event to notify components that scorecard data has been removed
      window.dispatchEvent(new Event('scorecardDataRemoved'));
      console.log("Scorecard data removed from localStorage");
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

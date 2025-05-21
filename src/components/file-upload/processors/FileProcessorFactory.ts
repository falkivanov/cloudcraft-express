
import { BaseFileProcessor } from "./BaseFileProcessor";
import { GenericProcessor } from "./GenericProcessor";
import { ScorecardProcessor } from "./ScorecardProcessor";
import { CustomerContactProcessor } from "./CustomerContactProcessor";
import { ConcessionsProcessor } from "./ConcessionsProcessor";
import { MentorProcessor } from "./MentorProcessor";
import { api } from "@/services/api";

export class FileProcessorFactory {
  /**
   * Create an appropriate processor based on the category
   */
  public static createProcessor(
    file: File, 
    category: string,
    setProcessing: (processing: boolean) => void,
    onFileUpload?: (file: File, type: string, category: string) => void
  ): BaseFileProcessor {
    console.log(`Creating processor for category: ${category} and file: ${file.name}`);
    
    // Check if API is available for enhanced processing
    const useApi = import.meta.env.VITE_USE_API === "true";
    
    if (useApi) {
      // We could create API-aware processors here in the future
      console.log("API processing enabled, but using local processors for now");
      // API checks will happen inside the processors themselves
    }
    
    switch (category) {
      case "scorecard":
        return new ScorecardProcessor(file, setProcessing, onFileUpload);
      case "customerContact":
        return new CustomerContactProcessor(file, category, setProcessing, onFileUpload);
      case "concessions":
        return new ConcessionsProcessor(file, category, setProcessing, onFileUpload);
      case "mentor":
        return new MentorProcessor(file, category, setProcessing, onFileUpload);
      default:
        return new GenericProcessor(file, category, setProcessing, onFileUpload);
    }
  }
}

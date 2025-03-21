
import { BaseFileProcessor } from "./BaseFileProcessor";
import { ScorecardProcessor } from "./ScorecardProcessor";
import { CustomerContactProcessor } from "./CustomerContactProcessor";
import { PODProcessor } from "./PODProcessor";
import { ConcessionsProcessor } from "./ConcessionsProcessor";
import { GenericProcessor } from "./GenericProcessor";

/**
 * Factory class to create appropriate file processors based on file category
 */
export class FileProcessorFactory {
  /**
   * Create a processor for the given file and category
   */
  public static createProcessor(
    file: File,
    category: string,
    onFileUpload?: (file: File, type: string, category: string) => void
  ): BaseFileProcessor {
    switch (category) {
      case "scorecard":
        return new ScorecardProcessor(file, category, onFileUpload);
        
      case "customerContact":
        return new CustomerContactProcessor(file, category, onFileUpload);
        
      case "pod":
        return new PODProcessor(file, category, onFileUpload);
        
      case "concessions":
        return new ConcessionsProcessor(file, category, onFileUpload);
        
      default:
        return new GenericProcessor(file, category, onFileUpload);
    }
  }
}


import { BaseFileProcessor, ProcessOptions } from "./BaseFileProcessor";

/**
 * Generic processor for file types that don't need special handling
 */
export class GenericProcessor extends BaseFileProcessor {
  /**
   * Process a generic file
   */
  public async process(options: ProcessOptions = {}): Promise<boolean> {
    const { showToasts = true } = options;
    this.setProcessing(true);
    
    try {
      this.processDefault(showToasts);
      return true;
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    } finally {
      this.setProcessing(false);
    }
  }
}

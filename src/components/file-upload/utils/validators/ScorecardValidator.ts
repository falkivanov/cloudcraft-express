
import { BaseValidator, ValidationResult } from "./BaseValidator";

/**
 * Validator for Scorecard files (PDF format)
 */
export class ScorecardValidator extends BaseValidator {
  public validate(): ValidationResult {
    // Check file extension
    if (!this.isExtensionValid(['.pdf'])) {
      return {
        isValid: false,
        message: this.getInvalidTypeMessage()
      };
    }

    // Extract KW/Week information from filename with improved patterns
    const weekPatterns = [
      /Week[_\s-]*(\d+)/i,      // Week12, Week-12, Week_12, Week 12
      /KW[_\s-]*(\d+)/i,        // KW12, KW-12, KW_12, KW 12
      /W[_\s-]*(\d+)/i,         // W12, W-12, W_12, W 12
      /(?:_|\s|-)(\d{1,2})(?:_|-|\s)/,  // _12_ or -12- or _12- etc.
      /CW[_\s-]*(\d+)/i,        // CW12, CW-12, CW_12, CW 12
      /(\d{1,2})_(?:20\d{2})/   // 12_2023
    ];
    
    let successMessage = this.getSuccessMessage();
    let extractedWeek = 0;
    
    // Try each pattern until we find a match
    for (const pattern of weekPatterns) {
      const weekMatch = this.file.name.match(pattern);
      if (weekMatch && weekMatch[1]) {
        extractedWeek = parseInt(weekMatch[1], 10);
        console.log(`Detected Week ${extractedWeek} in filename with pattern ${pattern}`);
        
        if (extractedWeek > 0 && extractedWeek <= 53) {
          successMessage = `Datei "${this.file.name}" ausgewählt (KW ${extractedWeek})`;
          break;
        }
      }
    }
    
    // If no week found, check if the filename contains a date that can be used to determine the week
    if (extractedWeek === 0) {
      // Look for date patterns in filename
      const datePatterns = [
        /(\d{2})[\.-](\d{2})[\.-](\d{4})/,  // DD.MM.YYYY or DD-MM-YYYY
        /(\d{4})[\.-](\d{2})[\.-](\d{2})/,  // YYYY.MM.DD or YYYY-MM-DD
        /(\d{2})(\d{2})(\d{4})/            // DDMMYYYY
      ];
      
      for (const pattern of datePatterns) {
        const dateMatch = this.file.name.match(pattern);
        if (dateMatch) {
          try {
            let date;
            if (pattern.source === '(\\d{2})[\\.-](\\d{2})[\\.-](\\d{4})') {
              // DD.MM.YYYY format
              date = new Date(
                parseInt(dateMatch[3], 10), 
                parseInt(dateMatch[2], 10) - 1, 
                parseInt(dateMatch[1], 10)
              );
            } else if (pattern.source === '(\\d{4})[\\.-](\\d{2})[\\.-](\\d{2})') {
              // YYYY.MM.DD format
              date = new Date(
                parseInt(dateMatch[1], 10), 
                parseInt(dateMatch[2], 10) - 1, 
                parseInt(dateMatch[3], 10)
              );
            } else {
              // DDMMYYYY format
              date = new Date(
                parseInt(dateMatch[3], 10), 
                parseInt(dateMatch[2], 10) - 1, 
                parseInt(dateMatch[1], 10)
              );
            }
            
            if (!isNaN(date.getTime())) {
              // Calculate the week number from the date
              // Get first day of year
              const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
              // Get days passed from first day plus adjustment
              const daysPassed = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
              // Calculate week number
              extractedWeek = Math.ceil((daysPassed + firstDayOfYear.getDay() + 1) / 7);
              
              console.log(`Calculated week ${extractedWeek} from date in filename`);
              successMessage = `Datei "${this.file.name}" ausgewählt (KW ${extractedWeek})`;
              break;
            }
          } catch (e) {
            console.error("Error parsing date from filename:", e);
          }
        }
      }
    }
    
    return {
      isValid: true,
      message: successMessage
    };
  }
}

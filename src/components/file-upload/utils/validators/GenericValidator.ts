
import { BaseValidator, ValidationResult } from "./BaseValidator";
import { getCategoryInfo } from "../../fileCategories";

/**
 * Generic validator for file types that don't have specific validators
 */
export class GenericValidator extends BaseValidator {
  public validate(): ValidationResult {
    const categoryInfo = getCategoryInfo(this.categoryId);
    
    if (!categoryInfo) {
      return {
        isValid: false,
        message: "Ungültige Kategorie ausgewählt"
      };
    }
    
    // Check file type against expected type
    const extension = this.getFileExtension();
    let isValid = false;
    
    if (categoryInfo.expectedType === "pdf" && extension === ".pdf") {
      isValid = true;
    } else if (categoryInfo.expectedType === "html" && (extension === ".html" || extension === ".htm")) {
      isValid = true;
    } else if (categoryInfo.expectedType === "excel" && (extension === ".xlsx" || extension === ".xls")) {
      isValid = true;
    } else if (categoryInfo.expectedType === "csv" && extension === ".csv") {
      isValid = true;
    }
    
    return {
      isValid,
      message: isValid ? this.getSuccessMessage() : this.getInvalidTypeMessage()
    };
  }
}

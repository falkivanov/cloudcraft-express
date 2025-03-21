
import { BaseValidator } from "./BaseValidator";
import { ScorecardValidator } from "./ScorecardValidator";
import { CustomerContactValidator } from "./CustomerContactValidator";
import { PODValidator } from "./PODValidator";
import { ConcessionsValidator } from "./ConcessionsValidator";
import { GenericValidator } from "./GenericValidator";

/**
 * Factory class to create appropriate validators based on file category
 */
export class ValidatorFactory {
  /**
   * Create a validator for the given file and category
   */
  public static createValidator(file: File, category: string): BaseValidator {
    switch (category) {
      case "scorecard":
        return new ScorecardValidator(file, category);
        
      case "customerContact":
        return new CustomerContactValidator(file, category);
        
      case "pod":
        return new PODValidator(file, category);
        
      case "concessions":
        return new ConcessionsValidator(file, category);
        
      default:
        return new GenericValidator(file, category);
    }
  }
}

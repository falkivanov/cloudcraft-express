
import { BaseValidator } from "./BaseValidator";
import { GenericValidator } from "./GenericValidator";
import { ScorecardValidator } from "./ScorecardValidator";
import { CustomerContactValidator } from "./CustomerContactValidator";
import { ConcessionsValidator } from "./ConcessionsValidator";
import { MentorValidator } from "./MentorValidator";

export class ValidatorFactory {
  /**
   * Create an appropriate validator based on the category
   */
  public static createValidator(
    file: File,
    category: string
  ): BaseValidator {
    switch (category) {
      case "scorecard":
        return new ScorecardValidator(file, category);
      case "customerContact":
        return new CustomerContactValidator(file, category);
      case "concessions":
        return new ConcessionsValidator(file, category);
      case "mentor":
        return new MentorValidator(file, category);
      default:
        return new GenericValidator(file, category);
    }
  }
}

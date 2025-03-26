
import { BaseValidator } from "./BaseValidator";
import { GenericValidator } from "./GenericValidator";
import { ScorecardValidator } from "./ScorecardValidator";
import { CustomerContactValidator } from "./CustomerContactValidator";
import { PODValidator } from "./PODValidator";
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
        return new ScorecardValidator(file);
      case "customerContact":
        return new CustomerContactValidator(file);
      case "pod":
        return new PODValidator(file);
      case "concessions":
        return new ConcessionsValidator(file);
      case "mentor":
        return new MentorValidator(file);
      default:
        return new GenericValidator(file);
    }
  }
}


import { toast } from "sonner";
import { getCategoryInfo } from "../fileCategories";
import { ValidatorFactory } from "./validators/ValidatorFactory";

/**
 * Validates a file based on category and returns whether it's valid
 */
export const validateFile = (selectedFile: File, selectedCategory: string): boolean => {
  const categoryInfo = getCategoryInfo(selectedCategory);
    
  if (!categoryInfo) {
    toast.error("Ungültige Kategorie ausgewählt");
    return false;
  }
  
  // Create appropriate validator and validate the file
  const validator = ValidatorFactory.createValidator(selectedFile, selectedCategory);
  const validationResult = validator.validate();
  
  if (validationResult.isValid) {
    toast.success(validationResult.message);
  } else {
    toast.error(validationResult.message);
  }
  
  return validationResult.isValid;
};

/**
 * Display appropriate success toast for selected file
 * @deprecated Use validator classes directly instead
 */
export const showFileSelectedToast = (file: File, categoryId: string) => {
  // Create validator and get success message
  const validator = ValidatorFactory.createValidator(file, categoryId);
  const validationResult = validator.validate();
  
  if (validationResult.isValid) {
    toast.success(validationResult.message);
  }
};

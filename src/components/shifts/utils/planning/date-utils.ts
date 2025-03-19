
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Returns day of week abbreviation (Mo, Di, etc.)
export const getDayAbbreviation = (date: Date): string => {
  return format(date, "EEEEEE", { locale: de });
};

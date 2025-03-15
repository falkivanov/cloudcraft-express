
/**
 * Formats a date string to a localized format
 * @param dateString The date string to format
 * @returns A formatted date string in German locale or "-" if no date is provided
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('de-DE');
};

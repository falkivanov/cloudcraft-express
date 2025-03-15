
/**
 * Formats a date string to a localized format
 * @param dateString The date string to format
 * @param locale The locale to format the date for (default: 'de-DE')
 * @returns A formatted date string in the specified locale or "-" if no date is provided
 */
export const formatDate = (dateString: string | null, locale = 'de-DE'): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString(locale);
};

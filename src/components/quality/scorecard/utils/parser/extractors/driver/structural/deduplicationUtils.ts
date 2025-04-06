
/**
 * Utility functions to deduplicate and clean up extracted driver data
 */

/**
 * Deduplicate drivers based on name
 */
export function deduplicateDrivers(drivers: any[]): any[] {
  if (drivers.length === 0) return [];
  
  const uniqueDrivers: any[] = [];
  const seenDrivers = new Set();
  
  for (const driver of drivers) {
    if (!seenDrivers.has(driver.name)) {
      seenDrivers.add(driver.name);
      uniqueDrivers.push(driver);
    }
  }
  
  console.log(`Deduplicated ${drivers.length} drivers to ${uniqueDrivers.length} unique drivers`);
  return uniqueDrivers;
}

/**
 * Check if the extracted drivers are likely to be valid
 */
export function validateDriverExtraction(drivers: any[]): boolean {
  // Check if we have any drivers with the expected 14-character A-prefix format
  const hasExpectedFormat = drivers.some(d => /^A[A-Z0-9]{13}$/.test(d.name));
  
  // Check if we have any drivers with 'A' prefix (not necessarily 14 characters)
  const hasAnyAPrefix = drivers.some(d => d.name.startsWith('A'));
  
  // We consider the extraction valid if we have at least 5 drivers with A-prefix
  const hasReasonableNumberOfDrivers = drivers.length >= 5 && hasAnyAPrefix;
  
  return hasReasonableNumberOfDrivers;
}

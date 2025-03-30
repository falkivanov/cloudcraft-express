
/**
 * Utilities for detecting and validating KPIs
 */

/**
 * Check if text resembles a KPI name
 */
export function isLikelyKPI(text: string) {
  if (!text) return false;
  
  // Clean the text
  const cleanText = text.trim().toLowerCase();
  
  // Skip percentage values or status words
  if (/^\d+%$/.test(cleanText) || 
      /^(good|great|fair|poor|fantastic)$/i.test(cleanText)) {
    return false;
  }
  
  // Common KPI keywords
  const kpiKeywords = [
    'compliance', 'rate', 'adoption', 'dpmo', 'capacity', 
    'reliability', 'delivery', 'received', 'photo', 'contact',
    'escalation', 'feedback', 'audit', 'mentor', 'safe', 'driving',
    'hours', 'completion'
  ];
  
  // Check if any keyword is part of the text
  return kpiKeywords.some(keyword => cleanText.includes(keyword));
}

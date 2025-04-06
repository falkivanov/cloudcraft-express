import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Gets the CSS background class based on the rating value
 */
export function getRatingBackground(rating: string | number | undefined): string {
  if (!rating) return '';
  
  const ratingStr = rating.toString().toLowerCase();
  
  if (ratingStr.includes('low') || ratingStr.includes('niedrig')) {
    return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
  } else if (ratingStr.includes('med') || ratingStr.includes('mittel')) {
    return 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200';
  } else if (ratingStr.includes('high') || ratingStr.includes('hoch')) {
    return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
  }
  
  // Fallback to default badge style
  return '';
}

/**
 * Formats and displays a score value without color emphasis
 */
export function getScoreDisplay(score: string | number | undefined): React.ReactNode {
  if (!score) return '-';
  
  const numScore = typeof score === 'string' 
    ? parseFloat(score.replace(/[^\d.-]/g, '')) 
    : score;
  
  if (!isNaN(numScore)) {
    // Simply return the score as plain text
    return numScore.toFixed(0);
  }
  
  // If not a number, just display the raw value
  return score;
}

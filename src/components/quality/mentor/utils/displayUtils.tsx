
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
 * Formats and displays a score value with color emphasis based on score range
 * - 800+ blue (fantastic)
 * - 710-799 orange (good)
 * - <710 red (needs improvement)
 */
export function getScoreDisplay(score: string | number | undefined): React.ReactNode {
  if (!score) return '-';
  
  const numScore = typeof score === 'string' 
    ? parseFloat(score.replace(/[^\d.-]/g, '')) 
    : score;
  
  if (!isNaN(numScore)) {
    // Apply color styling based on score ranges
    let colorClass = '';
    
    if (numScore >= 800) {
      colorClass = 'text-blue-600 font-semibold';
    } else if (numScore >= 710) {
      colorClass = 'text-amber-500 font-semibold';
    } else {
      colorClass = 'text-red-500 font-semibold';
    }
    
    // Return formatted score with appropriate color
    return <span className={colorClass}>{numScore.toFixed(0)}</span>;
  }
  
  // If not a number, just display the raw value
  return score;
}

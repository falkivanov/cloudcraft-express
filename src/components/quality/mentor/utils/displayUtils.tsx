
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
 * Formats and displays a score value with appropriate styling
 */
export function getScoreDisplay(score: string | number | undefined): React.ReactNode {
  if (!score) return '-';
  
  const numScore = typeof score === 'string' 
    ? parseFloat(score.replace(/[^\d.-]/g, '')) 
    : score;
  
  if (!isNaN(numScore)) {
    // FICO score thresholds
    if (numScore >= 800) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        {numScore.toFixed(0)}
      </Badge>;
    } else if (numScore >= 700) {
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
        {numScore.toFixed(0)}
      </Badge>;
    } else if (numScore >= 600) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
        {numScore.toFixed(0)}
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        {numScore.toFixed(0)}
      </Badge>;
    }
  }
  
  // If not a number, just display the raw value
  return score;
}

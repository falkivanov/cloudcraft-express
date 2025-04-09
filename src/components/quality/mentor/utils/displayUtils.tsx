
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
 * Formats and displays a score value with color-coded bubbles based on score value
 */
export function getScoreDisplay(score: string | number | undefined): React.ReactNode {
  if (!score) return '-';
  
  const numScore = typeof score === 'string' 
    ? parseFloat(score.replace(/[^\d.-]/g, '')) 
    : score;
  
  if (!isNaN(numScore)) {
    // Get color based on score value
    const { bgColor, textColor } = getScoreColors(numScore);
    
    // Return a colored bubble with the score
    return (
      <div className={cn(
        "inline-flex items-center justify-center rounded-full w-12 h-12 font-medium",
        bgColor, textColor
      )}>
        {Math.round(numScore)}
      </div>
    );
  }
  
  // If not a number, just display the raw value
  return score;
}

/**
 * Returns color classes based on score thresholds:
 * - Under 710: Red
 * - 710-799: Orange
 * - 800+: Blue
 */
export function getScoreColors(score: number): { bgColor: string, textColor: string } {
  if (score < 710) {
    return {
      bgColor: 'bg-red-100',
      textColor: 'text-red-700'
    };
  } else if (score >= 710 && score < 800) {
    return {
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700'
    };
  } else {
    return {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    };
  }
}

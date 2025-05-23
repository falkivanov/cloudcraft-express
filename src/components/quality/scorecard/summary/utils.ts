
// Utility functions for the summary cards

// Function to get the color class based on status
export const getStatusColorClass = (status: string | undefined | null) => {
  if (!status) return "text-gray-600"; // Fallback for undefined or null
  
  switch (status.toLowerCase()) {
    case "fantastic":
      return "text-blue-600";
    case "great":
      return "text-yellow-600";
    case "fair":
      return "text-orange-600";
    case "poor":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Function to get rank color
export const getRankColorClass = (rank: number) => {
  switch (rank) {
    case 1:
      return "text-amber-500"; // Gold
    case 2:
      return "text-gray-400"; // Silver
    case 3:
      return "text-amber-700"; // Bronze
    default:
      return "text-gray-900"; // Black for ranks > 3
  }
};

// Determine if rank changed from previous week
export const getRankChangeInfo = (rankNote: string | undefined) => {
  if (!rankNote) return null;
  
  // Extract the numerical value from rankNote (e.g., "+2 WoW", "-1 WoW", "0 WoW")
  const match = rankNote.match(/([+-]?\d+)\s+WoW/);
  if (!match) return null;
  
  const change = parseInt(match[1], 10);
  
  if (change < 0) {
    // Negative change means rank worsened (e.g., -2 means went from rank 3 to rank 5)
    return { icon: null, color: "text-red-500" }; // Icon will be added in the component
  } else if (change > 0) {
    // Positive change means rank improved (e.g., +2 means went from rank 5 to rank 3)
    return { icon: null, color: "text-green-500" }; // Icon will be added in the component
  }
  
  // No change
  return null;
};

// Calculate changes from previous week
export const getMetricChange = (current: number, previous: number | undefined) => {
  if (previous === undefined) return null;
  
  const difference = current - previous;
  const percentChange = previous !== 0 ? (difference / previous) * 100 : 0;
  
  return {
    difference,
    percentChange,
    isPositive: difference > 0
  };
};

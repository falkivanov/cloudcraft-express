
import React, { useCallback } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface WeekOption {
  id: string;
  label: string;
  weekNum?: number;
  year?: number;
  date?: Date;
}

interface WeekSelectorWithArrowsProps {
  selectedWeek: string;
  setSelectedWeek: (week: string) => void;
  availableWeeks: WeekOption[];
  isLoading?: boolean;
  className?: string;
}

const WeekSelectorWithArrows: React.FC<WeekSelectorWithArrowsProps> = ({ 
  selectedWeek, 
  setSelectedWeek, 
  availableWeeks, 
  isLoading = false,
  className = ""
}) => {
  // Navigate to previous/next week
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = availableWeeks.findIndex(week => week.id === selectedWeek);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex + 1;
      if (newIndex >= availableWeeks.length) newIndex = 0;
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = availableWeeks.length - 1;
    }
    
    setSelectedWeek(availableWeeks[newIndex].id);
  }, [availableWeeks, selectedWeek, setSelectedWeek]);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Skeleton className="h-9 w-24" />
        <Button variant="outline" size="sm" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // If no weeks are available, show a disabled state
  if (availableWeeks.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="h-9 px-3 flex items-center text-sm text-muted-foreground border rounded-md">
          Keine Daten verfügbar
        </div>
        <Button variant="outline" size="sm" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('prev')}
        disabled={availableWeeks.length <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="relative min-w-24">
        <Select
          value={selectedWeek}
          onValueChange={setSelectedWeek}
        >
          <SelectTrigger className="h-9 bg-white">
            <SelectValue>
              {availableWeeks.find(week => week.id === selectedWeek)?.label || "Woche wählen"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {availableWeeks.map(week => (
              <SelectItem key={week.id} value={week.id}>
                {week.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateWeek('next')}
        disabled={availableWeeks.length <= 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekSelectorWithArrows;

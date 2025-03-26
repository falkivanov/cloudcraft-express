
import { useState, useEffect, useCallback } from "react";

export const useFinalizedDays = () => {
  // Track finalized days
  const [finalizedDays, setFinalizedDays] = useState<string[]>([]);
  const [showNextDaySchedule, setShowNextDaySchedule] = useState(false);
  
  // Load finalized days from localStorage
  useEffect(() => {
    const loadFinalizedDays = () => {
      try {
        const savedFinalizedDays = localStorage.getItem('finalizedDays');
        if (savedFinalizedDays) {
          const parsedFinalizedDays = JSON.parse(savedFinalizedDays);
          console.log('Loaded finalized days from localStorage:', parsedFinalizedDays);
          setFinalizedDays(parsedFinalizedDays);
        }
      } catch (error) {
        console.error('Error loading finalized days from localStorage:', error);
      }
    };

    loadFinalizedDays();
  }, []);
  
  // Save finalized days to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('finalizedDays', JSON.stringify(finalizedDays));
    } catch (error) {
      console.error('Error saving finalized days to localStorage:', error);
    }
  }, [finalizedDays]);
  
  // Memoize the finalize day function to prevent unnecessary rerenders
  const handleFinalizeDay = useCallback((dateKey: string) => {
    console.log(`Finalizing day: ${dateKey}`);
    setFinalizedDays(prev => {
      if (!prev.includes(dateKey)) {
        return [...prev, dateKey];
      }
      return prev;
    });
  }, []);
  
  // Listen for day finalized events (from other components)
  useEffect(() => {
    const handleDayFinalized = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { dateKey } = customEvent.detail;
      
      if (dateKey && !finalizedDays.includes(dateKey)) {
        console.log(`Day finalized event received: ${dateKey}`);
        setFinalizedDays(prev => [...prev, dateKey]);
      }
    };
    
    window.addEventListener('dayFinalized', handleDayFinalized);
    
    return () => {
      window.removeEventListener('dayFinalized', handleDayFinalized);
    };
  }, [finalizedDays]);

  // Debug finalized days state whenever it changes
  useEffect(() => {
    console.log('Finalized days updated:', finalizedDays);
  }, [finalizedDays]);

  return {
    finalizedDays,
    handleFinalizeDay,
    showNextDaySchedule,
    setShowNextDaySchedule
  };
};

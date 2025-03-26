
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
        } else {
          console.log('No finalized days found in localStorage, starting with empty array');
          setFinalizedDays([]);
        }
      } catch (error) {
        console.error('Error loading finalized days from localStorage:', error);
        // Reset to empty array if data is corrupted
        setFinalizedDays([]);
      }
    };

    loadFinalizedDays();
  }, []);
  
  // Save finalized days to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('finalizedDays', JSON.stringify(finalizedDays));
      console.log('Saved finalized days to localStorage:', finalizedDays);
    } catch (error) {
      console.error('Error saving finalized days to localStorage:', error);
      // Notify user that changes might not persist after page refresh
      if (finalizedDays.length > 0) {
        console.warn('Your finalized days might not persist after page refresh due to storage error');
      }
    }
  }, [finalizedDays]);
  
  // Memoize the finalize day function to prevent unnecessary rerenders
  const handleFinalizeDay = useCallback((dateKey: string) => {
    if (!dateKey) {
      console.error('Invalid dateKey provided to handleFinalizeDay');
      return;
    }
    
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
      try {
        const customEvent = event as CustomEvent;
        const { dateKey } = customEvent.detail;
        
        if (!dateKey) {
          console.error('Missing dateKey in dayFinalized event');
          return;
        }
        
        if (dateKey && !finalizedDays.includes(dateKey)) {
          console.log(`Day finalized event received: ${dateKey}`);
          setFinalizedDays(prev => [...prev, dateKey]);
        }
      } catch (error) {
        console.error('Error handling dayFinalized event:', error);
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

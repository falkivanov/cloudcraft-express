
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { initialEmployees } from "@/data/sampleEmployeeData";

export const useEmployeeLoader = (initialEmployeesData: Employee[] = []) => {
  // Verbesserte Initialisierung mit Fallback
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const processEmployees = (empData: Employee[]) => {
      return empData.map(emp => {
        // For full-time employees (5+ days), clear preferred days and set as flexible
        if (emp.workingDaysAWeek >= 5) {
          return {
            ...emp,
            preferredWorkingDays: [],
            isWorkingDaysFlexible: true
          };
        }
        return emp;
      });
    };
    
    return processEmployees(initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees);
  });
  
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(() => {
    const processEmployees = (empData: Employee[]) => {
      return empData
        .filter(emp => emp.status === "Aktiv")
        .map(emp => {
          // For full-time employees (5+ days), clear preferred days and set as flexible
          if (emp.workingDaysAWeek >= 5) {
            return {
              ...emp,
              preferredWorkingDays: [],
              isWorkingDaysFlexible: true
            };
          }
          return emp;
        });
    };
    
    return processEmployees(initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees);
  });
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const loadEmployeesFromStorage = () => {
      try {
        // Überprüfe, ob ein Zeitstempel existiert, um zu bestätigen, dass die Daten gültig sind
        const dataTimestamp = localStorage.getItem('dataTimestamp');
        
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
          const parsedEmployees = JSON.parse(savedEmployees);
          console.log('Loaded employees from localStorage for shift planning:', parsedEmployees.length);
          if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            // Process employees to ensure full-time employees have no preferred days
            const processedEmployees = parsedEmployees.map(emp => {
              if (emp.workingDaysAWeek >= 5) {
                return {
                  ...emp,
                  preferredWorkingDays: [],
                  isWorkingDaysFlexible: true
                };
              }
              return emp;
            });
            
            setEmployees(processedEmployees);
            setFilteredEmployees(processedEmployees.filter(emp => emp.status === "Aktiv"));
            
            // Nach erfolgreichem Laden, einen neuen Zeitstempel setzen
            localStorage.setItem('dataTimestamp', Date.now().toString());
            return; // Erfolgreich geladen
          }
        }
        
        console.log('No valid employees in localStorage, using fallback data');
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        
        // Process employees to ensure full-time employees have no preferred days
        const processedEmployees = fallbackEmployees.map(emp => {
          if (emp.workingDaysAWeek >= 5) {
            return {
              ...emp,
              preferredWorkingDays: [],
              isWorkingDaysFlexible: true
            };
          }
          return emp;
        });
        
        setEmployees(processedEmployees);
        setFilteredEmployees(processedEmployees.filter(emp => emp.status === "Aktiv"));
        
        // Save to localStorage
        localStorage.setItem('employees', JSON.stringify(processedEmployees));
        localStorage.setItem('dataTimestamp', Date.now().toString());
      } catch (error) {
        console.error('Error loading employees from localStorage:', error);
        // Fallback to initialEmployees
        const fallbackEmployees = initialEmployeesData.length > 0 ? initialEmployeesData : initialEmployees;
        
        // Process employees to ensure full-time employees have no preferred days
        const processedEmployees = fallbackEmployees.map(emp => {
          if (emp.workingDaysAWeek >= 5) {
            return {
              ...emp,
              preferredWorkingDays: [],
              isWorkingDaysFlexible: true
            };
          }
          return emp;
        });
        
        setEmployees(processedEmployees);
        setFilteredEmployees(processedEmployees.filter(emp => emp.status === "Aktiv"));
        
        // Try to save the sample data
        try {
          localStorage.setItem('employees', JSON.stringify(processedEmployees));
          localStorage.setItem('dataTimestamp', Date.now().toString());
        } catch (storageError) {
          console.error('Error saving fallback employee data:', storageError);
        }
      }
    };

    loadEmployeesFromStorage();
    
    // Add an event listener for the beforeunload event to secure the data
    const handleBeforeUnload = () => {
      try {
        // Set a timestamp for data verification
        localStorage.setItem('dataTimestamp', Date.now().toString());
        
        // Ensure employee data is saved
        if (employees.length > 0) {
          // Process employees to ensure full-time employees have no preferred days
          const processedEmployees = employees.map(emp => {
            if (emp.workingDaysAWeek >= 5) {
              return {
                ...emp,
                preferredWorkingDays: [],
                isWorkingDaysFlexible: true
              };
            }
            return emp;
          });
          
          localStorage.setItem('employees', JSON.stringify(processedEmployees));
        }
      } catch (error) {
        console.error('Error saving employees to localStorage before unload:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initialEmployeesData, employees]);

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      // If it's a StorageEvent, check the key
      if (e instanceof StorageEvent) {
        if (e.key === 'employees' && e.newValue) {
          try {
            const updatedEmployees = JSON.parse(e.newValue);
            if (updatedEmployees && Array.isArray(updatedEmployees) && updatedEmployees.length > 0) {
              console.log('Updated employees from storage event for shift planning');
              
              // Process employees to ensure full-time employees have no preferred days
              const processedEmployees = updatedEmployees.map(emp => {
                if (emp.workingDaysAWeek >= 5) {
                  return {
                    ...emp,
                    preferredWorkingDays: [],
                    isWorkingDaysFlexible: true
                  };
                }
                return emp;
              });
              
              setEmployees(processedEmployees);
              setFilteredEmployees(processedEmployees.filter(emp => emp.status === "Aktiv"));
            }
          } catch (error) {
            console.error('Error parsing employees from storage event:', error);
          }
        }
      } else {
        // If it's a generic event (for within the same tab)
        try {
          const savedEmployees = localStorage.getItem('employees');
          if (savedEmployees) {
            const parsedEmployees = JSON.parse(savedEmployees);
            if (parsedEmployees && Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
              // Process employees to ensure full-time employees have no preferred days
              const processedEmployees = parsedEmployees.map(emp => {
                if (emp.workingDaysAWeek >= 5) {
                  return {
                    ...emp,
                    preferredWorkingDays: [],
                    isWorkingDaysFlexible: true
                  };
                }
                return emp;
              });
              
              setEmployees(processedEmployees);
              setFilteredEmployees(processedEmployees.filter(emp => emp.status === "Aktiv"));
            }
          }
        } catch (error) {
          console.error('Error handling internal storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    employees,
    filteredEmployees
  };
};

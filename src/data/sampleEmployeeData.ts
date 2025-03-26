import { Employee } from "@/types/employee";

// Try to load employees from localStorage, or use empty array as fallback
export const initialEmployees: Employee[] = (() => {
  try {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      return JSON.parse(savedEmployees);
    }
  } catch (error) {
    console.error('Error loading employees from localStorage:', error);
  }
  return [];
})();

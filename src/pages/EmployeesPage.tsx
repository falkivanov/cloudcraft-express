
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Container } from "@/components/ui/container";
import { Employee } from "@/types/employee";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [loadedEmployees, setLoadedEmployees] = useState<Employee[]>([]);
  
  // Load employees from localStorage on initial load
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        setLoadedEmployees(JSON.parse(savedEmployees));
      }
    } catch (error) {
      console.error('Error loading employees from localStorage:', error);
    }
  }, []);

  return (
    <Container className="py-8">
      <EmployeePageHeader 
        onAddEmployeeClick={() => setIsAddEmployeeDialogOpen(true)} 
      />
      
      <EmployeePageContent 
        initialEmployees={loadedEmployees} 
        isAddEmployeeDialogOpen={isAddEmployeeDialogOpen}
        setIsAddEmployeeDialogOpen={setIsAddEmployeeDialogOpen}
      />
    </Container>
  );
};

export default EmployeesPage;

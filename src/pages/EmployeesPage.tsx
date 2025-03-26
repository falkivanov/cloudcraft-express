
import React, { useState, useEffect } from "react";
import EmployeePageHeader from "@/components/employees/EmployeePageHeader";
import EmployeePageContent from "@/components/employees/EmployeePageContent";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { Container } from "@/components/ui/container";

const EmployeesPage = () => {
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  
  // Clear localStorage on initial load - ensure it's completely removed
  useEffect(() => {
    localStorage.removeItem('employees');
    localStorage.clear(); // Clear all localStorage data
  }, []);

  return (
    <Container className="py-8">
      <EmployeePageHeader 
        onAddEmployeeClick={() => setIsAddEmployeeDialogOpen(true)} 
      />
      
      <EmployeePageContent 
        initialEmployees={[]} // Pass empty array instead of initialEmployees
        isAddEmployeeDialogOpen={isAddEmployeeDialogOpen}
        setIsAddEmployeeDialogOpen={setIsAddEmployeeDialogOpen}
      />
    </Container>
  );
};

export default EmployeesPage;


import React from "react";
import { User, Briefcase } from "lucide-react";
import StatCard from "./StatCard";
import { Employee } from "@/types/employee";
import { calculateFTE, getEmployeeStatusCounts } from "@/utils/employeeUtils";

interface EmployeeDashboardProps {
  employees: Employee[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employees }) => {
  const statusCounts = getEmployeeStatusCounts(employees);
  const fte = calculateFTE(employees);
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Mitarbeiter Übersicht</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          title="Aktive Mitarbeiter" 
          value={statusCounts.active} 
          icon={User}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Full-Time Equivalents" 
          value={fte}
          description={`Basierend auf ${statusCounts.active} aktiven Mitarbeitern`}
          icon={Briefcase}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;

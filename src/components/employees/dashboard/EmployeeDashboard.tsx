
import React from "react";
import { User, UserCheck, UserX, Briefcase } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Aktive Mitarbeiter" 
          value={statusCounts.active} 
          icon={UserCheck}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard 
          title="Im Urlaub" 
          value={statusCounts.vacation} 
          icon={User}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Krankgemeldet" 
          value={statusCounts.sick} 
          icon={User}
          colorClass="bg-amber-100 text-amber-600"
        />
        <StatCard 
          title="Full-Time Equivalents" 
          value={fte}
          description={`Basierend auf ${statusCounts.active + statusCounts.vacation + statusCounts.sick} aktiven Mitarbeitern`}
          icon={Briefcase}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;

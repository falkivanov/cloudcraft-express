
import React from "react";
import { User, Briefcase, Calendar } from "lucide-react";
import StatCard from "./StatCard";
import { Employee } from "@/types/employee";
import { calculateFTE, getEmployeeStatusCounts, getEmployeesByWorkingDays } from "@/utils/employeeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeeDashboardProps {
  employees: Employee[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employees }) => {
  const statusCounts = getEmployeeStatusCounts(employees);
  const fte = calculateFTE(employees);
  const workingDaysCounts = getEmployeesByWorkingDays(employees);
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Mitarbeiter Übersicht</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" /> 
              Arbeitstage pro Woche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[5, 4, 3, 2, 1].map((days) => (
                <div key={days} className="flex flex-col items-center">
                  <div className={`w-full py-2 rounded-md mb-1 ${workingDaysCounts[days] > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <span className="text-lg font-medium">{workingDaysCounts[days]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{days} {days === 1 ? 'Tag' : 'Tage'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

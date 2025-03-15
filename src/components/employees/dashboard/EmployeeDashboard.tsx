
import React from "react";
import { User, Briefcase, Calendar } from "lucide-react";
import StatCard from "./StatCard";
import { Employee } from "@/types/employee";
import { calculateFTE, getEmployeeStatusCounts, getEmployeesByWorkingDays } from "@/utils/employeeUtils";
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeDashboardProps {
  employees: Employee[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employees }) => {
  const statusCounts = getEmployeeStatusCounts(employees);
  const fte = calculateFTE(employees);
  const workingDaysCounts = getEmployeesByWorkingDays(employees);
  
  return (
    <Card className="mb-0">
      <CardContent className="pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Arbeitstage pro Woche</p>
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center mt-3">
                {[5, 4, 3, 2, 1].map((days) => (
                  <div key={days} className="flex flex-col items-center">
                    <div className={`w-full py-1 rounded-md mb-1 ${workingDaysCounts[days] > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <span className="text-lg font-medium">{workingDaysCounts[days]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{days} {days === 1 ? 'Tag' : 'Tage'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Mitarbeiter Übersicht</p>
      </CardContent>
    </Card>
  );
};

export default EmployeeDashboard;

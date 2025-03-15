
import React from "react";
import { User, Briefcase, Calendar } from "lucide-react";
import { Employee } from "@/types/employee";
import { calculateFTE, getEmployeeStatusCounts, getEmployeesByWorkingDays } from "@/utils/employeeUtils";

interface EmployeeDashboardProps {
  employees: Employee[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employees }) => {
  const statusCounts = getEmployeeStatusCounts(employees);
  const fte = calculateFTE(employees);
  const workingDaysCounts = getEmployeesByWorkingDays(employees);
  
  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-white rounded-lg p-6 shadow-sm border w-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Aktive Mitarbeiter</p>
              <h3 className="text-4xl font-bold mt-2">{statusCounts.active}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border w-full">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Full-Time Equivalents</p>
              <h3 className="text-4xl font-bold mt-2">{fte}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Basierend auf {statusCounts.active} aktiven Mitarbeitern
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border w-full">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm text-muted-foreground">Arbeitstage pro Woche</p>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center mt-4">
            {[5, 4, 3, 2, 1].map((days) => (
              <div key={days} className="flex flex-col items-center">
                <div className={`w-full py-2 rounded-md mb-1 ${workingDaysCounts[days] > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <span className="text-xl font-semibold">{workingDaysCounts[days]}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {days} {days === 1 ? 'Tag' : 'Tage'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Mitarbeiter Übersicht</p>
    </div>
  );
};

export default EmployeeDashboard;

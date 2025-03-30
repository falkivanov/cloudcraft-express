
import React from "react";
import { Clock, Car, IdCard } from "lucide-react";
import DetailItem from "./DetailItem";
import BooleanIndicator from "./BooleanIndicator";
import WorkingDaysPreferences from "./WorkingDaysPreferences";
import { Employee } from "@/types/employee";

interface WorkPreferencesSectionProps {
  employee: Employee;
  weekDays: string[];
  isFullTimeEmployee: boolean;
}

const WorkPreferencesSection: React.FC<WorkPreferencesSectionProps> = ({ 
  employee, 
  weekDays,
  isFullTimeEmployee 
}) => {
  return (
    <div className="space-y-2">
      <DetailItem
        icon={Clock}
        label="Arbeitstage pro Woche"
        value={employee.workingDaysAWeek}
      />
      
      {!isFullTimeEmployee && (
        <WorkingDaysPreferences 
          weekDays={weekDays} 
          preferredWorkingDays={employee.preferredWorkingDays} 
        />
      )}
      
      <BooleanIndicator
        icon={Clock}
        label="Bei Arbeitstagen flexibel"
        value={isFullTimeEmployee || employee.isWorkingDaysFlexible}
        trueLabel={isFullTimeEmployee ? "Ja (Vollzeitmitarbeiter)" : "Ja"}
      />
      
      {employee.workingDaysAWeek === 5 && (
        <BooleanIndicator
          icon={Clock}
          label="Möchte 6 Tage arbeiten"
          value={employee.wantsToWorkSixDays}
        />
      )}
      
      <DetailItem
        icon={Car}
        label="Bevorzugtes Fahrzeug"
        value={employee.preferredVehicle}
      />
      
      {(employee.mentorFirstName || employee.mentorLastName) && (
        <DetailItem
          icon={IdCard}
          label="Mentor"
          value={
            [employee.mentorFirstName, employee.mentorLastName]
              .filter(Boolean)
              .join(" ") || "-"
          }
        />
      )}
    </div>
  );
};

export default WorkPreferencesSection;

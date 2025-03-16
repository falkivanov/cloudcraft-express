
import React from "react";
import { Employee } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Edit, IdCard, CalendarDays, MapPin, Clock, Car, Phone, Calendar, MessageCircle, AlignJustify, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface EmployeeDetailsContentProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onClose: () => void;
}

const EmployeeDetailsContent: React.FC<EmployeeDetailsContentProps> = ({
  employee,
  onEdit,
  onClose
}) => {
  // Array of day abbreviations (Monday to Saturday)
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <IdCard className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Transporter ID</p>
            <p>{employee.transporterId}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <AlignJustify className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Status</p>
            <p>{employee.status}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Startdatum</p>
            <p>{formatDate(employee.startDate)}</p>
          </div>
        </div>
        
        {employee.endDate && (
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Enddatum</p>
              <p>{formatDate(employee.endDate)}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Adresse</p>
            <p>{employee.address}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <MessageCircle className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Telegram</p>
            <p>{employee.telegramUsername || "-"}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Arbeitstage pro Woche</p>
            <p>{employee.workingDaysAWeek}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Präferierte Arbeitstage</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {weekDays.map((day) => (
                <span 
                  key={day} 
                  className={`text-xs px-2 py-1 rounded-full ${
                    employee.preferredWorkingDays?.includes(day) 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {employee.workingDaysAWeek === 5 && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Möchte 6 Tage arbeiten</p>
              <div className="mt-1">
                {employee.wantsToWorkSixDays ? (
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Ja
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Nein
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <Car className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Bevorzugtes Fahrzeug</p>
            <p>{employee.preferredVehicle}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Telefon</p>
            <p>{employee.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 pt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onEdit(employee)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Bearbeiten
        </Button>
        <Button onClick={onClose}>Schließen</Button>
      </div>
    </div>
  );
};

export default EmployeeDetailsContent;

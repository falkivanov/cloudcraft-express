import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Car, WandSparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { initialEmployees } from "@/data/sampleEmployeeData";
import { toast } from "sonner";
import { initialVehicles } from "@/data/sampleVehicleData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const activeVehicles = initialVehicles.filter(vehicle => vehicle.status === "Aktiv").map(vehicle => ({
  id: vehicle.id,
  licensePlate: vehicle.licensePlate,
  brand: vehicle.brand,
  model: vehicle.model
}));

interface DailyVehicleAssignmentProps {
  isScheduleFinalized: boolean;
}

const DailyVehicleAssignment: React.FC<DailyVehicleAssignmentProps> = ({ isScheduleFinalized }) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const formattedToday = format(today, "dd.MM.yyyy", { locale: de });
  const formattedTomorrow = format(tomorrow, "dd.MM.yyyy", { locale: de });
  
  const [todayAssignments, setTodayAssignments] = useState<Record<string, string>>({});
  
  const [tomorrowAssignments, setTomorrowAssignments] = useState<Record<string, string>>({});
  
  const [overrideFinalized, setOverrideFinalized] = useState(false);
  
  const effectivelyFinalized = isScheduleFinalized || overrideFinalized;
  
  useEffect(() => {
    const mockTodayAssignments: Record<string, string> = {
      "1": "1",
      "2": "3",
      "3": "2",
      "6": "5",
      "9": "7",
    };
    setTodayAssignments(mockTodayAssignments);
  }, []);
  
  const handleAutoAssign = () => {
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeuge zuzuordnen, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    const newAssignments: Record<string, string> = {};
    
    const activeEmployees = initialEmployees.filter(emp => emp.status === "Aktiv");
    
    activeVehicles.forEach(vehicle => {
      const employeeWithPreference = activeEmployees.find(
        emp => emp.preferredVehicle === vehicle.licensePlate && 
              !Object.values(newAssignments).includes(emp.id)
      );
      
      if (employeeWithPreference) {
        newAssignments[vehicle.id] = employeeWithPreference.id;
      } else {
        const availableEmployee = activeEmployees.find(
          emp => !Object.values(newAssignments).includes(emp.id)
        );
        
        if (availableEmployee) {
          newAssignments[vehicle.id] = availableEmployee.id;
        }
      }
    });
    
    setTomorrowAssignments(newAssignments);
    
    toast.success(`${Object.keys(newAssignments).length} Fahrzeuge für ${formattedTomorrow} automatisch zugewiesen`, {
      description: "Überprüfen Sie die Zuordnungen und speichern Sie diese bei Bedarf."
    });
  };
  
  const handleSaveAssignments = () => {
    if (!effectivelyFinalized) {
      toast.error("Dienstplan nicht finalisiert", {
        description: "Um Fahrzeugzuordnungen zu speichern, muss der Dienstplan zuerst abgeschlossen werden."
      });
      return;
    }
    
    if (Object.keys(tomorrowAssignments).length === 0) {
      toast.warning("Keine Zuordnungen vorhanden", {
        description: "Bitte führen Sie zuerst eine Auto-Zuordnung durch."
      });
      return;
    }
    
    const savedAssignments = Object.entries(tomorrowAssignments).map(([vehicleId, employeeId]) => {
      const vehicle = activeVehicles.find(v => v.id === vehicleId);
      const employee = initialEmployees.find(e => e.id === employeeId);
      return {
        id: `${vehicleId}-${employeeId}-${format(tomorrow, "yyyy-MM-dd")}`,
        vehicleId,
        vehicleInfo: `${vehicle?.brand} ${vehicle?.model} (${vehicle?.licensePlate})`,
        employeeId,
        employeeName: employee?.name || "",
        date: format(tomorrow, "yyyy-MM-dd"),
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin"
      };
    });
    
    console.log("Saved assignments for tomorrow:", savedAssignments);
    toast.success(`Fahrzeugzuordnungen für ${formattedTomorrow} wurden gespeichert!`);
  };
  
  const getEmployeeName = (employeeId: string) => {
    const employee = initialEmployees.find(e => e.id === employeeId);
    return employee ? employee.name : "Nicht zugewiesen";
  };
  
  const needsKeyChange = (vehicleId: string, employeeId: string): "new" | "exchange" | null => {
    if (!employeeId) return null;
    
    const todayVehicleId = Object.entries(todayAssignments).find(
      ([vId, eId]) => eId === employeeId
    )?.[0];
    
    if (!todayVehicleId) return "new";
    
    if (todayVehicleId !== vehicleId) return "exchange";
    
    return null;
  };
  
  const getKeyChangeStyle = (status: "new" | "exchange" | null) => {
    switch (status) {
      case "new":
        return "bg-blue-50";
      case "exchange":
        return "bg-amber-50";
      default:
        return "";
    }
  };
  
  const notAssignedPreferredVehicle = (employeeId: string, vehicleId: string): boolean => {
    if (!employeeId) return false;
    
    const employee = initialEmployees.find(e => e.id === employeeId);
    if (!employee || !employee.preferredVehicle) return false;
    
    const vehicle = activeVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return false;
    
    return employee.preferredVehicle !== vehicle.licensePlate;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Fahrzeugzuordnung</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleAutoAssign}
            className="gap-2"
          >
            <WandSparkles className="h-4 w-4" />
            Auto-Zuordnung für {formattedTomorrow}
          </Button>
          <Button 
            disabled={Object.keys(tomorrowAssignments).length === 0}
            onClick={handleSaveAssignments}
          >
            <Car className="h-4 w-4 mr-2" />
            Zuordnungen speichern
          </Button>
        </div>
      </div>
      
      {!isScheduleFinalized && (
        <div className="flex items-center space-x-2 bg-muted p-4 rounded-md mb-4">
          <Switch
            id="override-finalized"
            checked={overrideFinalized}
            onCheckedChange={setOverrideFinalized}
          />
          <Label htmlFor="override-finalized">Test-Modus: Finalisierung überschreiben</Label>
          <div className="text-xs text-muted-foreground ml-2">
            (Nur zu Testzwecken, deaktiviert die Dienstplan-Finalisierungsprüfung)
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="text-sm font-medium">Legende:</div>
        <div className="flex gap-4 mt-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-50 mr-2 border border-blue-100"></div>
            <span className="text-sm">Neuer Schlüssel benötigt</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-50 mr-2 border border-amber-100"></div>
            <span className="text-sm">Schlüsseltausch benötigt</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
            <span className="text-sm">Nicht das präferierte Fahrzeug</span>
          </div>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fahrzeug</TableHead>
            <TableHead>{formattedToday}</TableHead>
            <TableHead>{formattedTomorrow}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeVehicles.map(vehicle => {
            const tomorrowEmployeeId = tomorrowAssignments[vehicle.id];
            const keyChangeStatus = needsKeyChange(vehicle.id, tomorrowEmployeeId);
            const cellStyle = getKeyChangeStyle(keyChangeStatus);
            const isNotPreferred = notAssignedPreferredVehicle(tomorrowEmployeeId, vehicle.id);
            
            return (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="font-medium">{vehicle.licensePlate}</div>
                  <div className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</div>
                </TableCell>
                <TableCell>
                  {todayAssignments[vehicle.id] ? (
                    <div>{getEmployeeName(todayAssignments[vehicle.id])}</div>
                  ) : (
                    <div className="text-muted-foreground">Nicht zugewiesen</div>
                  )}
                </TableCell>
                <TableCell className={cellStyle}>
                  {tomorrowEmployeeId ? (
                    <div className="flex items-center">
                      <div>{getEmployeeName(tomorrowEmployeeId)}</div>
                      {isNotPreferred && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-4 w-4 text-amber-500 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mitarbeiter erhält nicht das präferierte Fahrzeug</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Noch nicht zugewiesen</div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailyVehicleAssignment;

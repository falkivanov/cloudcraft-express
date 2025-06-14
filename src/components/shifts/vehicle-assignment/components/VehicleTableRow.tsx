
import React, { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertTriangle, Check, ChevronsUpDown, Search } from "lucide-react";
import { Employee } from "@/types/employee";
import { getEmployeeName, needsKeyChange, getKeyChangeStyle, notAssignedPreferredVehicle } from "../utils/vehicleAssignmentUtils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Create a VehicleBasic type that only includes the properties we need
interface VehicleBasic {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
}

interface VehicleTableRowProps {
  vehicle: VehicleBasic;
  yesterdayEmployeeId: string;
  todayEmployeeId: string;
  assignedEmployeeId: string;
  employees: Employee[];
  onAssignmentChange: (vehicleId: string, employeeId: string) => void;
}

const VehicleTableRow: React.FC<VehicleTableRowProps> = ({
  vehicle,
  yesterdayEmployeeId,
  todayEmployeeId,
  assignedEmployeeId,
  employees,
  onAssignmentChange
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const keyChangeStatus = needsKeyChange(
    { [vehicle.id]: todayEmployeeId },
    vehicle.id,
    assignedEmployeeId
  );
  
  const notPreferred = notAssignedPreferredVehicle(assignedEmployeeId, vehicle.id);
  
  const isUnassigned = !assignedEmployeeId || assignedEmployeeId === "none";
  
  return (
    <tr 
      className={`
        ${getKeyChangeStyle(keyChangeStatus)} 
        ${isUnassigned ? "bg-green-50 hover:bg-green-100" : ""}
        border-b
      `}
    >
      <td className="px-4 py-3">
        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
        <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
      </td>
      <td className="px-4 py-3">
        {getEmployeeName(yesterdayEmployeeId)}
      </td>
      <td className="px-4 py-3">
        {getEmployeeName(todayEmployeeId)}
      </td>
      <td className="px-4 py-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={open} 
              className="w-[180px] justify-between h-8"
            >
              {assignedEmployeeId && assignedEmployeeId !== "none" 
                ? employees.find(employee => employee.id === assignedEmployeeId)?.name || "Mitarbeiter wählen"
                : "Nicht zugewiesen"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput 
                placeholder="Mitarbeiter suchen..." 
                onValueChange={setSearchValue}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>Kein Mitarbeiter gefunden.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      onAssignmentChange(vehicle.id, "none");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (!assignedEmployeeId || assignedEmployeeId === "none") ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Nicht zugewiesen
                  </CommandItem>
                  {employees
                    .filter(employee => 
                      employee.name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map(employee => (
                      <CommandItem
                        key={employee.id}
                        value={employee.name}
                        onSelect={() => {
                          onAssignmentChange(vehicle.id, employee.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assignedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {employee.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </td>
      <td className="px-4 py-3">
        {keyChangeStatus === "new" && (
          <div className="flex items-center text-xs text-blue-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Schlüsselübergabe notwendig
          </div>
        )}
        {keyChangeStatus === "exchange" && (
          <div className="flex items-center text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Schlüsseltausch notwendig
          </div>
        )}
        {notPreferred && (
          <div className="text-xs text-muted-foreground mt-1">
            Nicht bevorzugtes Fahrzeug
          </div>
        )}
        {isUnassigned && (
          <div className="text-xs text-green-700 mt-1">
            Verfügbar
          </div>
        )}
      </td>
    </tr>
  );
};

export default VehicleTableRow;

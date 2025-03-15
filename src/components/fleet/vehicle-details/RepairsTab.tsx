
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Vehicle, RepairEntry } from "@/types/vehicle";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import RepairForm from "./RepairForm";
import RepairList from "./RepairList";

interface RepairsTabProps {
  vehicle: Vehicle;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const RepairsTab = ({ vehicle, onUpdateVehicle }: RepairsTabProps) => {
  const [isAddingRepair, setIsAddingRepair] = useState(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  
  const [newRepair, setNewRepair] = useState<Omit<RepairEntry, "id" | "duration" | "date">>({
    startDate: currentDate,
    endDate: currentDate,
    description: "",
    location: "",
    totalCost: 0,
    companyPaidAmount: 0,
    causeType: "Verschleiß",
    causedByEmployeeId: undefined,
    causedByEmployeeName: undefined
  });

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(0, differenceInDays(end, start) + 1); // +1 to include both start and end dates
  };

  const sortedRepairs = React.useMemo(() => {
    if (!vehicle?.repairs) return [];
    return [...vehicle.repairs].sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [vehicle?.repairs]);

  const handleAddRepair = () => {
    const duration = calculateDuration(newRepair.startDate, newRepair.endDate);
    
    const updatedVehicle = { ...vehicle };
    const repairs = updatedVehicle.repairs || [];
    
    const newRepairEntry: RepairEntry = {
      id: (Date.now().toString()),
      date: newRepair.startDate, // Use startDate as the main date
      ...newRepair,
      duration
    };
    
    updatedVehicle.repairs = [...repairs, newRepairEntry];
    
    onUpdateVehicle(updatedVehicle);
    
    setNewRepair({
      startDate: currentDate,
      endDate: currentDate,
      description: "",
      location: "",
      totalCost: 0,
      companyPaidAmount: 0,
      causeType: "Verschleiß",
      causedByEmployeeId: undefined,
      causedByEmployeeName: undefined
    });
    
    setIsAddingRepair(false);
    
    toast({
      title: "Reparatur hinzugefügt",
      description: `Reparatur wurde erfolgreich zum Fahrzeug ${vehicle.licensePlate} hinzugefügt.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Werkstattaufenthalte</h3>
        <Button onClick={() => setIsAddingRepair(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Reparatur
        </Button>
      </div>
      
      {isAddingRepair ? (
        <RepairForm 
          newRepair={newRepair}
          setNewRepair={setNewRepair}
          onCancel={() => setIsAddingRepair(false)}
          onSubmit={handleAddRepair}
        />
      ) : (
        <RepairList repairs={sortedRepairs} />
      )}
    </div>
  );
};

export default RepairsTab;

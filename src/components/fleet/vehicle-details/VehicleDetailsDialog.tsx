
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";
import { Info, Wrench, Calendar } from "lucide-react";
import VehicleInfoCard from "./VehicleInfoCard";
import RepairsTab from "./RepairsTab";
import AppointmentsTab from "./AppointmentsTab";

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const VehicleDetailsDialog = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onUpdateVehicle
}: VehicleDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("details");

  if (!vehicle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
          </DialogTitle>
          <DialogDescription>
            Detaillierte Informationen über das Fahrzeug
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="workshop" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span>Werkstatt</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Termine</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <VehicleInfoCard vehicle={vehicle} />
          </TabsContent>
          
          <TabsContent value="workshop" className="space-y-4">
            <RepairsTab vehicle={vehicle} onUpdateVehicle={onUpdateVehicle} />
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <AppointmentsTab vehicle={vehicle} onUpdateVehicle={onUpdateVehicle} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Schließen</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;

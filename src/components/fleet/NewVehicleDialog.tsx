
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types/vehicle";

interface NewVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Vehicle, "id">) => void;
}

const vehicleFormSchema = z.object({
  licensePlate: z.string().min(1, "Kennzeichen ist erforderlich"),
  brand: z.string().min(1, "Marke ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  vinNumber: z.string().min(1, "VIN ist erforderlich"),
  infleetDate: z.string().min(1, "Infleet Datum ist erforderlich"),
});

const NewVehicleDialog = ({ open, onOpenChange, onSubmit }: NewVehicleDialogProps) => {
  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      licensePlate: "",
      brand: "",
      model: "",
      vinNumber: "",
      infleetDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = (data: z.infer<typeof vehicleFormSchema>) => {
    // Ensure all required properties are included for Vehicle type
    const newVehicle: Omit<Vehicle, "id"> = {
      licensePlate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      vinNumber: data.vinNumber,
      infleetDate: data.infleetDate,
      status: "Aktiv",
      defleetDate: null,
    };
    
    onSubmit(newVehicle);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
          <DialogDescription>
            Fügen Sie die Details des neuen Fahrzeugs hinzu
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kennzeichen</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. B-AB 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marke</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. BMW" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modell</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. X5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vinNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FIN (VIN)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. WBAKV210900J39048" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="infleetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Infleet Datum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Abbrechen
              </Button>
              <Button type="submit">Hinzufügen</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVehicleDialog;

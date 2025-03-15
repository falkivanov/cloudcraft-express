
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vehicle } from "@/types/vehicle";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: Vehicle) => void;
  onCancel: () => void;
}

const vehicleFormSchema = z.object({
  id: z.string(),
  licensePlate: z.string().min(1, "Kennzeichen ist erforderlich"),
  brand: z.string().min(1, "Marke ist erforderlich"),
  model: z.string().min(1, "Modell ist erforderlich"),
  vinNumber: z.string().min(1, "VIN ist erforderlich"),
  status: z.enum(["Aktiv", "In Werkstatt", "Defleet"], {
    required_error: "Status ist erforderlich",
  }),
  infleetDate: z.string().min(1, "Infleet Datum ist erforderlich"),
  defleetDate: z.string().nullable(),
});

const VehicleForm = ({ vehicle, onSubmit, onCancel }: VehicleFormProps) => {
  const defaultValues: Partial<Vehicle> = vehicle || {
    id: "",
    licensePlate: "",
    brand: "",
    model: "",
    vinNumber: "",
    status: "Aktiv",
    infleetDate: "",
    defleetDate: null,
  };

  const form = useForm<Vehicle>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues,
  });

  const watchStatus = form.watch("status");
  const showDefleetDate = watchStatus === "Defleet";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 py-4"
      >
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kennzeichen</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
                <Input {...field} />
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
              <FormLabel>VIN</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Aktiv">Aktiv</SelectItem>
                  <SelectItem value="In Werkstatt">In Werkstatt</SelectItem>
                  <SelectItem value="Defleet">Defleet</SelectItem>
                </SelectContent>
              </Select>
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

        {showDefleetDate && (
          <FormField
            control={form.control}
            name="defleetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Defleet Datum</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ""} 
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Abbrechen
          </Button>
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </Form>
  );
};

export default VehicleForm;

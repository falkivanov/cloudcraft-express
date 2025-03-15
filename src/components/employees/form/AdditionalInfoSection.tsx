
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import TextFormField from "./TextFormField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ form }) => {
  return (
    <>
      <TextFormField form={form} name="taxId" label="Steuer ID" />
      <TextFormField form={form} name="insuranceId" label="Versicherungsnummer" />
      <TextFormField 
        form={form} 
        name="workingDaysAWeek" 
        label="Arbeitstage pro Woche" 
        type="number"
        min={1}
        max={7}
      />
      <TextFormField form={form} name="preferredVehicle" label="Bevorzugtes Fahrzeug" />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AdditionalInfoSection;

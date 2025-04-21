
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./ScorecardTargetForm";

interface EffectiveDateFieldsProps {
  form: UseFormReturn<FormValues>;
  index: number;
  currentWeek: number;
  currentYear: number;
  disabled?: boolean; // Added this property
}

const EffectiveDateFields: React.FC<EffectiveDateFieldsProps> = ({ 
  form, 
  index, 
  currentWeek, 
  currentYear,
  disabled = false // Added default value
}) => {
  return (
    <div className="flex space-x-4 items-end">
      <FormField
        control={form.control}
        name={`targets.${index}.effectiveFromWeek`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Gilt ab KW</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="53"
                placeholder={currentWeek.toString()}
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled} // Use the disabled prop
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`targets.${index}.effectiveFromYear`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Jahr</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="2020"
                max="2030"
                placeholder={currentYear.toString()}
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled} // Use the disabled prop
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default EffectiveDateFields;

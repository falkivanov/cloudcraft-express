
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";

// We need to restrict the name to only text fields, excluding date fields
type TextFormFieldName = Exclude<keyof EmployeeFormData, "startDate" | "endDate" | "birthday">;

interface TextFormFieldProps {
  form: UseFormReturn<EmployeeFormData>;
  name: TextFormFieldName;
  label: string;
  type?: string;
  min?: number;
  max?: number;
}

const TextFormField: React.FC<TextFormFieldProps> = ({
  form,
  name,
  label,
  type = "text",
  min,
  max,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} min={min} max={max} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextFormField;

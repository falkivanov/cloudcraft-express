
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";

interface TextFormFieldProps {
  form: UseFormReturn<EmployeeFormData>;
  name: keyof EmployeeFormData;
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

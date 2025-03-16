
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";

interface DateFormFieldProps {
  form: UseFormReturn<EmployeeFormData>;
  name: "startDate" | "endDate"; // Removed birthday as it's no longer needed
  label: string;
  isOptional?: boolean;
  disableFutureDates?: boolean;
}

const DateFormField: React.FC<DateFormFieldProps> = ({
  form,
  name,
  label,
  isOptional = false,
  disableFutureDates = false,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}{isOptional && " (optional)"}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value as Date, "P", { locale: de })
                  ) : (
                    <span>Datum auswählen</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value as Date}
                onSelect={field.onChange}
                disabled={disableFutureDates ? (date) => date > new Date() : undefined}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateFormField;

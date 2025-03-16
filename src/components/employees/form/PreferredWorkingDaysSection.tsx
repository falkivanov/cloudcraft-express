
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferredWorkingDaysSectionProps {
  form: UseFormReturn<EmployeeFormData>;
}

const PreferredWorkingDaysSection: React.FC<PreferredWorkingDaysSectionProps> = ({ form }) => {
  const weekDays = [
    { value: "Mo", label: "Mo" },
    { value: "Di", label: "Di" },
    { value: "Mi", label: "Mi" },
    { value: "Do", label: "Do" },
    { value: "Fr", label: "Fr" },
    { value: "Sa", label: "Sa" }
  ];

  // Berechne, ob der Mitarbeiter aktuell 5 Tage pro Woche arbeitet
  const workingDaysValue = form.watch("workingDaysAWeek");
  const isWorkingFiveDays = workingDaysValue === 5;

  return (
    <>
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="preferredWorkingDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Präferierte Arbeitstage</FormLabel>
              <FormDescription>
                Wählen Sie die präferierten Arbeitstage aus
              </FormDescription>
              <FormControl>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  className="flex flex-wrap gap-1"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {weekDays.map((day) => (
                    <ToggleGroupItem key={day.value} value={day.value} aria-label={day.label}>
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isWorkingFiveDays && (
        <div className="col-span-2">
          <FormField
            control={form.control}
            name="wantsToWorkSixDays"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Möchte 6 Tage arbeiten
                  </FormLabel>
                  <FormDescription>
                    Der Mitarbeiter möchte auf einen 6-Tage-Arbeitsplan wechseln
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default PreferredWorkingDaysSection;


import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from "./employeeFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

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

  // Calculate if the employee is full-time (5+ days per week)
  const workingDaysValue = form.watch("workingDaysAWeek");
  const isFullTimeEmployee = workingDaysValue >= 5;
  const isWorkingFiveDays = workingDaysValue === 5;
  
  // Watch the flexibility setting
  const isFlexible = form.watch("isWorkingDaysFlexible");
  
  // Clear preferred working days when switching to full-time
  useEffect(() => {
    if (isFullTimeEmployee && form.getValues("preferredWorkingDays").length > 0) {
      form.setValue("preferredWorkingDays", []);
      
      // For full-time employees, also set flexibility to true
      form.setValue("isWorkingDaysFlexible", true);
    }
  }, [isFullTimeEmployee, form]);

  // Only show preferred days section for part-time employees
  if (isFullTimeEmployee) {
    return (
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="isWorkingDaysFlexible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={true}
                  disabled={true}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Bei Arbeitstagen flexibel
                </FormLabel>
                <FormDescription>
                  Vollzeitmitarbeiter (5+ Tage) haben keine präferierten Arbeitstage und sind standardmäßig flexibel.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {isWorkingFiveDays && (
          <div className="mt-4">
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
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    );
  }

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
                    <ToggleGroupItem 
                      key={day.value} 
                      value={day.value} 
                      aria-label={day.label}
                      className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 data-[state=on]:border-blue-300 data-[state=on]:font-medium transition-colors"
                    >
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

      <div className="col-span-2">
        <FormField
          control={form.control}
          name="isWorkingDaysFlexible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Bei Arbeitstagen flexibel
                </FormLabel>
                <FormDescription>
                  Wenn ausgeschaltet, kann der Mitarbeiter nur an den ausgewählten Tagen arbeiten.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default PreferredWorkingDaysSection;

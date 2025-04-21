
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FormValues, TargetItem } from "./ScorecardTargetForm";

interface TargetFormItemProps {
  form: UseFormReturn<FormValues>;
  index: number;
  metric: TargetItem;
  isEditing: boolean;
}

const TargetFormItem: React.FC<TargetFormItemProps> = ({
  form,
  index,
  metric,
  isEditing,
}) => {
  return (
    <div className="border p-4 rounded-md">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <FormField
            control={form.control}
            name={`targets.${index}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{metric.name}</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      required
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <span className="text-sm text-muted-foreground w-10">
                    {metric.unit}
                  </span>
                </div>
                <FormDescription>
                  Zielwert für {metric.name}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        {/* Gültig ab Datum analog zu FinanceSettings */}
        <FormField
          control={form.control}
          name={`targets.${index}.validFrom`}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-4">
              <FormLabel className="min-w-[180px] font-medium">Gültig ab</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={!isEditing}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd.MM.yyyy", { locale: de })
                      ) : (
                        "Datum auswählen"
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default TargetFormItem;

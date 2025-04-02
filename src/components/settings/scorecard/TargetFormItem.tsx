
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormValues, TargetItem } from "./ScorecardTargetForm";
import EffectiveDateFields from "./EffectiveDateFields";

interface TargetFormItemProps {
  form: UseFormReturn<FormValues>;
  index: number;
  metric: TargetItem;
  showEffectiveDate: boolean;
  currentWeek: number;
  currentYear: number;
  onToggleEffectiveDate: (name: string) => void;
}

const TargetFormItem: React.FC<TargetFormItemProps> = ({
  form,
  index,
  metric,
  showEffectiveDate,
  currentWeek,
  currentYear,
  onToggleEffectiveDate
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
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="mt-8"
            onClick={() => onToggleEffectiveDate(metric.name)}
          >
            {showEffectiveDate ? "Gültig ab entfernen" : "Gültig ab hinzufügen"}
          </Button>
        </div>
        
        {showEffectiveDate && (
          <EffectiveDateFields 
            form={form}
            index={index}
            currentWeek={currentWeek}
            currentYear={currentYear}
          />
        )}
      </div>
    </div>
  );
};

export default TargetFormItem;

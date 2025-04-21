
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
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
      </div>
    </div>
  );
};

export default TargetFormItem;

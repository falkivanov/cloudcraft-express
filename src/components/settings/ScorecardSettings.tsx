
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { METRIC_NAMES, METRIC_TARGETS, METRIC_UNITS } from "@/components/quality/scorecard/utils/parser/extractors/driver/utils/metricDefinitions";

// Create a schema for our form
const formSchema = z.object({
  targets: z.array(
    z.object({
      name: z.string(),
      value: z.number().min(0),
      unit: z.string()
    })
  )
});

type FormValues = z.infer<typeof formSchema>;

const ScorecardSettings: React.FC = () => {
  const { toast } = useToast();
  const STORAGE_KEY = "scorecard_custom_targets";
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targets: METRIC_NAMES.map((name, index) => ({
        name,
        value: METRIC_TARGETS[index],
        unit: METRIC_UNITS[index]
      }))
    }
  });

  // Load saved targets on mount
  useEffect(() => {
    const savedTargets = localStorage.getItem(STORAGE_KEY);
    if (savedTargets) {
      try {
        const parsedTargets = JSON.parse(savedTargets);
        form.reset({ targets: parsedTargets });
      } catch (error) {
        console.error("Error loading saved targets:", error);
      }
    }
  }, [form]);

  // Save targets to localStorage
  const onSubmit = (data: FormValues) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.targets));
      toast({
        title: "Zielwerte gespeichert",
        description: "Die Scorecard-Zielwerte wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error("Error saving targets:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Zielwerte konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scorecard Zielwerte</CardTitle>
        <CardDescription>
          Passen Sie die Zielwerte für die verschiedenen Scorecard-Metriken an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {form.getValues().targets.map((metric, index) => (
                <FormField
                  key={metric.name}
                  control={form.control}
                  name={`targets.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{metric.name}</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              ))}
            </div>
            <Button type="submit" className="mt-4">Zielwerte speichern</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ScorecardSettings;

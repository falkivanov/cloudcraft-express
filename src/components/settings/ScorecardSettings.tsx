
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define company KPI names and their default targets
const COMPANY_KPI_TARGETS = [
  { name: "Delivery Completion Rate (DCR)", value: 98.0, unit: "%" },
  { name: "Delivered Not Received (DNR DPMO)", value: 3000, unit: "DPMO" },
  { name: "Photo-On-Delivery", value: 95, unit: "%" },
  { name: "Contact Compliance", value: 95, unit: "%" },
  { name: "Customer escalation DPMO", value: 3500, unit: "DPMO" },
  { name: "Vehicle Audit (VSA) Compliance", value: 95, unit: "%" },
  { name: "DVIC Compliance", value: 95, unit: "%" },
  { name: "Safe Driving Metric (FICO)", value: 800, unit: "" },
  { name: "Capacity Reliability", value: 98, unit: "%" },
  { name: "Working Hours Compliance (WHC)", value: 100, unit: "%" },
  { name: "Breach of Contract (BOC)", value: 0, unit: "" },
  { name: "Lost on Road (LoR) DPMO", value: 350, unit: "DPMO" },
  { name: "Speeding Event Rate (Per 100 Trips)", value: 10, unit: "" },
  { name: "Mentor Adoption Rate", value: 80, unit: "%" },
  { name: "Customer Delivery Feedback", value: 85, unit: "%" },
  { name: "Comprehensive Audit Score (CAS)", value: 100, unit: "%" },
  { name: "Next Day Capacity Reliability", value: 98, unit: "%" }
];

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
      targets: COMPANY_KPI_TARGETS
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
      
      // Trigger a custom event to notify components that use this data
      window.dispatchEvent(new Event('scorecard_targets_updated'));
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
          Passen Sie die Zielwerte für die Unternehmens-KPIs der Scorecard an
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

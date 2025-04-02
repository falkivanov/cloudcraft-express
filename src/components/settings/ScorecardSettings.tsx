
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TargetDefinition } from "../quality/scorecard/utils/helpers/statusHelper";

// Define company KPI names in the same order as they appear on the Scorecard page
// Organized by category to match the CompanyKPIs.tsx display order
const COMPANY_KPI_TARGETS: TargetDefinition[] = [
  // Safety category
  { name: "Vehicle Audit (VSA) Compliance", value: 95, unit: "%" },
  { name: "Safe Driving Metric (FICO)", value: 800, unit: "" },
  { name: "DVIC Compliance", value: 95, unit: "%" },
  { name: "Speeding Event Rate (Per 100 Trips)", value: 10, unit: "" },
  { name: "Mentor Adoption Rate", value: 80, unit: "%" },
  
  // Compliance category
  { name: "Breach of Contract (BOC)", value: 0, unit: "" },
  { name: "Working Hours Compliance (WHC)", value: 100, unit: "%" },
  { name: "Comprehensive Audit Score (CAS)", value: 100, unit: "%" },
  
  // Customer category
  { name: "Customer escalation DPMO", value: 3500, unit: "DPMO" },
  { name: "Customer Delivery Feedback", value: 85, unit: "%" },
  
  // Quality category
  { name: "Delivery Completion Rate (DCR)", value: 98.0, unit: "%" },
  { name: "Delivered Not Received (DNR DPMO)", value: 3000, unit: "DPMO" },
  { name: "Lost on Road (LoR) DPMO", value: 350, unit: "DPMO" },
  
  // Standard Work category
  { name: "Photo-On-Delivery", value: 95, unit: "%" },
  { name: "Contact Compliance", value: 95, unit: "%" },
  
  // Capacity category
  { name: "Next Day Capacity Reliability", value: 98, unit: "%" },
  { name: "Capacity Reliability", value: 98, unit: "%" }
];

// Create a schema for our form
const formSchema = z.object({
  targets: z.array(
    z.object({
      name: z.string(),
      value: z.number().min(0),
      effectiveFromWeek: z.number().min(1).max(53).optional(),
      effectiveFromYear: z.number().min(2020).max(2030).optional(),
      unit: z.string().optional()
    })
  )
});

type FormValues = z.infer<typeof formSchema>;

const ScorecardSettings: React.FC = () => {
  const { toast } = useToast();
  const STORAGE_KEY = "scorecard_custom_targets";
  const [showEffectiveDate, setShowEffectiveDate] = useState<{[key: string]: boolean}>({});
  
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
        
        // Initialize showEffectiveDate state based on existing targets
        const effectiveDates: {[key: string]: boolean} = {};
        parsedTargets.forEach((target: TargetDefinition) => {
          effectiveDates[target.name] = !!target.effectiveFromWeek && !!target.effectiveFromYear;
        });
        setShowEffectiveDate(effectiveDates);
      } catch (error) {
        console.error("Error loading saved targets:", error);
      }
    }
  }, [form]);

  // Toggle effective date fields
  const toggleEffectiveDate = (kpiName: string) => {
    setShowEffectiveDate(prev => ({
      ...prev,
      [kpiName]: !prev[kpiName]
    }));
  };

  // Save targets to localStorage
  const onSubmit = (data: FormValues) => {
    try {
      // Process form data - remove effective dates if not showing
      const processedTargets = data.targets.map(target => {
        if (!showEffectiveDate[target.name]) {
          return {
            name: target.name,
            value: target.value,
            unit: target.unit
          };
        }
        return target;
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processedTargets));
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

  // Get current calendar week and year
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return { week: weekNumber, year: now.getFullYear() };
  };

  const { week: currentWeek, year: currentYear } = getCurrentWeek();

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
            <div className="grid grid-cols-1 gap-4">
              {form.getValues().targets.map((metric, index) => (
                <div key={metric.name} className="border p-4 rounded-md">
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="mt-8"
                        onClick={() => toggleEffectiveDate(metric.name)}
                      >
                        {showEffectiveDate[metric.name] ? "Gültig ab entfernen" : "Gültig ab hinzufügen"}
                      </Button>
                    </div>
                    
                    {showEffectiveDate[metric.name] && (
                      <div className="flex space-x-4 items-end">
                        <FormField
                          control={form.control}
                          name={`targets.${index}.effectiveFromWeek`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Gilt ab KW</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="53"
                                  placeholder={currentWeek.toString()}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`targets.${index}.effectiveFromYear`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Jahr</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="2020"
                                  max="2030"
                                  placeholder={currentYear.toString()}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
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

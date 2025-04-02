
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { TargetDefinition } from "@/components/quality/scorecard/utils/helpers/statusHelper";
import TargetFormItem from "./TargetFormItem";

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

// Form schema matching TargetDefinition type structure but with optional fields for effective dates
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

export type FormValues = z.infer<typeof formSchema>;

interface ScorecardTargetFormProps {
  onSubmit: (data: FormValues) => void;
}

const ScorecardTargetForm: React.FC<ScorecardTargetFormProps> = ({ onSubmit }) => {
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

  // Get current calendar week and year
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return { week: weekNumber, year: now.getFullYear() };
  };

  const { week: currentWeek, year: currentYear } = getCurrentWeek();

  // Handle form submission with typed validation
  const handleSubmit = (formData: FormValues) => {
    // Process form data - remove effective dates if not showing
    const processedTargets = formData.targets.map(target => {
      // Sicherstellen, dass die Eigenschaften korrekt typisiert sind
      // Wir wissen, dass name und value vorhanden sein müssen, da das Formular-Schema sie validiert
      const processedTarget: TargetDefinition = {
        name: target.name,
        value: target.value,
        unit: target.unit || ""
      };

      // Only include effective dates if they are being shown for this target
      if (showEffectiveDate[target.name]) {
        if (target.effectiveFromWeek !== undefined) {
          processedTarget.effectiveFromWeek = target.effectiveFromWeek;
        }
        if (target.effectiveFromYear !== undefined) {
          processedTarget.effectiveFromYear = target.effectiveFromYear;
        }
      }

      return processedTarget;
    });
    
    onSubmit({ targets: processedTargets });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {form.getValues().targets.map((metric, index) => (
            <TargetFormItem
              key={metric.name}
              form={form}
              index={index}
              metric={metric}
              showEffectiveDate={showEffectiveDate[metric.name] || false}
              currentWeek={currentWeek}
              currentYear={currentYear}
              onToggleEffectiveDate={toggleEffectiveDate}
            />
          ))}
        </div>
        <Button type="submit" className="mt-4">Zielwerte speichern</Button>
      </form>
    </Form>
  );
};

export default ScorecardTargetForm;

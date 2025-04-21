
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Neue Zielwerte laut Vorgabe (kein Ziel für Delivered)
const DRIVER_KPIS = [
  { name: "DCR", unit: "%", scoreTarget: 99.5, colorTarget: 98 },
  { name: "DNR DPMO", unit: "DPMO", scoreTarget: 1000, colorTarget: 1600 },
  { name: "POD", unit: "%", scoreTarget: 99, colorTarget: 97 },
  { name: "CC", unit: "%", scoreTarget: 99, colorTarget: 94 },
  { name: "CE", unit: "", scoreTarget: 0, colorTarget: 0 },
  { name: "DEX", unit: "%", scoreTarget: 95, colorTarget: 90 }
];

const driverTargetSchema = z.object({
  name: z.string(),
  scoreTarget: z.number().min(0),
  colorTarget: z.number().min(0),
  unit: z.string().optional()
});
const driverFormSchema = z.object({
  targets: z.array(driverTargetSchema)
});

type DriverTargetItem = z.infer<typeof driverTargetSchema>;
type DriverFormValues = z.infer<typeof driverFormSchema>;

const STORAGE_KEY = "scorecard_driver_targets";

const DriverKpiTargetForm: React.FC = () => {
  const { toast } = useToast();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      targets: DRIVER_KPIS.map(kpi => ({
        name: kpi.name,
        scoreTarget: kpi.scoreTarget,
        colorTarget: kpi.colorTarget,
        unit: kpi.unit
      }))
    }
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "targets"
  });

  useEffect(() => {
    const savedTargets = localStorage.getItem(STORAGE_KEY);
    if (savedTargets) {
      try {
        const parsed = JSON.parse(savedTargets);
        form.reset({ targets: parsed });
      } catch (e) {
        // ignore error, use defaults
      }
    }
  }, [form]);

  const handleSubmit = (values: DriverFormValues) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values.targets));
      toast({ title: "Fahrer KPI Zielwerte gespeichert", description: "Zielwerte erfolgreich aktualisiert." });
      window.dispatchEvent(new Event('scorecard_driver_targets_updated'));
    } catch (err) {
      toast({ title: "Fehler", description: "Zielwerte konnten nicht gespeichert werden.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-lg font-bold mb-0.5">Fahrer KPI Zielwerte</h2>
        <div className="grid grid-cols-5 gap-2 font-semibold text-sm text-muted-foreground px-2 mb-2">
          <div className="col-span-2"></div>
          <div>
            Gut Ziel<br />
            <span className="text-xs font-normal text-muted-foreground">(oberes Ziel)</span>
          </div>
          <div>
            Mindestens Ziel<br />
            <span className="text-xs font-normal text-muted-foreground">(unteres Ziel)</span>
          </div>
          <div></div>
        </div>

        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-5 items-center gap-2 bg-gray-50 rounded px-2 py-1">
              <span className="col-span-2 font-medium">{field.name}{field.unit && ` (${field.unit})`}:</span>
              <FormField
                control={form.control}
                name={`targets.${idx}.scoreTarget`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Gut Ziel</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-20" min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`targets.${idx}.colorTarget`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Mindestens Ziel</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-20" min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col text-[10px] text-muted-foreground gap-0.5">
                {/* Infozellen leer */}
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full">Fahrer-Zielwerte speichern</Button>
      </form>
    </Form>
  );
};

export default DriverKpiTargetForm;

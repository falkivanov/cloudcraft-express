
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormControl, FormLabel, FormMessage, FormField } from "@/components/ui/form";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { Bundesland, bundeslandLabels } from "@/components/shifts/utils/planning/holidays/types";

const STORAGE_KEY = "station_codes";

type StationFormValues = {
  stations: { code: string; bundesland: Bundesland }[];
};

const DEFAULT_BUNDESLAND: Bundesland = "saarland";

const StationSettings: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<StationFormValues>({
    defaultValues: {
      stations: [{ code: "", bundesland: DEFAULT_BUNDESLAND }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stations",
  });

  // Stationcodes aus localStorage laden
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data) && data.every(item => typeof item.code === "string" && typeof item.bundesland === "string")) {
          form.reset({ stations: data.length ? data : [{ code: "", bundesland: DEFAULT_BUNDESLAND }] });
        } else if (Array.isArray(data) && data.every(item => typeof item.code === "string")) {
          // Für altes Format: migrieren auf neues Format!
          form.reset({
            stations: data.map((s: any) => ({
              code: s.code,
              bundesland: s.bundesland || DEFAULT_BUNDESLAND
            }))
          });
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, [form.reset]);

  // Beim Speichern persistieren
  const onSubmit = (values: StationFormValues) => {
    const filtered = values.stations.filter(s => s.code.trim());
    if (filtered.length === 0) {
      toast({ title: "Mindestens eine Station muss eingetragen werden.", variant: "destructive" });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    toast({ title: "Stationscodes gespeichert", description: "Die Stationen wurden erfolgreich gespeichert." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stationsverwaltung</CardTitle>
        <CardDescription>
          Fügen Sie hier die Codes Ihrer Station(en) hinzu und wählen Sie das zugehörige Bundesland. Sie können beliebig viele Stationen verwalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.code`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">Stationscode</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Stationscode"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.bundesland`}
                    render={({ field }) => (
                      <FormItem className="min-w-[180px]">
                        <FormLabel className="sr-only">Bundesland</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Bundesland wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(bundeslandLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="ml-2"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    aria-label="Station entfernen"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ code: "", bundesland: DEFAULT_BUNDESLAND })}
                className="flex items-center gap-1"
                aria-label="Station hinzufügen"
              >
                <Plus className="w-4 h-4" />
                Station hinzufügen
              </Button>
              <Button type="submit" className="ml-auto">Speichern</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StationSettings;

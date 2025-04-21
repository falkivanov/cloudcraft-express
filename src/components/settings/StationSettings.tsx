
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";

const STORAGE_KEY = "station_codes";

type StationFormValues = {
  stations: {
    code: string;
    bundesland: Bundesland;
    startDate?: Date | null;
    endDate?: Date | null;
  }[];
};

const DEFAULT_BUNDESLAND: Bundesland = "saarland";

const StationSettings: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<StationFormValues>({
    defaultValues: {
      stations: [{ code: "", bundesland: DEFAULT_BUNDESLAND, startDate: null, endDate: null }],
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
        if (
          Array.isArray(data) &&
          data.every(
            (item) =>
              typeof item.code === "string" &&
              typeof item.bundesland === "string"
          )
        ) {
          // Kompatibel mit ggf. bereits bestehenden startDate/endDate
          form.reset({
            stations: data.length
              ? data.map((s: any) => ({
                  code: s.code,
                  bundesland: s.bundesland,
                  startDate: s.startDate ? new Date(s.startDate) : null,
                  endDate: s.endDate ? new Date(s.endDate) : null,
                }))
              : [
                  {
                    code: "",
                    bundesland: DEFAULT_BUNDESLAND,
                    startDate: null,
                    endDate: null,
                  },
                ],
          });
        } else if (Array.isArray(data) && data.every((item) => typeof item.code === "string")) {
          // Für altes Format: migrieren auf neues Format!
          form.reset({
            stations: data.map((s: any) => ({
              code: s.code,
              bundesland: s.bundesland || DEFAULT_BUNDESLAND,
              startDate: null,
              endDate: null,
            })),
          });
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, [form.reset]);

  // Beim Speichern persistieren
  const onSubmit = (values: StationFormValues) => {
    const filtered = values.stations.filter((s) => s.code.trim());
    if (filtered.length === 0) {
      toast({ title: "Mindestens eine Station muss eingetragen werden.", variant: "destructive" });
      return;
    }

    // Dates serialisieren (localStorage kann kein Date speichern)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        filtered.map((station) => ({
          ...station,
          startDate: station.startDate ? station.startDate.toISOString() : null,
          endDate: station.endDate ? station.endDate.toISOString() : null,
        }))
      )
    );
    toast({ title: "Stationscodes gespeichert", description: "Die Stationen wurden erfolgreich gespeichert." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stationsverwaltung</CardTitle>
        <CardDescription>
          Fügen Sie hier die Codes Ihrer Station(en) hinzu und wählen Sie das zugehörige Bundesland. Sie können beliebig viele Stationen verwalten.<br />
          Zusätzlich können Sie für jede Station das Start- und Enddatum festlegen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2 flex-wrap">
                  {/* Stationscode */}
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.code`}
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-[120px]">
                        <FormLabel className="sr-only">Stationscode</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Stationscode" autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Bundesland */}
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.bundesland`}
                    render={({ field }) => (
                      <FormItem className="min-w-[160px]">
                        <FormLabel className="sr-only">Bundesland</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
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
                  {/* Startdatum */}
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.startDate`}
                    render={({ field }) => (
                      <FormItem className="min-w-[150px]">
                        <FormLabel className="sr-only">Startdatum</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={
                                  "w-[130px] pl-3 text-left font-normal " +
                                  (!field.value ? "text-muted-foreground" : "")
                                }
                              >
                                {field.value
                                  ? format(field.value, "dd.MM.yyyy")
                                  : <span>Startdatum</span>}
                                <CalendarCheck className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Enddatum */}
                  <FormField
                    control={form.control}
                    name={`stations.${idx}.endDate`}
                    render={({ field }) => (
                      <FormItem className="min-w-[150px]">
                        <FormLabel className="sr-only">Enddatum</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={
                                  "w-[130px] pl-3 text-left font-normal " +
                                  (!field.value ? "text-muted-foreground" : "")
                                }
                              >
                                {field.value
                                  ? format(field.value, "dd.MM.yyyy")
                                  : <span>Enddatum</span>}
                                <CalendarCheck className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Entfernen Button */}
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
                onClick={() =>
                  append({
                    code: "",
                    bundesland: DEFAULT_BUNDESLAND,
                    startDate: null,
                    endDate: null,
                  })
                }
                className="flex items-center gap-1"
                aria-label="Station hinzufügen"
              >
                <Plus className="w-4 h-4" />
                Station hinzufügen
              </Button>
              <Button type="submit" className="ml-auto">
                Speichern
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StationSettings;

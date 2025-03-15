import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserIcon, PhoneIcon, MailIcon, MapPinIcon, UserPlusIcon, Calendar, Truck, Clock, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  location: string;
  transporterId?: string;
  startDate?: Date;
  endDate?: Date | null;
  address?: string;
  birthday?: Date;
  taxId?: string;
  insuranceId?: string;
  workingDaysPerWeek?: number;
  preferredVehicle?: string;
  avatar?: string;
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Max Mustermann",
    position: "Fahrzeugführer",
    email: "max.mustermann@finsuite.de",
    phone: "+49 123 456789",
    location: "Berlin",
    transporterId: "TR-001",
    startDate: new Date(2020, 2, 15),
    address: "Berliner Str. 123, 10115 Berlin",
    birthday: new Date(1985, 4, 20),
    taxId: "12345678901",
    insuranceId: "A123456789",
    workingDaysPerWeek: 5,
    preferredVehicle: "Mercedes Sprinter",
  },
  {
    id: 2,
    name: "Anna Schmidt",
    position: "Logistik Manager",
    email: "anna.schmidt@finsuite.de", 
    phone: "+49 123 456788",
    location: "München",
  },
  {
    id: 3,
    name: "Thomas Müller",
    position: "Fuhrpark Leiter",
    email: "thomas.mueller@finsuite.de",
    phone: "+49 123 456787",
    location: "Hamburg",
  },
  {
    id: 4,
    name: "Laura Weber",
    position: "Buchhaltung",
    email: "laura.weber@finsuite.de",
    phone: "+49 123 456786",
    location: "Frankfurt",
  },
  {
    id: 5,
    name: "Michael Fischer",
    position: "Geschäftsführer",
    email: "michael.fischer@finsuite.de",
    phone: "+49 123 456785",
    location: "Köln",
  }
];

const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className="h-full w-full rounded-full object-cover" 
            />
          ) : (
            <UserIcon className="h-6 w-6 text-secondary-foreground" />
          )}
        </div>
        <div>
          <CardTitle className="text-xl">{employee.name}</CardTitle>
          <CardDescription>{employee.position}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{employee.location}</span>
          </div>
          {employee.transporterId && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>ID: {employee.transporterId}</span>
            </div>
          )}
          {employee.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Seit: {format(employee.startDate, 'dd.MM.yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        {employee.workingDaysPerWeek && (
          <div className="flex items-center gap-2 mr-4">
            <Clock className="h-3 w-3" />
            <span>{employee.workingDaysPerWeek} Tage/Woche</span>
          </div>
        )}
        {employee.preferredVehicle && (
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3" />
            <span>{employee.preferredVehicle}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const AddEmployeeForm = ({ onClose, onAdd }: { onClose: () => void, onAdd: (employee: Employee) => void }) => {
  const form = useForm<Omit<Employee, 'id'>>();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  
  const handleSubmit = (data: Omit<Employee, 'id'>) => {
    onAdd({
      ...data,
      id: Date.now(),
      startDate,
      endDate,
      birthday
    });
    form.reset();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Max Mustermann" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Fahrzeugführer" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="max.mustermann@finsuite.de" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input placeholder="+49 123 456789" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standort</FormLabel>
                <FormControl>
                  <Input placeholder="Berlin" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transporterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transporter ID</FormLabel>
                <FormControl>
                  <Input placeholder="TR-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Einstellungsdatum</Label>
          <div className="border rounded-md p-2">
            <CalendarPicker
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              locale={de}
              className="mx-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Textarea placeholder="Berliner Str. 123, 10115 Berlin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Geburtsdatum</Label>
            <div className="border rounded-md p-2">
              <CalendarPicker
                mode="single"
                selected={birthday}
                onSelect={setBirthday}
                locale={de}
                className="mx-auto"
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steuer-ID</FormLabel>
                <FormControl>
                  <Input placeholder="12345678901" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="insuranceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versicherungs-ID</FormLabel>
                <FormControl>
                  <Input placeholder="A123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workingDaysPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arbeitstage pro Woche</FormLabel>
                <FormControl>
                  <ToggleGroup 
                    type="single" 
                    className="justify-start"
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <ToggleGroupItem key={day} value={day.toString()}>
                        {day}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredVehicle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevorzugtes Fahrzeug</FormLabel>
                <FormControl>
                  <Input placeholder="Mercedes Sprinter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Abbrechen</Button>
          <Button type="submit">Hinzufügen</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mitarbeiter</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlusIcon className="h-4 w-4" />
              Mitarbeiter hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
              <DialogDescription>
                Fügen Sie hier die Daten des neuen Mitarbeiters hinzu.
              </DialogDescription>
            </DialogHeader>
            <AddEmployeeForm onClose={() => setIsDialogOpen(false)} onAdd={handleAddEmployee} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;

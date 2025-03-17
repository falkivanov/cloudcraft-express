
import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, subDays, parse } from "date-fns";
import { de } from "date-fns/locale";
import { Car, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initialEmployees } from "@/data/sampleEmployeeData";

// Beispieldaten für die Fahrzeugzuordnungshistorie
const sampleVehicleAssignments = [
  {
    id: "va1",
    date: "2023-07-01",
    employeeId: "1",
    employeeName: "Max Mustermann",
    vehicleId: "v1",
    vehicleInfo: "VW Transporter (B-AB 1234)",
    assignedAt: "2023-06-30T15:30:00Z",
    assignedBy: "Admin"
  },
  {
    id: "va2",
    date: "2023-07-01",
    employeeId: "2",
    employeeName: "Lisa Müller",
    vehicleId: "v2",
    vehicleInfo: "Mercedes Sprinter (B-CD 5678)",
    assignedAt: "2023-06-30T15:30:00Z",
    assignedBy: "Admin"
  },
  {
    id: "va3",
    date: "2023-07-02",
    employeeId: "3",
    employeeName: "Peter Schmidt",
    vehicleId: "v3",
    vehicleInfo: "Ford Transit (B-EF 9012)",
    assignedAt: "2023-07-01T16:45:00Z",
    assignedBy: "Admin"
  },
  {
    id: "va4",
    date: "2023-07-03",
    employeeId: "1",
    employeeName: "Max Mustermann",
    vehicleId: "v3",
    vehicleInfo: "Ford Transit (B-EF 9012)",
    assignedAt: "2023-07-02T14:15:00Z",
    assignedBy: "Admin"
  },
  {
    id: "va5",
    date: "2023-07-03",
    employeeId: "2",
    employeeName: "Lisa Müller",
    vehicleId: "v1",
    vehicleInfo: "VW Transporter (B-AB 1234)",
    assignedAt: "2023-07-02T14:15:00Z",
    assignedBy: "Admin"
  },
  // Neuere Einträge für Demo-Zwecke
  {
    id: "va6",
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    employeeId: "1",
    employeeName: "Max Mustermann",
    vehicleId: "v5",
    vehicleInfo: "Audi A4 (B-IJ 7890)",
    assignedAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    assignedBy: "Admin"
  },
  {
    id: "va7",
    date: format(new Date(), "yyyy-MM-dd"),
    employeeId: "2",
    employeeName: "Lisa Müller",
    vehicleId: "v1",
    vehicleInfo: "VW Transporter (B-AB 1234)",
    assignedAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    assignedBy: "Admin"
  },
];

const VehicleAssignmentHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  // Generieren von Datumswerten für die letzten 30 Tage
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "dd.MM.yyyy (EEEE)", { locale: de })
    };
  });
  
  // Filtern der Zuweisungen basierend auf den Suchkriterien
  const filteredAssignments = sampleVehicleAssignments.filter(assignment => {
    const matchesSearch = searchQuery === "" || 
      assignment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assignment.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || assignment.date === dateFilter;
    
    const matchesEmployee = !selectedEmployee || assignment.employeeId === selectedEmployee;
    
    return matchesSearch && matchesDate && matchesEmployee;
  });
  
  // Sortieren nach Datum (neueste zuerst)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Car className="h-5 w-5" /> 
          Fahrzeugzuordnungshistorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Mitarbeiter oder Fahrzeug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={dateFilter || ""} onValueChange={(value) => setDateFilter(value || null)}>
                <SelectTrigger className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Datum wählen" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Datums</SelectItem>
                  {dateOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedEmployee || ""} 
                onValueChange={(value) => setSelectedEmployee(value || null)}
              >
                <SelectTrigger className="min-w-[180px]">
                  <SelectValue placeholder="Mitarbeiter wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Mitarbeiter</SelectItem>
                  {initialEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter(null);
                  setSelectedEmployee(null);
                }}
              >
                Zurücksetzen
              </Button>
            </div>
          </div>
          
          {sortedAssignments.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Car className="mx-auto h-16 w-16 mb-4 opacity-20" />
              <p>Keine Fahrzeugzuordnungen gefunden.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Fahrzeug</TableHead>
                    <TableHead>Kennzeichen</TableHead>
                    <TableHead className="text-right">Zugewiesen am</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAssignments.map((assignment) => {
                    const assignDate = parse(assignment.date, "yyyy-MM-dd", new Date());
                    const assignedDate = parse(assignment.assignedAt.split('T')[0], "yyyy-MM-dd", new Date());
                    
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {format(assignDate, "dd.MM.yyyy", { locale: de })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(assignDate, "EEEE", { locale: de })}
                          </div>
                        </TableCell>
                        <TableCell>{assignment.employeeName}</TableCell>
                        <TableCell>
                          {assignment.vehicleInfo.split(' (')[0]}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assignment.vehicleInfo.match(/\((.*?)\)/)?.[1] || ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">{format(assignedDate, "dd.MM.yyyy", { locale: de })}</div>
                          <div className="text-xs text-muted-foreground">
                            von {assignment.assignedBy}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleAssignmentHistory;

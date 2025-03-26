
import { VehicleAssignment } from "@/types/shift";

// Filtert die Zuordnungen basierend auf den übergebenen Filter-Parametern
export const filterAssignments = (
  assignments: VehicleAssignment[],
  searchQuery: string,
  dateFilter: string | null,
  selectedEmployee: string | null
): VehicleAssignment[] => {
  return assignments.filter(assignment => {
    const matchesSearch = searchQuery === "" || 
      assignment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      assignment.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || assignment.date === dateFilter;
    
    const matchesEmployee = !selectedEmployee || assignment.employeeId === selectedEmployee;
    
    return matchesSearch && matchesDate && matchesEmployee;
  });
};

// Sortiert Zuordnungen nach Datum (neueste zuerst)
export const sortAssignmentsByDate = (assignments: VehicleAssignment[]): VehicleAssignment[] => {
  return [...assignments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Erzeugt Beispieldaten für die Fahrzeugzuordnungshistorie als Fallback
export const getSampleVehicleAssignments = (): VehicleAssignment[] => {
  return [
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
    {
      id: "va6",
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
      employeeId: "1",
      employeeName: "Max Mustermann",
      vehicleId: "v5",
      vehicleInfo: "Audi A4 (B-IJ 7890)",
      assignedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      assignedBy: "Admin"
    },
    {
      id: "va7",
      date: new Date().toISOString().split('T')[0],
      employeeId: "2",
      employeeName: "Lisa Müller",
      vehicleId: "v1",
      vehicleInfo: "VW Transporter (B-AB 1234)",
      assignedAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      assignedBy: "Admin"
    },
  ];
};

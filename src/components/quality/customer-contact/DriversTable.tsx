
import React, { useState } from "react";
import { FilterIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

interface DriverComplianceData {
  name: string;
  firstName: string;
  totalAddresses: number;
  totalContacts: number;
  compliancePercentage: number;
}

interface DriversTableProps {
  driversData: DriverComplianceData[];
}

const DriversTable: React.FC<DriversTableProps> = ({ driversData }) => {
  const [filterValue, setFilterValue] = useState<string>("all");

  // Style for compliance values
  const getComplianceStyle = (percentage: number) => {
    if (percentage < 85) return "bg-red-100 text-red-800 font-semibold";
    if (percentage < 98) return "bg-amber-100 text-amber-800 font-semibold";
    return "bg-green-100 text-green-800 font-semibold";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 85) return "bg-red-500";
    if (percentage < 98) return "bg-amber-500";
    return "bg-green-500";
  };

  // Filter drivers based on compliance
  const getFilteredDrivers = () => {
    if (filterValue === "low") {
      return driversData.filter(driver => driver.compliancePercentage < 85);
    } else if (filterValue === "medium") {
      return driversData.filter(driver => driver.compliancePercentage >= 85 && driver.compliancePercentage < 98);
    } else if (filterValue === "high") {
      return driversData.filter(driver => driver.compliancePercentage >= 98);
    }
    return driversData;
  };

  const filteredDrivers = getFilteredDrivers();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fahrerübersicht</span>
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-4 w-4 mr-1" />
            <select 
              className="text-sm border rounded p-1"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="all">Alle Fahrer</option>
              <option value="low">Niedrige Compliance (&lt;85%)</option>
              <option value="medium">Mittlere Compliance (85-97%)</option>
              <option value="high">Hohe Compliance (≥98%)</option>
            </select>
          </div>
        </CardTitle>
        <CardDescription>
          {filteredDrivers.length} Fahrer angezeigt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Adressen</TableHead>
              <TableHead>Kontakte</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.totalAddresses}</TableCell>
                <TableCell>{driver.totalContacts}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{driver.compliancePercentage}%</span>
                    <Progress 
                      value={driver.compliancePercentage} 
                      className={`w-20 h-2 ${getProgressColor(driver.compliancePercentage)}`} 
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getComplianceStyle(driver.compliancePercentage)}>
                    {driver.compliancePercentage < 85 ? "Kritisch" : 
                     driver.compliancePercentage < 98 ? "Verbesserungsbedarf" : "Gut"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DriversTable;

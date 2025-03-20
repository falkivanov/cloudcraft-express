
import React, { useState } from "react";
import { FilterIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DriverComplianceData } from "./types";
import { getComplianceStyle, getProgressColor } from "./utils";

interface DriversTableProps {
  driversData: DriverComplianceData[];
}

const DriversTable: React.FC<DriversTableProps> = ({ driversData }) => {
  const [filterValue, setFilterValue] = useState<string>("all");
  
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

  const getComplianceTextColor = (percentage: number) => {
    if (percentage < 85) return "text-red-600 font-semibold";
    if (percentage < 98) return "text-amber-600 font-semibold";
    return "text-green-600 font-semibold";
  };

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.totalAddresses}</TableCell>
                <TableCell>{driver.totalContacts}</TableCell>
                <TableCell>
                  <span className={getComplianceTextColor(driver.compliancePercentage)}>
                    {driver.compliancePercentage}%
                  </span>
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

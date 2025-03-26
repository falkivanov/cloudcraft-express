
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { DriverComplianceData } from "./types";
import { getComplianceStyle, getProgressColor } from "./utils";

interface DriversTableProps {
  driversData: DriverComplianceData[];
  activeFilter?: string;
}

const DriversTable: React.FC<DriversTableProps> = ({ driversData, activeFilter }) => {
  const [filterValue, setFilterValue] = useState<string>("all");
  
  // Update the filter value when activeFilter changes
  useEffect(() => {
    if (activeFilter) {
      setFilterValue(activeFilter);
    }
  }, [activeFilter]);
  
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
        <CardTitle>Fahrerübersicht</CardTitle>
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
              <TableHead>davon kontaktiert</TableHead>
              <TableHead>Compliance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.map((driver, index) => {
              // Extract just the name part without the transporter ID in parentheses
              const displayName = driver.name.split(" (")[0];
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{displayName}</TableCell>
                  <TableCell>{driver.totalAddresses}</TableCell>
                  <TableCell>{driver.totalContacts}</TableCell>
                  <TableCell>
                    <span className={getComplianceTextColor(driver.compliancePercentage)}>
                      {driver.compliancePercentage}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DriversTable;

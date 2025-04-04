
import React from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DriverComplianceData } from "./types";
import { getComplianceStyle } from "./utils";

interface CustomerContactTableProps {
  driversData: DriverComplianceData[];
}

const CustomerContactTable: React.FC<CustomerContactTableProps> = ({ driversData }) => {
  const sortedDrivers = [...driversData].sort((a, b) => {
    return a.compliancePercentage - b.compliancePercentage;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Driver Summary</CardTitle>
        <CardDescription>
          Contact Compliance Report - {driversData.length} Drivers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Total Addresses</TableHead>
                <TableHead className="text-right">Total Contacts</TableHead>
                <TableHead className="text-right">Contact Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDrivers.map((driver, index) => {
                const complianceClass = getComplianceStyle(driver.compliancePercentage);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell className="text-right">{driver.totalAddresses}</TableCell>
                    <TableCell className="text-right">{driver.totalContacts}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded ${complianceClass}`}>
                        {driver.compliancePercentage.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerContactTable;

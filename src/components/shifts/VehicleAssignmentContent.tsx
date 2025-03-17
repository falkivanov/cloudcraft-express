
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VehicleAssignmentView from "@/components/shifts/VehicleAssignmentView";

interface VehicleAssignmentContentProps {
  isEnabled: boolean;
}

const VehicleAssignmentContent: React.FC<VehicleAssignmentContentProps> = ({ isEnabled }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fahrzeugzuordnung</CardTitle>
        <CardDescription>
          Ordnen Sie den geplanten Mitarbeitern Fahrzeuge zu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VehicleAssignmentView isEnabled={isEnabled} />
      </CardContent>
    </Card>
  );
};

export default VehicleAssignmentContent;

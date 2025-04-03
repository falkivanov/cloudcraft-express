
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MentorTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>First Name</TableHead>
        <TableHead>Last Name</TableHead>
        <TableHead className="text-center">FICO Score</TableHead>
        <TableHead className="text-center">Station</TableHead>
        <TableHead className="text-right">Trips</TableHead>
        <TableHead className="text-right">KM</TableHead>
        <TableHead className="text-right">Hours</TableHead>
        <TableHead className="text-center">Acceleration</TableHead>
        <TableHead className="text-center">Braking</TableHead>
        <TableHead className="text-center">Cornering</TableHead>
        <TableHead className="text-center">Speeding</TableHead>
        <TableHead className="text-center">Seatbelt</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;

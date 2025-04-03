
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MentorTableHeader: React.FC = () => {
  return (
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="w-[180px]">Fahrer</TableHead>
        <TableHead>Station</TableHead>
        <TableHead className="text-right">Fahrten</TableHead>
        <TableHead className="text-right">Stunden</TableHead>
        <TableHead className="text-center">Beschl.</TableHead>
        <TableHead className="text-center">Bremsen</TableHead>
        <TableHead className="text-center">Kurven</TableHead>
        <TableHead className="text-center">Ablenk.</TableHead>
        <TableHead className="text-center">Gurt</TableHead>
        <TableHead className="text-center">Tempo</TableHead>
        <TableHead className="text-center">Abstand</TableHead>
        <TableHead className="text-center">Score</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;

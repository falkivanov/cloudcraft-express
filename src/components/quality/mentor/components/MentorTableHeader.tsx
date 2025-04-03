
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MentorTableHeader: React.FC = () => {
  return (
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="w-[100px]">Vorname</TableHead>
        <TableHead className="w-[100px]">Nachname</TableHead>
        <TableHead className="text-center">FICO® Score</TableHead>
        <TableHead className="text-center">Station</TableHead>
        <TableHead className="text-right">Fahrten</TableHead>
        <TableHead className="text-right">Km</TableHead>
        <TableHead className="text-right">Stunden</TableHead>
        <TableHead className="text-center">Beschl.</TableHead>
        <TableHead className="text-center">Bremsen</TableHead>
        <TableHead className="text-center">Kurven</TableHead>
        <TableHead className="text-center">Tempo</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MentorTableHeader;

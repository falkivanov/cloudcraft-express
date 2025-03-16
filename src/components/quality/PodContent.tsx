import React from "react";
import NoDataMessage from "./NoDataMessage";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface PodContentProps {
  podData: any | null;
}

const PodContent: React.FC<PodContentProps> = ({ podData }) => {
  if (!podData) {
    return <NoDataMessage category="POD" />;
  }

  return (
    <div className="mt-6 p-4 border rounded bg-slate-50">
      <h3 className="text-lg font-semibold mb-2">Geladene POD-Daten</h3>
      <p>Dateiname: {podData.fileName}</p>
      <p>Dateityp: {podData.type.toUpperCase()}</p>
      {/* Hier könnte eine spezifische Darstellung der POD-Daten erfolgen */}
    </div>
  );
};

export default PodContent;

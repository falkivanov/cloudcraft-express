import React from "react";
import NoDataMessage from "./NoDataMessage";

interface ConcessionsContentProps {
  concessionsData: any | null;
}

const ConcessionsContent: React.FC<ConcessionsContentProps> = ({ concessionsData }) => {
  if (!concessionsData) {
    return <NoDataMessage category="Concessions" />;
  }

  return (
    <div className="mt-6 p-4 border rounded bg-slate-50">
      <h3 className="text-lg font-semibold mb-2">Geladene Concessions-Daten</h3>
      <p>Dateiname: {concessionsData.fileName}</p>
      <p>Dateityp: {concessionsData.type.toUpperCase()}</p>
      {/* Hier könnte eine spezifische Darstellung der Concessions-Daten erfolgen */}
    </div>
  );
};

export default ConcessionsContent;

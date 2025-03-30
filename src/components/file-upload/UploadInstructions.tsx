
import React from "react";

const UploadInstructions: React.FC = () => {
  return (
    <div className="mb-4 p-4 border rounded-lg bg-amber-50 text-amber-800">
      <h3 className="font-medium">Hinweis zur Dateizuordnung:</h3>
      <p className="text-sm">
        Wählen Sie die passende Kategorie für Ihre Datei aus und laden Sie sie im richtigen Format hoch:
      </p>
      <ul className="text-sm mt-2 list-disc list-inside">
        <li>Scorecard: PDF-Format (.pdf)</li>
        <li>Customer Contact: HTML-Format (.html, .htm)</li>
        <li>POD: PDF-Format (.pdf)</li>
        <li>Concessions: Excel-Format (.xlsx)</li>
        <li>Mentor: Excel-Format (.xlsx)</li>
      </ul>
    </div>
  );
};

export default UploadInstructions;

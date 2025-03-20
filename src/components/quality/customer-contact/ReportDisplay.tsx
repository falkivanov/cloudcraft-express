
import React from "react";

interface ReportDisplayProps {
  reportData: string;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportData }) => {
  return (
    <div 
      className="max-h-[500px] overflow-auto border rounded p-4 bg-slate-50 customer-contact-report"
      dangerouslySetInnerHTML={{ 
        __html: reportData.replace(
          /<td>(\d+(\.\d+)?)%<\/td>/g, 
          (match, percentage) => {
            const value = parseFloat(percentage);
            const colorClass = value < 98 ? 'bg-red-100 text-red-800 font-semibold' : 'bg-green-100 text-green-800 font-semibold';
            return `<td class="${colorClass} px-2 py-1 rounded">${value}%</td>`;
          }
        ) 
      }} 
    />
  );
};

export default ReportDisplay;

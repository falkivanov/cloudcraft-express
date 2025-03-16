
export const fileTypes = [
  { id: "pdf", name: "PDF", extensions: [".pdf"] },
  { id: "excel", name: "Excel", extensions: [".xlsx", ".xls"] },
  { id: "csv", name: "CSV", extensions: [".csv"] },
  { id: "html", name: "HTML", extensions: [".html", ".htm"] },
];

export const getFileTypeInfo = (fileTypeId: string) => {
  return fileTypes.find(type => type.id === fileTypeId);
};

export const getFileIcon = (fileTypeId: string) => {
  switch (fileTypeId) {
    case "pdf":
      return "text-red-500";
    case "excel":
      return "text-green-500";
    case "csv":
      return "text-blue-500";
    case "html":
      return "text-orange-500";
    default:
      return "";
  }
};

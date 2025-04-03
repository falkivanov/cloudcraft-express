
import * as XLSX from "xlsx";

/**
 * Reads Excel file content as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as ArrayBuffer;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error("Fehler beim Lesen der Datei"));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Reads and parses Excel file into JSON
 */
export async function readExcelFile(file: File): Promise<any[]> {
  try {
    // Excel-Datei lesen und parsen
    const content = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(content, { type: "array" });
    
    // Verwende das erste Arbeitsblatt
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // In JSON konvertieren mit Header-Option
    return XLSX.utils.sheet_to_json(worksheet, { 
      header: 'A',
      range: 0 
    });
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw new Error("Fehler beim Lesen der Excel-Datei");
  }
}

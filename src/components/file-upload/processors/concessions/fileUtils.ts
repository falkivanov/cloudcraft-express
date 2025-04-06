
/**
 * Utilities for file operations
 */

/**
 * Read a file as ArrayBuffer
 * @param file The file to read
 * @returns Promise resolving to ArrayBuffer
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

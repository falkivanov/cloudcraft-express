
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getCategoryInfo } from "./fileCategories";
import { parseScorecardPDF, PDFParseError } from "@/components/quality/scorecard/utils/pdfParser";

export const useFileUpload = (onFileUpload?: (file: File, type: string, category: string) => void) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("scorecard");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const validateAndSetFile = (selectedFile: File) => {
    const categoryInfo = getCategoryInfo(selectedCategory);
    
    if (!categoryInfo) {
      toast.error("Ungültige Kategorie ausgewählt");
      return;
    }
    
    // Dateiendung prüfen
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    
    // Prüfen, ob die Datei dem erwarteten Typ entspricht
    let isValid = false;
    
    if (categoryInfo.expectedType === "pdf" && fileExtension === ".pdf") {
      isValid = true;
    } else if (categoryInfo.expectedType === "html" && (fileExtension === ".html" || fileExtension === ".htm")) {
      isValid = true;
    } else if (categoryInfo.expectedType === "excel" && (fileExtension === ".xlsx" || fileExtension === ".xls")) {
      isValid = true;
    }
    
    if (isValid) {
      setFile(selectedFile);
      
      // Extract KW information from filename if it's a scorecard
      if (categoryInfo.id === "scorecard") {
        const weekMatch = selectedFile.name.match(/KW[_\s]*(\d+)/i);
        if (weekMatch && weekMatch[1]) {
          const extractedWeek = parseInt(weekMatch[1], 10);
          console.log(`Detected KW ${extractedWeek} in filename`);
          toast.success(`Datei "${selectedFile.name}" ausgewählt (KW ${extractedWeek})`);
        } else {
          toast.success(`Datei "${selectedFile.name}" ausgewählt`);
        }
      } else {
        toast.success(`Datei "${selectedFile.name}" ausgewählt`);
      }
    } else {
      toast.error(`Ungültiger Dateityp für ${categoryInfo.name}. Erwartet wird: ${categoryInfo.expectedType.toUpperCase()}`);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (file) {
      const categoryInfo = getCategoryInfo(selectedCategory);
      if (categoryInfo) {
        setProcessing(true);
        try {
          // Process different file types
          if (categoryInfo.id === "scorecard" && categoryInfo.expectedType === "pdf") {
            await processScorecardPDF(file);
          } else {
            // Default processing for other file types
            onFileUpload?.(file, categoryInfo.expectedType, selectedCategory);
            
            // Show different toast messages based on category
            if (categoryInfo.id === "scorecard") {
              const weekMatch = file.name.match(/KW[_\s]*(\d+)/i);
              if (weekMatch && weekMatch[1]) {
                const extractedWeek = parseInt(weekMatch[1], 10);
                toast.success(`Scorecard für KW ${extractedWeek} erfolgreich hochgeladen`, {
                  description: "Die Woche wurde automatisch erkannt und zugeordnet."
                });
              } else {
                toast.success(`Datei "${file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
              }
            } else {
              toast.success(`Datei "${file.name}" erfolgreich als ${categoryInfo.name} hochgeladen`);
            }
          }
          
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Error processing file:", error);
          let errorMessage = 'Unbekannter Fehler';
          
          if (error instanceof PDFParseError) {
            errorMessage = error.message;
            
            // Add additional info based on error code
            switch (error.code) {
              case 'PASSWORD_PROTECTED':
                errorMessage += ' Bitte entfernen Sie das Passwort und versuchen Sie es erneut.';
                break;
              case 'INSUFFICIENT_PAGES':
                errorMessage += ' Die Scorecard enthält normalerweise mindestens 2 Seiten.';
                break;
              case 'INSUFFICIENT_CONTENT':
              case 'NO_KPIS_FOUND':
                errorMessage += ' Stellen Sie sicher, dass es sich um eine gültige Scorecard handelt.';
                break;
            }
          } else if (error instanceof Error) {
            errorMessage = `Fehler beim Verarbeiten der Datei: ${error.message}`;
          }
          
          toast.error(errorMessage);
        } finally {
          setProcessing(false);
        }
      }
    } else {
      toast.error("Bitte wählen Sie zuerst eine Datei aus");
    }
  };
  
  /**
   * Process a scorecard PDF file
   */
  const processScorecardPDF = async (file: File) => {
    // Show loading toast
    const loadingToast = toast.loading("Verarbeite Scorecard PDF...");
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse the PDF
      const parsedData = await parseScorecardPDF(arrayBuffer, file.name);
      
      if (parsedData) {
        // Store the parsed data in localStorage
        localStorage.setItem("extractedScorecardData", JSON.stringify(parsedData));
        
        // Store file info for reference
        localStorage.setItem("scorecardData", JSON.stringify({
          content: "PDF processed", // We don't store the raw PDF content
          type: "pdf",
          fileName: file.name,
          parsed: true,
          week: parsedData.week,
          year: parsedData.year
        }));
        
        // Close loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`Scorecard für KW ${parsedData.week} erfolgreich verarbeitet`, {
          description: "Die Daten wurden aus dem PDF extrahiert und können jetzt angezeigt werden."
        });
        
        // Also call the parent handler
        onFileUpload?.(file, "pdf", "scorecard");
      } else {
        throw new Error("Keine Daten konnten aus der PDF extrahiert werden");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.dismiss(loadingToast);
      
      if (error instanceof PDFParseError) {
        toast.error(`Fehler beim Verarbeiten der PDF: ${error.message}`, {
          description: "Bitte überprüfen Sie das PDF-Format und versuchen Sie es erneut."
        });
      } else {
        toast.error(`Fehler beim Verarbeiten der PDF: ${(error as Error).message || 'Unbekannter Fehler'}`, {
          description: "Ein unerwarteter Fehler ist aufgetreten."
        });
      }
    }
  };

  return {
    selectedCategory,
    file,
    fileInputRef,
    processing,
    handleCategoryChange,
    validateAndSetFile,
    handleUpload
  };
};

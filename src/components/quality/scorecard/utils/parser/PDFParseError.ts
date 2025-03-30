
/**
 * Custom error class for PDF parsing errors
 */
export class PDFParseError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PDFParseError';
  }
}

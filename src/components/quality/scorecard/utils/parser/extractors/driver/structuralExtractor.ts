
import { extractDriverKPIsFromStructure as structuralExtraction } from './structural/structuralExtractor';

/**
 * Extract driver KPIs from structural analysis of the PDF
 * This is a wrapper around the implementation to maintain backward compatibility
 */
export const extractDriverKPIsFromStructure = structuralExtraction;

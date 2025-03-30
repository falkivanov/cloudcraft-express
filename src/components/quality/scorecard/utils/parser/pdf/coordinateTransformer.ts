
import * as pdfjs from 'pdfjs-dist';

/**
 * Transform coordinates from PDF space to viewport space
 * @param viewport PDF viewport
 * @param transform PDF transform matrix
 * @returns Transformed coordinates [x, y]
 */
export function transformCoordinates(viewport: any, transform: number[]): [number, number] {
  const tx = pdfjs.Util.transform(viewport.transform, transform);
  return [tx[4], tx[5]]; // return [x, y] coordinates
}

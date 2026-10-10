export interface PDFExtractionResult {
  text: string;
  numpages: number;
  info?: any;
}

/**
 * Extracts raw text and page count from an uploaded PDF document buffer.
 * Powered by pdf-parse core engine without test-mode bundle triggers.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty');
  }

  try {
    let pdfFn: any;
    try {
      // Direct require to lib/pdf-parse avoids the index.js isDebugMode test file check in Next.js/Webpack
      pdfFn = require('pdf-parse/lib/pdf-parse.js');
    } catch {
      const mod = require('pdf-parse');
      pdfFn = typeof mod === 'function' ? mod : mod.default;
    }

    if (typeof pdfFn !== 'function') {
      throw new Error('PDF parser engine function could not be loaded');
    }

    const data = await pdfFn(buffer);
    const text = (data.text || '').trim();

    if (!text) {
      throw new Error('Could not extract readable text from PDF. The document may be an image scan.');
    }

    return {
      text,
      numpages: data.numpages || 1,
      info: data.info,
    };
  } catch (err: any) {
    throw new Error(`Failed to extract text from PDF: ${err?.message || err}`);
  }
}

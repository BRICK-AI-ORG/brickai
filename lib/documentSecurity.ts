const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit to reduce risk surface

const SUSPICIOUS_PATTERNS = [/\/JavaScript/i, /\/JS/i, /\/AA/i, /\/OpenAction/i, /AcroForm/i, /RichMedia/i];

/**
 * Performs lightweight client-side vetting to reject PDFs that look suspicious.
 * NOTE: This is a best-effort check. Servers must still scan uploads before storage.
 */
export async function vetPdfDocument(file: File): Promise<string | null> {
  if (!file.type || !file.type.toLowerCase().includes("pdf")) {
    return "Only PDF documents are allowed.";
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "Documents must be smaller than 5MB.";
  }

  const headerSlice = await file.slice(0, 8).text();
  if (!headerSlice.startsWith("%PDF")) {
    return "File header does not look like a valid PDF.";
  }

  const textSample = await file.text();
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(textSample))) {
    return "Document contains embedded scripts or macros and was rejected.";
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

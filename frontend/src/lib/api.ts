/**
 * API client for communicating with the GrowEasy CSV Importer backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

import { UploadResponse, ExtractionResponse } from '@/types';

/**
 * Upload a CSV file and get parsed preview data.
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Send parsed records for AI extraction.
 */
export async function extractRecords(
  headers: string[],
  rows: Record<string, string>[]
): Promise<ExtractionResponse> {
  const response = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ headers, rows }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Extraction failed with status ${response.status}`);
  }

  return response.json();
}

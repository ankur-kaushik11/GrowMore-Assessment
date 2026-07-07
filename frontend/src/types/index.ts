/**
 * Shared TypeScript types for the GrowEasy CSV Importer frontend
 */

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  originalRow: Record<string, string>;
  reason: string;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    fileName: string;
    fileSize: number;
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
  };
  error?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: {
    success: CRMRecord[];
    skipped: SkippedRecord[];
    totalProcessed: number;
    totalImported: number;
    totalSkipped: number;
  };
  error?: string;
}

export type AppStep = 'upload' | 'preview' | 'processing' | 'results';

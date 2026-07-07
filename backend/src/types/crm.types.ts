/**
 * CRM field type definitions for GrowEasy CSV Importer
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
  crm_status: CRMStatus | string;
  crm_note: string;
  data_source: DataSource | string;
  possession_time: string;
  description: string;
}

export type CRMStatus =
  | "GOOD_LEAD_FOLLOW_UP"
  | "DID_NOT_CONNECT"
  | "BAD_LEAD"
  | "SALE_DONE";

export type DataSource =
  | "leads_on_demand"
  | "meridian_tower"
  | "eden_park"
  | "varah_swamy"
  | "sarjapur_plots";

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ExtractionResult {
  success: CRMRecord[];
  skipped: SkippedRecord[];
  totalProcessed: number;
  totalImported: number;
  totalSkipped: number;
}

export interface SkippedRecord {
  originalRow: Record<string, string>;
  reason: string;
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedRecords: number;
  totalRecords: number;
}

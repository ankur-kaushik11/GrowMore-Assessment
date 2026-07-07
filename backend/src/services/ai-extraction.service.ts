import OpenAI from "openai";
import {
  CRMRecord,
  ExtractionResult,
  SkippedRecord,
} from "../types/crm.types";

const BATCH_SIZE = 25;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Build the system prompt for CRM field extraction.
 */
function buildExtractionPrompt(): string {
  return `You are an expert data mapper for a CRM system. Your job is to intelligently map CSV records with arbitrary column names into the GrowEasy CRM format.

## CRM Fields to Extract

| Field | Description |
|-------|-------------|
| created_at | Lead creation date. Must be in a format parseable by JavaScript's new Date(). Use ISO 8601 format like "2026-05-13T14:20:48" or "2026-05-13 14:20:48". If no date exists, use empty string. |
| name | Lead's full name. Combine first/last name fields if separate. |
| email | Primary email address. If multiple emails exist, use the first one and append the rest to crm_note. |
| country_code | Phone country code (e.g., "+91", "+1"). Extract from phone number if embedded. |
| mobile_without_country_code | Mobile number WITHOUT country code. If multiple numbers exist, use the first and append the rest to crm_note. |
| company | Company/organization name. |
| city | City name. |
| state | State/province name. |
| country | Country name. |
| lead_owner | Lead owner (usually an email). |
| crm_status | Lead status. MUST be one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. If unsure, use "DID_NOT_CONNECT". |
| crm_note | Notes, remarks, follow-up notes, additional comments, extra phone numbers, extra email addresses, or any useful info that doesn't fit elsewhere. |
| data_source | MUST be one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. If none match confidently, leave blank. |
| possession_time | Property possession timeline. |
| description | Any additional description or details. |

## Rules

1. **Intelligent Mapping**: Column names in the CSV may NOT match CRM field names. Use your intelligence to map them. Examples:
   - "Phone" or "Contact Number" → mobile_without_country_code
   - "First Name" + "Last Name" → name
   - "Remarks" or "Comments" → crm_note
   - "Source" or "Platform" → data_source (only if it matches allowed values)
   - "Status" or "Lead Quality" → crm_status (map to nearest allowed value)

2. **Skip Invalid Records**: If a record has NEITHER an email NOR a mobile number, mark it as skipped with reason "No email or mobile number found".

3. **Multiple Contacts**: If multiple emails exist, use the first as "email" and put the rest in crm_note. Same for phone numbers.

4. **Date Handling**: Convert any date format to one parseable by JavaScript's new Date(). If no date is available, use empty string.

5. **CRM Status Mapping**: Map any status-like field to the closest allowed value:
   - Positive/interested/hot lead → GOOD_LEAD_FOLLOW_UP
   - No answer/unreachable/not reachable → DID_NOT_CONNECT
   - Not interested/junk/irrelevant → BAD_LEAD
   - Converted/closed/won/sold → SALE_DONE
   - If unclear, default to DID_NOT_CONNECT

6. **Country Code**: Extract from phone number if embedded (e.g., "+919876543210" → country_code: "+91", mobile: "9876543210"). Common codes: +91 (India), +1 (US/Canada), +44 (UK), +971 (UAE).

7. **No Line Breaks**: Ensure no field value contains unescaped line breaks. Replace newlines with "\\n" in string values.

## Output Format

Return a JSON object with this exact structure:
{
  "extracted": [
    {
      "created_at": "",
      "name": "",
      "email": "",
      "country_code": "",
      "mobile_without_country_code": "",
      "company": "",
      "city": "",
      "state": "",
      "country": "",
      "lead_owner": "",
      "crm_status": "",
      "crm_note": "",
      "data_source": "",
      "possession_time": "",
      "description": ""
    }
  ],
  "skipped": [
    {
      "index": 0,
      "reason": "No email or mobile number found"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanatory text.`;
}

/**
 * Extract CRM records from arbitrary CSV data using OpenAI.
 */
export async function extractCRMRecords(
  rows: Record<string, string>[],
  headers: string[],
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({ apiKey });
  const systemPrompt = buildExtractionPrompt();

  // Split into batches
  const batches: Record<string, string>[][] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const allExtracted: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];
  let processedCount = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchResult = await processBatchWithRetry(
      openai,
      systemPrompt,
      batch,
      headers,
      batchIdx,
      rows
    );

    allExtracted.push(...batchResult.extracted);
    allSkipped.push(...batchResult.skipped);
    processedCount += batch.length;

    if (onProgress) {
      onProgress(processedCount, rows.length);
    }
  }

  return {
    success: allExtracted,
    skipped: allSkipped,
    totalProcessed: rows.length,
    totalImported: allExtracted.length,
    totalSkipped: allSkipped.length,
  };
}

interface BatchResult {
  extracted: CRMRecord[];
  skipped: SkippedRecord[];
}

/**
 * Process a single batch with retry logic.
 */
async function processBatchWithRetry(
  openai: OpenAI,
  systemPrompt: string,
  batch: Record<string, string>[],
  headers: string[],
  batchIndex: number,
  allRows: Record<string, string>[]
): Promise<BatchResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await processBatch(openai, systemPrompt, batch, headers, batchIndex, allRows);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Batch ${batchIndex + 1} attempt ${attempt + 1} failed:`,
        lastError.message
      );

      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries fail, mark all records in this batch as skipped
  console.error(
    `Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries. Skipping batch.`
  );
  return {
    extracted: [],
    skipped: batch.map((row) => ({
      originalRow: row,
      reason: `AI extraction failed after ${MAX_RETRIES} retries: ${lastError?.message || "Unknown error"}`,
    })),
  };
}

/**
 * Process a single batch through OpenAI.
 */
async function processBatch(
  openai: OpenAI,
  systemPrompt: string,
  batch: Record<string, string>[],
  headers: string[],
  batchIndex: number,
  allRows: Record<string, string>[]
): Promise<BatchResult> {
  const userMessage = `Here are CSV records to process. The CSV has these column headers: [${headers.join(", ")}]

Records (batch ${batchIndex + 1}):
${JSON.stringify(batch, null, 2)}

Extract CRM fields from each record following the rules in your instructions. Return the result as JSON.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content?.trim() || "";

  let parsed: { extracted?: any[]; skipped?: any[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${text.substring(0, 200)}`);
  }

  const extracted: CRMRecord[] = (parsed.extracted || []).map(
    (record: any) => sanitizeCRMRecord(record)
  );

  const skipped: SkippedRecord[] = (parsed.skipped || []).map((s: any) => ({
    originalRow: batch[s.index] || {},
    reason: s.reason || "Skipped by AI",
  }));

  return { extracted, skipped };
}

/**
 * Sanitize and validate a CRM record from AI output.
 */
function sanitizeCRMRecord(record: any): CRMRecord {
  const allowedStatuses = [
    "GOOD_LEAD_FOLLOW_UP",
    "DID_NOT_CONNECT",
    "BAD_LEAD",
    "SALE_DONE",
  ];
  const allowedSources = [
    "leads_on_demand",
    "meridian_tower",
    "eden_park",
    "varah_swamy",
    "sarjapur_plots",
  ];

  const sanitized: CRMRecord = {
    created_at: sanitizeString(record.created_at),
    name: sanitizeString(record.name),
    email: sanitizeString(record.email),
    country_code: sanitizeString(record.country_code),
    mobile_without_country_code: sanitizeString(record.mobile_without_country_code),
    company: sanitizeString(record.company),
    city: sanitizeString(record.city),
    state: sanitizeString(record.state),
    country: sanitizeString(record.country),
    lead_owner: sanitizeString(record.lead_owner),
    crm_status: allowedStatuses.includes(record.crm_status)
      ? record.crm_status
      : "",
    crm_note: sanitizeString(record.crm_note),
    data_source: allowedSources.includes(record.data_source)
      ? record.data_source
      : "",
    possession_time: sanitizeString(record.possession_time),
    description: sanitizeString(record.description),
  };

  return sanitized;
}

/**
 * Sanitize a string value — handle nulls, remove line breaks.
 */
function sanitizeString(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  // Replace actual newlines with escaped version for CSV safety
  return str.replace(/\r?\n/g, "\\n");
}

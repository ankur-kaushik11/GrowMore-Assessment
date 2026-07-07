import { parse } from "csv-parse";
import { ParsedCSV } from "../types/crm.types";

/**
 * Parse a CSV buffer into structured data with headers and rows.
 * Handles various delimiters, quoted fields, and encoding quirks.
 */
export async function parseCSV(buffer: Buffer): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    let headers: string[] = [];

    // Remove BOM if present
    let content = buffer.toString("utf-8");
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const parser = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
    });

    parser.on("readable", () => {
      let record: Record<string, string>;
      while ((record = parser.read()) !== null) {
        if (headers.length === 0) {
          headers = Object.keys(record);
        }
        rows.push(record);
      }
    });

    parser.on("error", (err) => {
      reject(new Error(`CSV parsing failed: ${err.message}`));
    });

    parser.on("end", () => {
      if (rows.length === 0) {
        reject(new Error("CSV file is empty or contains no data rows"));
        return;
      }
      resolve({
        headers,
        rows,
        totalRows: rows.length,
      });
    });
  });
}

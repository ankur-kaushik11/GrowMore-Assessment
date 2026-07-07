import { Request, Response, NextFunction } from "express";
import { parseCSV } from "../services/csv-parser.service";
import { extractCRMRecords } from "../services/ai-extraction.service";
import { isValidCSVFile } from "../utils/validation";

/**
 * Handle CSV upload and return parsed preview data.
 * POST /api/upload
 */
export async function uploadCSV(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a CSV file.",
      });
      return;
    }

    if (!isValidCSVFile(req.file.mimetype, req.file.originalname)) {
      res.status(400).json({
        success: false,
        error: "Invalid file type. Please upload a CSV file.",
      });
      return;
    }

    const parsed = await parseCSV(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        headers: parsed.headers,
        rows: parsed.rows,
        totalRows: parsed.totalRows,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Accept parsed records, run AI extraction, and return CRM-formatted data.
 * POST /api/extract
 */
export async function extractRecords(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { headers, rows } = req.body;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      res.status(400).json({
        success: false,
        error: "Missing or invalid headers array.",
      });
      return;
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({
        success: false,
        error: "Missing or invalid rows array.",
      });
      return;
    }

    const result = await extractCRMRecords(rows, headers);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

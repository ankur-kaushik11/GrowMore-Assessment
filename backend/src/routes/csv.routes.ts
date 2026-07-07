import { Router } from "express";
import multer from "multer";
import { uploadCSV, extractRecords } from "../controllers/csv.controller";

const router = Router();

// Configure multer for memory storage (buffer), max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "text/csv",
      "application/vnd.ms-excel",
      "text/plain",
      "application/csv",
      "application/octet-stream",
    ];
    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// POST /api/upload — Upload and parse CSV, return preview
router.post("/upload", upload.single("file"), uploadCSV);

// POST /api/extract — AI extraction on parsed records
router.post("/extract", extractRecords);

export default router;

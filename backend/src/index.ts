import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import csvRoutes from "./routes/csv.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "GrowEasy CSV Importer API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", csvRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 GrowEasy CSV Importer Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Upload: POST http://localhost:${PORT}/api/upload`);
  console.log(`   Extract: POST http://localhost:${PORT}/api/extract\n`);
});

export default app;

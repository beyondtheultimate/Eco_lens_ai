import express from "express";
import cors from "cors";
import multer from "multer";
import { healthHandler } from "./controllers/healthController.js";
import { analyzeHandler } from "./controllers/analyzeController.js";

export const app = express();

// Enable CORS dynamically for all origins (localhost, Vercel deployments, custom domains)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure Multer for in-memory upload handling with strict 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Routes supporting both full paths and stripped Vercel serverless subpaths
app.get(["/api/health", "/health", "/"], healthHandler);
app.post(["/api/analyze", "/analyze", "/"], upload.single("image"), analyzeHandler);

// Multer error handling middleware
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          error: "FILE_TOO_LARGE",
          message: "Uploaded file exceeds the 5 MB size limit.",
        });
        return;
      }
      res.status(400).json({
        error: "UPLOAD_ERROR",
        message: err.message,
      });
      return;
    }
    next(err);
  }
);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND", message: "Endpoint not found" });
});

export default app;

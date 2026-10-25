import { Request, Response } from "express";
import { analyzeImageWithGemma, checkVisionHealth } from "../services/ollamaService.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function analyzeHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "NO_FILE_UPLOADED",
        message: "No image file provided. Please upload a waste item photo (JPEG, PNG, WebP, or JFIF).",
      });
      return;
    }

    const { mimetype, size, buffer, originalname } = req.file;

    // Supported image formats including JFIF and browser variants
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/pjpeg",
      "image/jfif",
      "application/octet-stream", // Many browsers assign this to .jfif
    ];

    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".jfif"];
    const lowerName = (originalname || "").toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!validMimes.includes(mimetype.toLowerCase()) && !hasValidExt) {
      res.status(400).json({
        error: "INVALID_FILE_TYPE",
        message: `File type '${mimetype}' is not supported. Please upload a JPEG, PNG, WebP, or JFIF image.`,
      });
      return;
    }

    // Validate file size strictly
    if (size > MAX_FILE_SIZE_BYTES) {
      res.status(400).json({
        error: "FILE_TOO_LARGE",
        message: `File size (${(size / 1024 / 1024).toFixed(
          2
        )} MB) exceeds the 5 MB limit. Please resize your photo.`,
      });
      return;
    }

    if (buffer.length === 0) {
      res.status(400).json({
        error: "EMPTY_FILE",
        message: "Uploaded file is empty (0 bytes).",
      });
      return;
    }

    // Extract optional municipality from request body
    const municipality = req.body?.municipality
      ? String(req.body.municipality).trim()
      : undefined;

    // Convert buffer to base64
    const base64Data = buffer.toString("base64");

    // Call vision engine
    const analysisResult = await analyzeImageWithGemma(
      base64Data,
      originalname,
      mimetype,
      municipality
    );

    res.status(200).json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    const err = error as Error;
    const msg = err.message || "Unknown error during waste analysis.";

    // If model is not available or Ollama unreachable
    if (
      msg.includes("not been pulled") ||
      msg.includes("not available in local Ollama") ||
      msg.includes("No vision inference service is available") ||
      msg.includes("unreachable")
    ) {
      const health = await checkVisionHealth();
      res.status(503).json({
        error: "VISION_MODEL_UNAVAILABLE",
        message: msg,
        actionRequired: health.ollama.isOnline
          ? `Run 'ollama pull ${health.ollama.targetModel}' locally, or set GEMINI_API_KEY in Vercel/server environment variables (https://aistudio.google.com/apikey).`
          : "Configure GEMINI_API_KEY in your Vercel Project Settings > Environment Variables. Get a free API key at https://aistudio.google.com/apikey",
        setupUrl: "https://aistudio.google.com/apikey",
        status: health,
      });
      return;
    }

    res.status(500).json({
      error: "ANALYSIS_FAILED",
      message: msg,
    });
  }
}

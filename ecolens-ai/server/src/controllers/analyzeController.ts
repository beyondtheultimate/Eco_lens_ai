import { Request, Response } from "express";
import { analyzeImageWithGemma } from "../services/ollamaService.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function analyzeHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "NO_FILE_UPLOADED",
        message: "No image file provided. Please upload a waste item photo (JPEG, PNG, or WebP).",
      });
      return;
    }

    const { mimetype, size, buffer, originalname } = req.file;

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(mimetype.toLowerCase())) {
      res.status(400).json({
        error: "INVALID_FILE_TYPE",
        message: `File type '${mimetype}' is not supported. Please upload a JPEG, PNG, or WebP image.`,
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

    // Convert buffer to base64 for Ollama
    const base64Data = buffer.toString("base64");

    // Call Gemma 4 vision through Ollama
    const analysisResult = await analyzeImageWithGemma(base64Data, originalname);

    res.status(200).json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    const err = error as Error;
    const msg = err.message || "Unknown error during waste analysis.";

    // Specific status codes based on cause
    if (msg.includes("not available in local Ollama")) {
      res.status(503).json({
        error: "MODEL_NOT_FOUND",
        message: msg,
        actionRequired: "Approve and pull 'gemma4:e2b' model via Ollama.",
      });
      return;
    }

    if (msg.includes("Ollama service is unreachable")) {
      res.status(503).json({
        error: "OLLAMA_UNREACHABLE",
        message: msg,
        actionRequired: "Start Ollama desktop application or run 'ollama serve'.",
      });
      return;
    }

    res.status(500).json({
      error: "ANALYSIS_FAILED",
      message: msg,
    });
  }
}

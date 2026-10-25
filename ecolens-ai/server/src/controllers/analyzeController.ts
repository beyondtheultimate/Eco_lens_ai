import { Request, Response } from "express";
import { analyzeImageWithGemma, checkVisionHealth } from "../services/ollamaService.js";
import { createGlassFallbackResult } from "../services/fallbackService.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function analyzeHandler(req: Request, res: Response): Promise<void> {
  // Extract optional municipality from request body
  const municipality = req.body?.municipality
    ? String(req.body.municipality).trim()
    : undefined;

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

    // Check for explicit AI failure simulation for testing/demo purposes
    if (req.body?.simulateAiFailure === true || req.body?.simulateAiFailure === "true") {
      throw new Error(
        "Gemini Vision API error (HTTP 503): This model is currently experiencing high demand. (Simulated AI Failure for Hackathon Demo)"
      );
    }

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
    const fallbackData = createGlassFallbackResult(msg, municipality);

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
        fallbackData,
      });
      return;
    }

    // Gemini authentication error (400 or 403)
    if (msg.includes("Authentication Failed") || msg.includes("API key")) {
      res.status(401).json({
        error: "GEMINI_AUTH_FAILED",
        message: msg,
        actionRequired:
          "Configure a valid GEMINI_API_KEY in Vercel Project Settings > Environment Variables (https://aistudio.google.com/apikey).",
        setupUrl: "https://aistudio.google.com/apikey",
        fallbackData,
      });
      return;
    }

    // Gemini rate limit or quota exceeded (429)
    if (
      msg.includes("Rate Limit Exceeded") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("429")
    ) {
      res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: msg,
        actionRequired:
          "Gemini free tier per-minute quota reached. Please wait 15-30 seconds before analyzing another image.",
        setupUrl: "https://aistudio.google.com/",
        fallbackData,
      });
      return;
    }

    // Gemini model not found (404)
    if (msg.includes("Model Not Found") || msg.includes("not found for API version v1beta")) {
      res.status(404).json({
        error: "GEMINI_MODEL_NOT_FOUND",
        message: msg,
        actionRequired:
          "Set GEMINI_MODEL in Vercel Environment Variables to a model supported by your key (e.g. gemini-3.8-flash, gemini-2.5-flash, gemini-2.0-flash).",
        setupUrl: "https://aistudio.google.com/apikey",
        fallbackData,
      });
      return;
    }

    // Upstream AI inference timeout (504 Gateway Timeout)
    if (
      msg.includes("MULTIMODAL_INFERENCE_TIMEOUT") ||
      msg.includes("aborted due to timeout") ||
      msg.includes("TimeoutError") ||
      msg.includes("timed out")
    ) {
      res.status(504).json({
        error: "VISION_INFERENCE_TIMEOUT",
        message:
          "Multimodal vision inference timed out while awaiting the AI model response. The upstream vision model took longer than expected to process the image tokens.",
        actionRequired:
          "Please try uploading a smaller or compressed image, or retry in a few moments. High-resolution photos can cause upstream vision queue delays.",
        setupUrl: "https://aistudio.google.com/apikey",
        fallbackData,
      });
      return;
    }

    // Upstream high-demand / capacity error (503 Service Unavailable)
    if (
      msg.includes("503") ||
      msg.includes("high demand") ||
      msg.includes("overloaded") ||
      msg.includes("Service Unavailable")
    ) {
      res.status(503).json({
        error: "AI_SERVICE_HIGH_DEMAND",
        message: msg,
        actionRequired:
          "Google's Gemini vision models are experiencing temporary peak load across regions. The automatic retry and fallback sequence was attempted. Please wait 10-20 seconds and click 'Run Resource & Analyze' again.",
        setupUrl: "https://aistudio.google.com/",
        fallbackData,
      });
      return;
    }

    res.status(500).json({
      error: "ANALYSIS_FAILED",
      message: msg,
      fallbackData,
    });
  }
}

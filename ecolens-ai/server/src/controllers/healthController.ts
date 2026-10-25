import { Request, Response } from "express";
import { checkVisionHealth } from "../services/ollamaService.js";

export async function healthHandler(_req: Request, res: Response): Promise<void> {
  const vision = await checkVisionHealth();

  res.status(200).json({
    status: "healthy",
    service: "EcoLens AI Waste Analysis Backend",
    timestamp: new Date().toISOString(),
    visionEngine: vision,
    // Keep backward-compatible fields
    ollama: vision.ollama,
    message: vision.isReady
      ? `Vision engine ready via ${vision.activeProvider} (${vision.activeModel})`
      : vision.ollama.isOnline
      ? `Ollama online, but '${vision.ollama.targetModel}' is not yet downloaded. Hosted vision not configured.`
      : "No vision model online. Run Ollama locally or configure GEMINI_API_KEY.",
  });
}

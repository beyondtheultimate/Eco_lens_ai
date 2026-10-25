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
    setupUrl: "https://aistudio.google.com/apikey",
    message: vision.isReady
      ? `Vision engine ready via ${vision.activeProvider} (${vision.activeModel})`
      : vision.ollama.isOnline
      ? `Ollama online, but '${vision.ollama.targetModel}' is not yet downloaded. Configure GEMINI_API_KEY for cloud inference (https://aistudio.google.com/apikey).`
      : "No vision model online. Configure GEMINI_API_KEY in Vercel environment variables (https://aistudio.google.com/apikey).",
  });
}

import { Request, Response } from "express";
import { checkOllamaHealth } from "../services/ollamaService.js";

export async function healthHandler(_req: Request, res: Response) {
  try {
    const ollamaStatus = await checkOllamaHealth();

    const healthy = ollamaStatus.isOnline;

    res.status(healthy ? 200 : 503).json({
      status: healthy ? "healthy" : "degraded",
      service: "EcoLens AI Waste Analysis Backend",
      timestamp: new Date().toISOString(),
      ollama: ollamaStatus,
      message: ollamaStatus.modelInstalled
        ? `Ready for image analysis with ${ollamaStatus.targetModel}`
        : ollamaStatus.isOnline
        ? `Ollama online, but '${ollamaStatus.targetModel}' is not yet downloaded.`
        : "Ollama service is unreachable on localhost:11434.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: (error as Error).message,
    });
  }
}

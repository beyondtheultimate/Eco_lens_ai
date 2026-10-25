import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  WasteAnalysisResult,
  HistoryItem,
  OllamaHealthStatus,
  VisionHealthStatus,
} from "../types";
import { optimizeImageForVision } from "../utils/imageOptimizer";
import { createGlassFallbackResult } from "../utils/fallbackReuse";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

interface AnalysisContextType {
  latestResult: WasteAnalysisResult | null;
  imagePreviewUrl: string | null;
  isLoading: boolean;
  errorMsg: string | null;
  actionHelp: string | null;
  health: OllamaHealthStatus | null;
  visionHealth: VisionHealthStatus | null;
  checkingHealth: boolean;
  history: HistoryItem[];
  simulateAiFailure: boolean;
  setSimulateAiFailure: (val: boolean) => void;
  checkHealth: () => Promise<void>;
  runAnalysis: (
    file: File,
    previewUrl: string,
    municipality?: string,
    simulateFailure?: boolean
  ) => Promise<boolean>;
  applyFallbackResult: (reason?: string, municipality?: string) => void;
  clearCurrent: () => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  loadFromHistory: (item: HistoryItem) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latestResult, setLatestResult] = useState<WasteAnalysisResult | null>(() => {
    try {
      const saved = sessionStorage.getItem("ecolens_latest_result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(() => {
    return sessionStorage.getItem("ecolens_latest_preview") || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionHelp, setActionHelp] = useState<string | null>(null);
  const [simulateAiFailure, setSimulateAiFailure] = useState<boolean>(false);

  const [health, setHealth] = useState<OllamaHealthStatus | null>(null);
  const [visionHealth, setVisionHealth] = useState<VisionHealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("ecolens_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (!res.ok) {
        setHealth(null);
        setVisionHealth(null);
        return;
      }
      const data = await res.json();
      if (data.visionEngine) {
        setVisionHealth(data.visionEngine);
        setHealth(data.visionEngine.ollama);
      } else if (data.ollama) {
        setHealth(data.ollama);
      }
    } catch {
      setHealth(null);
      setVisionHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runAnalysis = async (
    file: File,
    previewUrl: string,
    municipality?: string,
    simulateFailure?: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrorMsg(null);
    setActionHelp(null);
    setImagePreviewUrl(previewUrl);
    sessionStorage.setItem("ecolens_latest_preview", previewUrl);

    try {
      // Automatically optimize high-resolution photographs to prevent multi-megabyte payloads
      // and ensure swift serverless vision processing.
      const payloadFile = await optimizeImageForVision(file);

      const formData = new FormData();
      formData.append("image", payloadFile);
      if (municipality && municipality.trim() !== "") {
        formData.append("municipality", municipality.trim());
      }
      if (simulateFailure || simulateAiFailure) {
        formData.append("simulateAiFailure", "true");
      }

      // 55-second client timeout controller (coordinates with 45s backend timeout and 60s Vercel ceiling)
      const abortController = new AbortController();
      const timeoutTimer = setTimeout(() => {
        abortController.abort();
      }, 55000);

      let response: Response;
      try {
        response = await fetch(`${API_BASE}/api/analyze`, {
          method: "POST",
          body: formData,
          signal: abortController.signal,
        });
      } catch (fetchErr) {
        clearTimeout(timeoutTimer);
        const netErr = fetchErr as Error;
        if (netErr.name === "AbortError" || netErr.message?.toLowerCase().includes("aborted")) {
          throw {
            message:
              "Analysis request timed out in the browser after 55 seconds waiting for the AI vision response. Upstream AI processing took longer than expected.",
            actionRequired:
              "Please try uploading a smaller image or retry in a few moments. If deployed on Vercel, verify your GEMINI_API_KEY.",
          };
        }
        throw {
          message: `Network connection to '${API_BASE || "/api/analyze"}' failed: ${netErr.message}. Ensure the backend server is running and reachable.`,
          actionRequired: "Start the EcoLens backend with 'npm run dev' or check your VITE_API_URL environment variable.",
        };
      } finally {
        clearTimeout(timeoutTimer);
      }

      // Safely read response text before attempting JSON parsing
      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();

      if (!rawText || rawText.trim() === "") {
        throw {
          message: `Server returned an empty response (HTTP status ${response.status} ${response.statusText}).`,
          actionRequired: "Check server terminal logs for runtime crashes or memory aborts.",
        };
      }

      // Detect HTML error responses (such as SPA 404 rewrite or reverse proxy gateway errors)
      if (contentType.includes("text/html") || rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
        throw {
          message: `The server returned an HTML webpage instead of JSON (HTTP ${response.status}). The endpoint '/api/analyze' was not found on this host.`,
          actionRequired: "If running on Vercel, configure a remote backend URL via VITE_API_URL. If running locally, ensure the Express server is running on port 5000.",
        };
      }

      // Safely parse JSON
      let json: {
        success?: boolean;
        data?: WasteAnalysisResult;
        error?: string;
        message?: string;
        actionRequired?: string;
        fallbackData?: WasteAnalysisResult;
      };

      try {
        json = JSON.parse(rawText);
      } catch (jsonErr) {
        throw {
          message: `Server returned non-JSON text (HTTP ${response.status}): ${rawText.slice(0, 200)}`,
          actionRequired: "Inspect backend logs to ensure output is valid JSON.",
        };
      }

      if (!response.ok || !json.data) {
        throw {
          message: json.message || json.error || `Analysis failed with HTTP status ${response.status}.`,
          actionRequired: json.actionRequired,
          fallbackData: json.fallbackData,
        };
      }

      const analysisData: WasteAnalysisResult = json.data;
      setLatestResult(analysisData);
      sessionStorage.setItem("ecolens_latest_result", JSON.stringify(analysisData));

      // Append to local history
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        imagePreviewUrl: previewUrl,
        result: analysisData,
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 49)];
      setHistory(updatedHistory);
      localStorage.setItem("ecolens_history", JSON.stringify(updatedHistory));

      return true;
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        actionRequired?: string;
        fallbackData?: WasteAnalysisResult;
      };
      const failureReason = e.message || "Upstream AI vision model temporarily unavailable.";
      setErrorMsg(failureReason);
      if (e.actionRequired) {
        setActionHelp(e.actionRequired);
      }

      // Construct and activate the verified rule-based glass fallback result
      // instead of leaving the user stranded on an error screen
      const fallbackResult: WasteAnalysisResult =
        e.fallbackData || createGlassFallbackResult(failureReason, municipality);

      setLatestResult(fallbackResult);
      sessionStorage.setItem("ecolens_latest_result", JSON.stringify(fallbackResult));

      const fallbackHistoryItem: HistoryItem = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        imagePreviewUrl: previewUrl,
        result: fallbackResult,
      };

      const updatedHistory = [fallbackHistoryItem, ...history.slice(0, 49)];
      setHistory(updatedHistory);
      localStorage.setItem("ecolens_history", JSON.stringify(updatedHistory));

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const applyFallbackResult = (reason?: string, municipality?: string) => {
    const fallbackResult = createGlassFallbackResult(reason, municipality);
    setLatestResult(fallbackResult);
    sessionStorage.setItem("ecolens_latest_result", JSON.stringify(fallbackResult));
  };

  const clearCurrent = () => {
    setLatestResult(null);
    setImagePreviewUrl(null);
    setErrorMsg(null);
    setActionHelp(null);
    sessionStorage.removeItem("ecolens_latest_result");
    sessionStorage.removeItem("ecolens_latest_preview");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ecolens_history");
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("ecolens_history", JSON.stringify(updated));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setLatestResult(item.result);
    setImagePreviewUrl(item.imagePreviewUrl);
    sessionStorage.setItem("ecolens_latest_result", JSON.stringify(item.result));
    sessionStorage.setItem("ecolens_latest_preview", item.imagePreviewUrl);
  };

  return (
    <AnalysisContext.Provider
      value={{
        latestResult,
        imagePreviewUrl,
        isLoading,
        errorMsg,
        actionHelp,
        health,
        visionHealth,
        checkingHealth,
        history,
        simulateAiFailure,
        setSimulateAiFailure,
        checkHealth,
        runAnalysis,
        applyFallbackResult,
        clearCurrent,
        clearHistory,
        deleteHistoryItem,
        loadFromHistory,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};

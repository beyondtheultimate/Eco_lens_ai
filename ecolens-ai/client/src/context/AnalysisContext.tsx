import React, { createContext, useContext, useState, useEffect } from "react";
import type { WasteAnalysisResult, HistoryItem, OllamaHealthStatus } from "../types";

interface AnalysisContextType {
  latestResult: WasteAnalysisResult | null;
  imagePreviewUrl: string | null;
  isLoading: boolean;
  errorMsg: string | null;
  actionHelp: string | null;
  health: OllamaHealthStatus | null;
  checkingHealth: boolean;
  history: HistoryItem[];
  checkHealth: () => Promise<void>;
  runAnalysis: (file: File, previewUrl: string, municipality?: string) => Promise<boolean>;
  clearCurrent: () => void;
  clearHistory: () => void;
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

  const [health, setHealth] = useState<OllamaHealthStatus | null>(null);
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
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.ollama) {
        setHealth(data.ollama);
      }
    } catch {
      setHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runAnalysis = async (file: File, previewUrl: string, municipality?: string): Promise<boolean> => {
    setIsLoading(true);
    setErrorMsg(null);
    setActionHelp(null);
    setImagePreviewUrl(previewUrl);
    sessionStorage.setItem("ecolens_latest_preview", previewUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (municipality) {
        formData.append("municipality", municipality);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw {
          message: json.message || "Failed to analyze waste item.",
          actionRequired: json.actionRequired,
        };
      }

      const analysisData: WasteAnalysisResult = json.data;
      setLatestResult(analysisData);
      sessionStorage.setItem("ecolens_latest_result", JSON.stringify(analysisData));

      // Save metadata to local history (store preview or empty image for local privacy)
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        imagePreviewUrl: previewUrl,
        result: analysisData,
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 11)];
      setHistory(updatedHistory);
      localStorage.setItem("ecolens_history", JSON.stringify(updatedHistory));

      return true;
    } catch (err: unknown) {
      const e = err as { message?: string; actionRequired?: string };
      setErrorMsg(e.message || "An unexpected error occurred during analysis.");
      if (e.actionRequired) {
        setActionHelp(e.actionRequired);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
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
        checkingHealth,
        history,
        checkHealth,
        runAnalysis,
        clearCurrent,
        clearHistory,
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

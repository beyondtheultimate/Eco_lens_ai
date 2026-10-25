import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { UploadDropzone } from "./components/UploadDropzone";
import { AnalysisLoading } from "./components/AnalysisLoading";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { HistoryDrawer } from "./components/HistoryDrawer";
import type { WasteAnalysisResult, HistoryItem, OllamaHealthStatus } from "./types";
import { Leaf, AlertCircle, Sparkles, Shield, Cpu, RefreshCw } from "lucide-react";

export function App() {
  const [health, setHealth] = useState<OllamaHealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionHelp, setActionHelp] = useState<string | null>(null);

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

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setErrorMsg(null);
    setActionHelp(null);
    setResult(null);

    // Trigger analysis immediately
    await runAnalysis(file, objectUrl);
  };

  const runAnalysis = async (file: File, previewUrl: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setActionHelp(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

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
      setResult(analysisData);

      // Save to local history
      const newHistoryItem: HistoryItem = {
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        imagePreviewUrl: previewUrl,
        result: analysisData,
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 8)];
      setHistory(updatedHistory);
      localStorage.setItem("ecolens_history", JSON.stringify(updatedHistory));
    } catch (err: unknown) {
      const e = err as { message?: string; actionRequired?: string };
      setErrorMsg(e.message || "An unexpected error occurred during analysis.");
      if (e.actionRequired) {
        setActionHelp(e.actionRequired);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    setActionHelp(null);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setImagePreviewUrl(item.imagePreviewUrl);
    setResult(item.result);
    setErrorMsg(null);
    setActionHelp(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("ecolens_history");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        health={health}
        checkingHealth={checkingHealth}
        onRefreshHealth={checkHealth}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Model Pending Banner if Ollama is running but model isn't downloaded */}
        {health && !health.modelInstalled && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Cpu className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Gemma 4 Vision Model ({health.targetModel}) Pending Download
                </h4>
                <p className="text-xs text-amber-300/80">
                  Ollama is running, but the <code className="bg-amber-950 px-1 py-0.5 rounded font-mono font-bold text-amber-200">gemma4:e2b</code> model requires your approval to download.
                </p>
              </div>
            </div>
            <button
              onClick={checkHealth}
              className="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Re-check Status
            </button>
          </div>
        )}

        {/* Hero Headline (shown when no result is active) */}
        {!result && !isLoading && (
          <div className="text-center space-y-4 py-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Multi-modal Computer Vision for Circular Waste</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100">
              Optical Waste Intelligence with{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Gemma 4
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Snap or upload any discarded packaging, electronics, or household waste.
              EcoLens AI extracts optical material composition, provides qualitative certainty,
              identifies municipal disposal directives, and suggests 3 practical circular reuse ideas.
            </p>

            {/* Value Props Row */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Zero Cloud Ingestion</h4>
                  <p className="text-[11px] text-slate-400">
                    Runs 100% locally on your machine via Ollama.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Leaf className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">EPA & Knowledge Base</h4>
                  <p className="text-[11px] text-slate-400">
                    Keyword-matched to authoritative circular citations.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Cpu className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Zod-Verified Schemas</h4>
                  <p className="text-[11px] text-slate-400">
                    Guarantees structured JSON without hallucinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload or Active States */}
        {!result && !isLoading && (
          <UploadDropzone
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
            selectedFile={selectedFile}
            onClear={handleReset}
          />
        )}

        {/* Loading State with Radar */}
        {isLoading && imagePreviewUrl && (
          <AnalysisLoading imagePreviewUrl={imagePreviewUrl} />
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <span>Analysis Encountered an Error</span>
            </div>
            <p className="text-xs text-rose-200/90">{errorMsg}</p>
            {actionHelp && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-rose-900/40 text-xs font-mono text-cyan-300">
                👉 Recommended Action: {actionHelp}
              </div>
            )}
            <button
              onClick={handleReset}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800"
            >
              Try Another Image
            </button>
          </div>
        )}

        {/* Results Dashboard */}
        {result && imagePreviewUrl && (
          <ResultsDashboard
            result={result}
            imagePreviewUrl={imagePreviewUrl}
            onReset={handleReset}
          />
        )}

        {/* History Drawer */}
        {!isLoading && (
          <HistoryDrawer
            history={history}
            onSelect={handleHistorySelect}
            onClear={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>
          EcoLens AI • Built for the MLH Hackathon (Best Use of Gemma 4) • Local Ollama
          Inference
        </p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scan,
  AlertCircle,
  MapPin,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Server,
  Cloud,
} from "lucide-react";
import { UploadDropzone } from "../components/UploadDropzone";
import { AnalysisLoading } from "../components/AnalysisLoading";
import { useAnalysis } from "../context/AnalysisContext";

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    runAnalysis,
    isLoading,
    imagePreviewUrl,
    errorMsg,
    actionHelp,
    health,
    visionHealth,
    checkingHealth,
    checkHealth,
    clearCurrent,
  } = useAnalysis();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [municipality, setMunicipality] = useState<string>("");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    const previewUrl = URL.createObjectURL(selectedFile);
    const success = await runAnalysis(selectedFile, previewUrl, municipality);
    if (success) {
      navigate("/results");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    clearCurrent();
  };

  // Determine if vision engine is ready
  const isVisionReady = visionHealth ? visionHealth.isReady : health ? health.modelInstalled : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Scan className="h-4 w-4" />
          <span className="uppercase tracking-wider">AI Waste Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Optical Waste & Material Inspection
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload a photograph of any discarded item or packaging. Our multimodal vision pipeline will extract visible material signatures,
          evaluate contamination risks, and formulate circular upcycling plans.
        </p>
      </div>

      {/* Model Status Diagnostic Banner */}
      {!checkingHealth && !isVisionReady && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-slate-200 space-y-3">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Vision Model Setup Required
                </h4>
                <p className="text-xs text-amber-300/80">
                  No vision inference model is currently active. To perform live image analysis, enable either option:
                </p>
              </div>
            </div>
            <button
              onClick={checkHealth}
              disabled={checkingHealth}
              className="px-3 py-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checkingHealth ? "animate-spin" : ""}`} /> Re-check
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Server className="h-4 w-4" /> Option 1: Local Ollama
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Run in your terminal:{" "}
                <code className="text-amber-300 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded">
                  ollama pull gemma4:e2b
                </code>
              </p>
              <p className="text-[10px] text-slate-500">
                Ollama status: {health?.isOnline ? "Online (11434 reachable)" : "Offline"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Cloud className="h-4 w-4" /> Option 2: Cloud / Vercel Inference
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Set <code className="text-cyan-300 font-mono font-bold bg-slate-900 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in your server/Vercel environment variables.
              </p>
              <p className="text-[10px] text-slate-500">
                Enables hosted Google multimodal vision when localhost is unreachable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Section */}
      {!isLoading ? (
        <div className="space-y-4">
          <UploadDropzone
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
            selectedFile={selectedFile}
            onClear={handleClear}
          />

          {/* Optional Municipality / District Field */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Optional: Specify your City / Municipality:</span>
            </div>
            <input
              type="text"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="e.g. Seattle, WA (Single-Stream)"
              className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* Action Trigger Button */}
          {selectedFile && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Scan className="h-4 w-4" />
                <span>Run Resource & Analyze</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error Message with Help Banner */}
          {errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertCircle className="h-5 w-5 text-rose-400" />
                <span>Analysis Encountered an Issue</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed font-mono whitespace-pre-wrap">{errorMsg}</p>
              {actionHelp && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/40 text-xs text-cyan-300 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Recommended Action:</strong> {actionHelp}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        imagePreviewUrl && <AnalysisLoading imagePreviewUrl={imagePreviewUrl} />
      )}
    </div>
  );
};

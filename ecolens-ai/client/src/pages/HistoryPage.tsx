import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Trash2,
  Download,
  Shield,
  Scan,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";
import type { HistoryItem } from "../types";

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, clearHistory, deleteHistoryItem, loadFromHistory } = useAnalysis();

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSelectItem = (item: HistoryItem) => {
    loadFromHistory(item);
    navigate("/results");
  };

  const handleExportAllHistory = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ecolens-scan-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    setDeleteTargetId(null);
  };

  const handleConfirmClearAll = () => {
    clearHistory();
    setConfirmClearAll(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <History className="h-4 w-4" />
            <span className="uppercase tracking-wider">Audit Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Local Analysis History
          </h1>
          <p className="text-xs text-slate-400">
            {history.length} items recorded in local browser storage.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllHistory}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" /> Export JSON
            </button>
            <button
              onClick={() => setConfirmClearAll(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All History
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      {confirmClearAll && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Are you sure you want to delete all scan history?</h4>
              <p className="text-xs text-rose-300/80">This will remove all {history.length} saved records from your local browser storage.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConfirmClearAll(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClearAll}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/50"
            >
              Yes, Delete All
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Edge Privacy Guarantee:</strong> Your scan history, extracted materials, and classifications are stored exclusively inside your browser's private local storage. No images or logs are transmitted to external servers.
        </p>
      </div>

      {/* History Items or Empty State */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {history.map((item) => {
            const isDeletingThis = deleteTargetId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="relative p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={item.imagePreviewUrl}
                      alt={item.result.itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      {item.result.certainty}
                    </div>

                    {/* Single Item Delete Trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(item.id);
                      }}
                      title="Delete this record"
                      className="absolute top-2 left-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/50">
                      {item.result.primaryCategory}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {item.result.itemName}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {item.result.certaintyReasoning}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <TrendingDown className="h-3 w-3" /> ~{item.result.estimatedCarbonSavedKg.toFixed(2)} kg CO₂
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>

                {/* Inline Single-Item Delete Confirmation Overlay */}
                {isDeletingThis && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 bg-slate-950/95 rounded-2xl p-4 flex flex-col justify-center items-center text-center space-y-3 z-20 border border-rose-900/80 backdrop-blur-sm"
                  >
                    <AlertTriangle className="h-6 w-6 text-rose-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-100">Delete this item?</p>
                      <p className="text-[10px] text-slate-400">This action cannot be undone.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteTargetId(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => handleConfirmDeleteSingle(e, item.id)}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-slate-900/20 border border-dashed border-slate-800">
          <div className="h-12 w-12 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
            <History className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No Past Scans Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Scan waste items using the AI Scanner. Your verified material breakdowns will appear here.
          </p>
          <button
            onClick={() => navigate("/scanner")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
          >
            <Scan className="h-3.5 w-3.5" /> Launch Scanner
          </button>
        </div>
      )}
    </div>
  );
};

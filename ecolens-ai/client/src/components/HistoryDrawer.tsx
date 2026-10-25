import React from "react";
import { History, Trash2, ArrowUpRight } from "lucide-react";
import type { HistoryItem } from "../types";

interface HistoryDrawerProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full rounded-2xl bg-slate-900/40 border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <History className="h-4 w-4 text-cyan-400" />
          <span>Local Analysis History ({history.length})</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="h-3 w-3" /> Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
          >
            <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
              <img
                src={item.imagePreviewUrl}
                alt={item.result.itemName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                {item.result.itemName}
              </h4>
              <p className="text-[10px] text-slate-400">
                {item.result.primaryCategory} • Certainty: {item.result.certainty}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

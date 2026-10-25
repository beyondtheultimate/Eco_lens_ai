import React from "react";
import { Leaf, Cpu, Sparkles, Activity } from "lucide-react";
import type { OllamaHealthStatus } from "../types";

interface NavbarProps {
  health: OllamaHealthStatus | null;
  checkingHealth: boolean;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, checkingHealth, onRefreshHealth }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-900/40">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                EcoLens AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Gemma 4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Circular Economy & Waste Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-400">MLH Hackathon:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Best Use of Gemma 4
            </span>
          </div>

          <button
            onClick={onRefreshHealth}
            title="Click to check Ollama local model connectivity"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-slate-900/60 hover:bg-slate-800/80 border-slate-800"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-slate-300">Model:</span>
            {checkingHealth ? (
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="h-3 w-3 animate-spin" /> Checking...
              </span>
            ) : health?.modelInstalled ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {health.targetModel} Active
              </span>
            ) : health?.isOnline ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Ollama Up (Pull Pending)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Ollama Offline
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

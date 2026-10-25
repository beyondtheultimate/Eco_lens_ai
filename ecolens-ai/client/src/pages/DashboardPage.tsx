import React from "react";
import { Link } from "react-router-dom";
import {
  Scan,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Cpu,
  History,
  Lightbulb,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

export const DashboardPage: React.FC = () => {
  const { health, history, latestResult } = useAnalysis();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Personalized Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-900/40 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Autonomous Circular Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Every Object Deserves a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Second Life.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            See waste differently. Upload any discarded packaging, electronics, or household material
            to receive instant optical composition breakdowns, municipal directives, and practical upcycling plans.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all hover:scale-[1.02]"
            >
              <Scan className="h-4 w-4" />
              <span>Launch AI Waste Scanner</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/materials"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold transition-all"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Browse Material Guide</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Status & Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Model Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">AI Vision Engine</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100">
            {health?.modelInstalled ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemma 4 Ready
              </span>
            ) : health?.isOnline ? (
              <span className="text-amber-400 flex items-center gap-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Ollama Up (Pull Pending)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Ollama Offline
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {health?.modelInstalled
              ? "Running local Gemma 4 weights on edge hardware."
              : "Backend verified; download model to run vision."}
          </p>
        </div>

        {/* Card 2: Scans in History */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Local Scans</span>
            <History className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{history.length}</div>
          <p className="text-[11px] text-slate-400">
            Stored 100% offline in browser storage.
          </p>
        </div>

        {/* Card 3: Estimated Abatement */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">CO₂e Abated</span>
            <TrendingDown className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            ~
            {history
              .reduce((acc, h) => acc + h.result.estimatedCarbonSavedKg, 0)
              .toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Illustrative estimate based on EPA recovery lifecycle.
          </p>
        </div>

        {/* Card 4: Knowledge Base Citations */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Verified Sources</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">10 Categories</div>
          <p className="text-[11px] text-slate-400">
            Directly referenced EPA, GPI, AF&PA datasets.
          </p>
        </div>
      </div>

      {/* Main Content Columns: Latest Analysis vs Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Latest Analysis or Start CTA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Latest Waste Item Analyzed</span>
              </h2>
              {latestResult && (
                <Link
                  to="/results"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  View Full Report <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {latestResult ? (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                      {latestResult.primaryCategory}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      Certainty: {latestResult.certainty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{latestResult.itemName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {latestResult.certaintyReasoning}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/results"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Results
                  </Link>
                  <Link
                    to="/second-life"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Reuse Plan
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
                <div className="h-12 w-12 mx-auto rounded-full bg-emerald-950/50 flex items-center justify-center text-emerald-400">
                  <Scan className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Waste Item Scanned Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Take a photo of any container, beverage cup, or packaging to analyze its circular potential.
                </p>
                <Link
                  to="/scanner"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                >
                  <Scan className="h-3.5 w-3.5" /> Start Your First Scan
                </Link>
              </div>
            )}
          </div>

          {/* Educational Insight Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900/70 via-teal-950/30 to-slate-900/70 border border-teal-900/30 p-6 space-y-3">
            <div className="flex items-center gap-2 text-teal-400">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-100">
                Why Optical Sorting Accuracy Matters
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In single-stream municipal facilities, up to <strong>40% of materials</strong> are diverted to landfills
              due to "wish-cycling"—depositing non-recyclable items with good intentions. Unwashed plastic jars contaminate paper pulp batches,
              and soft grocery bags jam conveyor belts. EcoLens AI helps you prepare materials correctly before disposal.
            </p>
            <div className="pt-1 flex items-center gap-4 text-xs font-medium text-teal-300">
              <Link to="/impact" className="hover:underline flex items-center gap-1">
                Explore Recycling Science <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Exploration CTAs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </h2>

          <Link
            to="/scanner"
            className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 flex items-start gap-3 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Scan className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                AI Waste Scanner
              </h4>
              <p className="text-[11px] text-slate-400">
                Upload photos for optical material breakdown.
              </p>
            </div>
          </Link>

          <Link
            to="/second-life"
            className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 flex items-start gap-3 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                Second Life Studio
              </h4>
              <p className="text-[11px] text-slate-400">
                Turn discarded materials into practical home upcycling projects.
              </p>
            </div>
          </Link>

          <Link
            to="/materials"
            className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 flex items-start gap-3 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-300">
                Material Knowledge Base
              </h4>
              <p className="text-[11px] text-slate-400">
                Official EPA & municipal resin preparation rules.
              </p>
            </div>
          </Link>

          <Link
            to="/history"
            className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-start gap-3 transition-all group"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-slate-100">
                Local Analysis History
              </h4>
              <p className="text-[11px] text-slate-400">
                Review past analyses without cloud storage.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

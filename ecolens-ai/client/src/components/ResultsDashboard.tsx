import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldAlert,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  RotateCcw,
} from "lucide-react";
import type { WasteAnalysisResult } from "../types";

interface ResultsDashboardProps {
  result: WasteAnalysisResult;
  imagePreviewUrl: string;
  onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  imagePreviewUrl,
  onReset,
}) => {
  const certaintyColors = {
    high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    low: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Model: <span className="text-emerald-400 font-bold">{result.modelUsed}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">
            {new Date(result.analyzedAt).toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5 text-cyan-400" /> Analyze Another Item
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-900/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Item Image with Verified Badge */}
          <div className="relative w-full aspect-square max-w-[200px] mx-auto md:mx-0 rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg bg-slate-950">
            <img
              src={imagePreviewUrl}
              alt={result.itemName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
              Verified
            </div>
          </div>

          {/* Core Identification */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {result.primaryCategory}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                  certaintyColors[result.certainty]
                }`}
              >
                Certainty: {result.certainty}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {result.itemName}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-slate-200">Vision Rationale:</strong>{" "}
              {result.certaintyReasoning}
            </p>

            {/* Environmental Abatement Stat */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <TrendingDown className="h-4 w-4 text-emerald-400" />
                ~{result.estimatedCarbonSavedKg.toFixed(2)} kg CO₂e Abated if Recycled
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Visual Evidence & Material Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Clues / Evidence Observed */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="h-5 w-5" />
            <h3 className="font-bold text-slate-100 text-base">Observed Visual Evidence</h3>
          </div>
          <p className="text-xs text-slate-400">
            Optical features extracted by Gemma 4 from the uploaded photograph:
          </p>
          <ul className="space-y-2.5">
            {result.visibleEvidence.map((evidence, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{evidence}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Material Composition Breakdown */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Layers className="h-5 w-5" />
              <h3 className="font-bold text-slate-100 text-base">Material Composition</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/50">
              {result.recyclingCategory}
            </span>
          </div>

          <div className="space-y-3">
            {result.materials.map((mat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">
                    {mat.material} {mat.notes ? `(${mat.notes})` : ""}
                  </span>
                  <span className="font-mono text-slate-400 font-bold">{mat.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      mat.recyclable
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-slate-600 to-slate-500"
                    }`}
                    style={{ width: `${mat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Green bars designate recyclable components in standard municipal streams.</span>
          </div>
        </div>
      </div>

      {/* Disposal Directive & Contamination Warning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">
              Recommended Municipal Disposal Steps
            </h3>
          </div>
          <div className="space-y-2.5">
            {result.disposalInstructions.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  {idx + 1}
                </div>
                <span className="pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contamination Hazards & Disclaimers */}
        <div className="rounded-2xl bg-amber-950/20 border border-amber-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-amber-200 text-base">Contamination Risk</h3>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">{result.contaminationRisk}</p>

          <div className="pt-2 border-t border-amber-900/30 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Uncertainty Disclaimers:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {result.uncertaintyWarnings.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Exactly 3 Practical Reuse & Upcycling Ideas */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-teal-950/20 border border-teal-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-400">
          <Lightbulb className="h-5 w-5 text-teal-300" />
          <h3 className="font-bold text-slate-100 text-base">
            Three Practical Upcycling & Circular Reuse Ideas
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.reuseSuggestions.map((idea, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-teal-800/30 flex flex-col justify-between hover:border-teal-500/50 transition-all group"
            >
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/50">
                  Idea #{idx + 1}
                </span>
                <p className="mt-2.5 text-xs text-slate-200 leading-relaxed font-medium">
                  {idea}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Circular Impact</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Source Citations */}
      {result.citations && result.citations.length > 0 && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-3">
          <h3 className="font-bold text-slate-300 text-sm flex items-center gap-2">
            <span>Authoritative Source Citations (Curated Knowledge Base)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.citations.map((cite, idx) => (
              <a
                key={idx}
                href={cite.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                    <span>{cite.source}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 text-xs text-slate-300 font-medium">{cite.title}</p>
                  <p className="mt-1 text-[11px] text-slate-400 italic">
                    "{cite.guidelineSnippet}"
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Scan,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  ExternalLink,
  BookOpen,
  Share2,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { latestResult, imagePreviewUrl, clearCurrent } = useAnalysis();
  const [copied, setCopied] = useState(false);

  if (!latestResult) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 animate-in fade-in duration-300">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Layers className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">No Active Analysis Results</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You haven't scanned a waste item in this session yet. Launch the AI Waste Scanner to inspect an object.
        </p>
        <div className="pt-2">
          <Link
            to="/scanner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Scan className="h-4 w-4" /> Go to Scanner
          </Link>
        </div>
      </div>
    );
  }

  const certaintyColors = {
    high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    low: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  const recyclablePercent = latestResult.materials
    .filter((m) => m.recyclable)
    .reduce((acc, curr) => acc + curr.percentage, 0);

  const handleCopySummary = async () => {
    const text = `EcoLens AI Waste Audit
Item: ${latestResult.itemName}
Category: ${latestResult.primaryCategory}
Certainty: ${latestResult.certainty}
Recyclability: ${latestResult.recyclingCategory} (${recyclablePercent}% recyclable)
Estimated CO2e Abated: ${latestResult.estimatedCarbonSavedKg} kg
Disposal Steps:
${latestResult.disposalInstructions.map((s, i) => `${i + 1}. ${s}`).join("\n")}
Reuse Suggestions:
${latestResult.reuseSuggestions.map((s, i) => `- Idea ${i + 1}: ${s}`).join("\n")}
Source: EcoLens AI Curated Knowledge Base (${latestResult.citations.map((c) => c.source).join(", ")})
`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(latestResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ecolens-${latestResult.itemName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-audit.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAnalyzeAnother = () => {
    clearCurrent();
    navigate("/scanner");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Fallback Notice Banner */}
      {latestResult.isFallback && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border border-amber-600/50 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-200">
                  Fallback Reuse Suggestions — AI analysis unavailable
                </h3>
                <p className="text-xs text-amber-300/80">
                  {latestResult.fallbackReason || "Upstream AI vision model temporarily unavailable."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeAnother}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all shrink-0 hover:scale-[1.02]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Try AI analysis again</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-900/40 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-amber-300">
              Deterministic Safety & Circular Repurposing Protocol Active:
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To maintain scientific integrity, AI confidence scores, material percentages, and lifecycle CO₂e abatement are withheld without active vision model inference. Verified handling and upcycling guidelines are provided below.
            </p>
          </div>
        </div>
      )}

      {/* Prominent Safety Warning Banner for Glass Hazard */}
      {latestResult.safetyWarning && (
        <div className="p-5 rounded-2xl bg-rose-950/50 border-2 border-rose-600/70 shadow-lg space-y-2">
          <div className="flex items-center gap-2.5 text-rose-300 font-black text-sm uppercase tracking-wider">
            <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
            <span>Critical Safety Warning</span>
          </div>
          <p className="text-sm text-rose-100 font-bold leading-relaxed">
            {latestResult.safetyWarning}
          </p>
          {latestResult.suitabilityNotes && (
            <div className="pt-2 border-t border-rose-900/40 text-xs text-rose-200/90 leading-relaxed">
              <strong>Repurposing Suitability:</strong> {latestResult.suitabilityNotes}
            </div>
          )}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Model: <span className="text-emerald-400 font-bold">{latestResult.modelUsed}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">
            {new Date(latestResult.analyzedAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{copied ? "Copied" : "Copy Text Summary"}</span>
          </button>

          <button
            onClick={handleExportJson}
            title="Download JSON audit report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" /> Export JSON
          </button>

          <button
            onClick={handleAnalyzeAnother}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Scan Another Item
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-900/40 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Photo Preview */}
          {imagePreviewUrl ? (
            <div className="relative w-full aspect-square max-w-[200px] mx-auto md:mx-0 rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg bg-slate-950">
              <img
                src={imagePreviewUrl}
                alt={latestResult.itemName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                Optical Frame
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square max-w-[200px] mx-auto md:mx-0 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-600">
              <Layers className="h-10 w-10" />
            </div>
          )}

            {/* Core Identification */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {latestResult.primaryCategory}
                </span>
                {latestResult.isFallback ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Unverified (Rule-Based Fallback)
                  </span>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
                      certaintyColors[latestResult.certainty]
                    }`}
                  >
                    Qualitative Certainty: {latestResult.certainty}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                {latestResult.itemName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-slate-200">
                  {latestResult.isFallback ? "Handling Protocol:" : "Vision Rationale:"}
                </strong>{" "}
                {latestResult.certaintyReasoning}
              </p>

              {/* Environmental Abatement Stat & Circularity Index */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {latestResult.isFallback ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold">
                    <TrendingDown className="h-4 w-4 text-slate-400" />
                    CO₂e Abatement: Uncalculated (Requires AI verification)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                    ~{latestResult.estimatedCarbonSavedKg.toFixed(2)} kg CO₂e Abated if Recycled
                  </div>
                )}

                {latestResult.isFallback ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Share2 className="h-4 w-4 text-amber-400" />
                    Stream: Special Handling / Broken Glass
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <Share2 className="h-4 w-4 text-cyan-400" />
                    Circularity Index: {recyclablePercent}% Recyclable
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Grid: Visual Evidence & Material Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Evidence Observed */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="h-5 w-5" />
            <h3 className="font-bold text-slate-100 text-base">Observed Visual Evidence</h3>
          </div>
          <p className="text-xs text-slate-400">
            Optical features extracted by Gemma 4 from the uploaded photograph:
          </p>
          <ul className="space-y-2.5">
            {latestResult.visibleEvidence.map((evidence, idx) => (
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
              {latestResult.recyclingCategory}
            </span>
          </div>

          {latestResult.isFallback ? (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                <Info className="h-4 w-4 shrink-0" />
                <span>Material Percentages Unmeasured (AI Analysis Unavailable)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In accordance with our strict data-integrity policy, exact material percentages and multi-layer polymer compositions are not fabricated when the AI vision service is offline. Treat this item as 100% fragmented glass requiring rigid protective handling.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestResult.materials.map((mat, idx) => (
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
          )}

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>
              {latestResult.isFallback
                ? "Disposal guidelines and recycling eligibility determined by verified municipal glass rules."
                : "Green bars designate recyclable components in standard municipal streams."}
            </span>
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
            {latestResult.disposalInstructions.map((step, idx) => (
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
          <p className="text-xs text-amber-200/90 leading-relaxed">{latestResult.contaminationRisk}</p>

          <div className="pt-2 border-t border-amber-900/30 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Uncertainty Warnings:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {latestResult.uncertaintyWarnings.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Practical Reuse Suggestions Preview Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-teal-950/20 border border-teal-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400">
            <Sparkles className="h-5 w-5 text-teal-300" />
            <h3 className="font-bold text-slate-100 text-base">
              Practical Second Life Upcycling Ideas
            </h3>
          </div>
          <Link
            to="/second-life"
            className="text-xs text-teal-300 hover:text-teal-200 font-semibold flex items-center gap-1"
          >
            Explore Workshop Plans <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {latestResult.reuseSuggestions.map((idea, idx) => (
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
              <Link
                to="/second-life"
                className="mt-4 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-teal-400 font-semibold group-hover:translate-x-1 transition-transform"
              >
                <span>View Full Instructions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Source Citations */}
      {latestResult.citations && latestResult.citations.length > 0 && (
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-300 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>Authoritative Source Citations (Curated Knowledge Base)</span>
            </h3>
            <span className="text-[11px] text-slate-500">Deterministic Keyword Match</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {latestResult.citations.map((cite, idx) => (
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
                <div className="mt-2 pt-2 border-t border-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{cite.applicableRegion || "North America"}</span>
                  <span>{cite.verifiedDate || "2024 Verified"}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

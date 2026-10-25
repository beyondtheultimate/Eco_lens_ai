import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Scan,
  Compass,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

export const ReusePage: React.FC = () => {
  const { latestResult } = useAnalysis();

  // Fallback / Featured Community Upcycling Projects for the empty state
  const featuredStudioProjects = [
    {
      title: "Sub-Irrigated Self-Watering Planter",
      category: "Plastics (PET #1)",
      difficulty: "Easy",
      timeEstimate: "15 mins",
      materials: ["Clean 1L-2L plastic bottle", "Cotton wick or twine", "Potting soil", "Kitchen scissors"],
      steps: [
        "Slice the plastic bottle horizontally about 4 inches below the bottle cap neck.",
        "Puncture a small 4mm hole through the cap center and thread a 6-inch cotton twine wick through it.",
        "Invert the funnel-shaped top half and place it upside down inside the bottom cylindrical reservoir base.",
        "Fill the top section with soil, sow your kitchen herbs, and pour water into the bottom reservoir."
      ],
      safetyNotes: "Take care when using scissors on curved plastic edges; lightly tape sharp rims."
    },
    {
      title: "Infinite Reflector Indoor Plant Collar",
      category: "Metals (Aluminum)",
      difficulty: "Easy",
      timeEstimate: "10 mins",
      materials: ["Clean soda can", "Utility shears", "Adhesive tape"],
      steps: [
        "Carefully snip off the top beverage lip and bottom rim using heavy-duty kitchen shears.",
        "Cut along the vertical seam line to unroll a flat, flexible aluminum metal sheet.",
        "Fold the sheet with the reflective unprinted side facing inwards toward your indoor plant stems to bounce ambient sunlight."
      ],
      safetyNotes: "Freshly cut aluminum sheet edges are razor sharp. Wear gardening gloves and bind exposed edges with duct tape."
    },
    {
      title: "Corrugated Sheet-Mulch Weed Barrier",
      category: "Paper & Cardboard",
      difficulty: "Easy",
      timeEstimate: "20 mins",
      materials: ["Unprinted corrugated shipping boxes", "Garden hose", "Wood mulch or topsoil"],
      steps: [
        "Peel off all synthetic plastic packing tapes and shipping labels from the box surfaces.",
        "Flatten boxes completely and lay them overlapping by 6 inches over weeds or lawn areas.",
        "Thoroughly soak the cardboard with water to accelerate microbial breakdown.",
        "Cover the wet cardboard layer with 3 inches of organic bark mulch or compost for rich, weed-free garden beds."
      ],
      safetyNotes: "Ensure all tape adhesives are removed to keep microplastics out of soil microbiomes."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/40 border border-teal-900/40 p-6 sm:p-10 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Second Life Studio</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Circular Upcycling & Repurposing Workshop
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The highest circular value is extending a product's physical lifespan before recycling.
            Explore practical workshop guides, step-by-step instructions, and safety precautions.
          </p>
        </div>
      </div>

      {/* Case 1: Result-Driven Studio from genuine scan or verified fallback */}
      {latestResult ? (
        <div className="space-y-6">
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

                <Link
                  to="/scanner"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all shrink-0 hover:scale-[1.02]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try AI analysis again</span>
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-900/40 text-xs text-slate-300">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Showing verified offline repurposing plans. No AI confidence scores or speculative material breakdowns were generated.
                </p>
              </div>
            </div>
          )}

          {/* Prominent Safety Warning Banner */}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>
                  {latestResult.isFallback ? "Verified Upcycling Guidelines for:" : "Tailored Upcycling Plans for:"}
                </span>
                <span className="text-teal-400">{latestResult.itemName}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Category: {latestResult.primaryCategory} • Protocol: {latestResult.modelUsed}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/results"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium"
              >
                View Full Audit
              </Link>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                <Scan className="h-3.5 w-3.5" /> Analyze Another Item
              </Link>
            </div>
          </div>

          {/* Cards for each idea: Detailed Plans if present, otherwise basic suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestResult.detailedReusePlans && latestResult.detailedReusePlans.length > 0 ? (
              latestResult.detailedReusePlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-teal-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        Idea #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                        {plan.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{plan.title}</h3>

                    {plan.requiredMaterials.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Required Equipment:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {plan.requiredMaterials.map((mat, mIdx) => (
                            <li key={mIdx} className="flex items-center gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-teal-400"></span>
                              <span>{mat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.steps.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Step-by-Step Instructions:
                        </span>
                        <ol className="space-y-1.5 text-xs text-slate-300">
                          {plan.steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2">
                              <span className="text-[10px] font-bold text-teal-400 mt-0.5">{sIdx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {plan.safetyNotes && (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300/90 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{plan.safetyNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Safe Repurposing Stream
                    </span>
                  </div>
                </div>
              ))
            ) : (
              latestResult.reuseSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-teal-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        Idea #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                        Circular Reuse
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{suggestion}</h3>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-teal-400 font-semibold text-[11px]">
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Recommended Tooling:</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Cut-resistant gloves, safety goggles, or rigid container depending on glass application.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Safe Circular Life
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Case 2: Useful Empty State with Featured Community Upcycling Projects */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-teal-400 shrink-0" />
              <p className="text-xs text-slate-300">
                <strong>No active scan loaded:</strong> Showing curated packaging upcycling guides. Run the AI Waste Scanner to generate item-specific circular suggestions.
              </p>
            </div>
            <Link
              to="/scanner"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shrink-0 transition-all"
            >
              Scan Your Object
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">
              Featured Circular Packaging Workshops
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStudioProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-cyan-300">{project.category}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                        {project.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{project.title}</h3>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Required Materials:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {project.materials.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Workshop Steps:
                      </span>
                      <ol className="space-y-1.5 text-xs text-slate-300">
                        {project.steps.map((s, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-teal-400 mt-0.5">{sIdx + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300/90 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{project.safetyNotes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

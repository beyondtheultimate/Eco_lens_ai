import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Scan,
  Compass,
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

      {/* Case 1: Result-Driven Studio from genuine scan */}
      {latestResult ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Tailored Upcycling Plans for:</span>
                <span className="text-teal-400">{latestResult.itemName}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Category: {latestResult.primaryCategory} • Material: {latestResult.materials.map(m => m.material).join(", ")}
              </p>
            </div>

            <Link
              to="/scanner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium"
            >
              <Scan className="h-3.5 w-3.5 text-teal-400" /> Analyze Another Item
            </Link>
          </div>

          {/* Cards for each idea */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestResult.reuseSuggestions.map((suggestion, idx) => (
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
                      Scissors, utility knife, organic soil, or non-toxic twine depending on household application.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Diverts from Landfill
                  </span>
                </div>
              </div>
            ))}
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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Calculator,
  Info,
  TrendingDown,
  Layers,
  Scan,
  Sparkles,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

export const ImpactPage: React.FC = () => {
  const { history } = useAnalysis();

  // 1. Derive real metrics from saved analyses in history
  const totalScans = history.length;
  const realTotalCo2 = history
    .reduce((acc, item) => acc + (item.result.estimatedCarbonSavedKg || 0), 0)
    .toFixed(2);

  // Group materials by category from real analyses
  const categoryCounts: Record<string, number> = {};
  history.forEach((item) => {
    const cat = item.result.primaryCategory || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort(
    ([, a], [, b]) => b - a
  );

  // 2. Interactive Illustrative What-If Calculator (Methodology Transparency)
  const [aluminumCans, setAluminumCans] = useState<number>(10);
  const [plasticBottles, setPlasticBottles] = useState<number>(15);
  const [cardboardBoxes, setCardboardBoxes] = useState<number>(5);

  // EPA WARM model baseline factors (illustrative estimates)
  // Aluminum: ~0.35 kg CO2e / can
  // PET Bottle: ~0.12 kg CO2e / bottle
  // Cardboard: ~0.28 kg CO2e / box
  const totalCo2Estimate = (
    aluminumCans * 0.35 +
    plasticBottles * 0.12 +
    cardboardBoxes * 0.28
  ).toFixed(2);

  const kwhEquivalent = (Number(totalCo2Estimate) * 1.25).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
          <Compass className="h-4 w-4" />
          <span className="uppercase tracking-wider">Circularity Science & Abatement Accounting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Impact Modeling & Waste Reduction Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Scientific lifecycle carbon avoidance derived from your real saved waste analyses,
          combined with transparent EPA WARM model assumptions.
        </p>
      </div>

      {/* REAL USER IMPACT METRICS */}
      <div className="rounded-2xl bg-slate-900/60 border border-emerald-900/50 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
              <span>Your Cumulative Environmental Abatement</span>
            </h2>
            <p className="text-xs text-slate-400">
              Calculated exclusively from your {totalScans} verified local audit records.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-950 border border-emerald-800/40 w-fit">
            Real Saved Data
          </span>
        </div>

        {totalScans > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-emerald-400">~{realTotalCo2} kg</div>
                <div className="text-xs text-slate-400 mt-1">Total CO₂e Diverted</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across {totalScans} analyzed objects</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-cyan-400">
                  ~{(Number(realTotalCo2) * 1.25).toFixed(1)} kWh
                </div>
                <div className="text-xs text-slate-400 mt-1">Virgin Smelting Offset</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Based on grid displacement factor</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-3xl font-black text-teal-400">
                  {totalScans > 0 ? (Number(realTotalCo2) / totalScans).toFixed(2) : "0.00"} kg
                </div>
                <div className="text-xs text-slate-400 mt-1">Avg CO₂e Saved per Item</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Properly prepped & diverted</div>
              </div>
            </div>

            {/* Breakdown by Category from Real Scans */}
            {sortedCategories.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <span>Diverted Material Categories From Your Scans:</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {sortedCategories.map(([category, count]) => (
                    <div
                      key={category}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs"
                    >
                      <span className="text-slate-300 font-medium">{category}</span>
                      <span className="font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-slate-950">
                        {count} item{count > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No saved analysis records found in this browser. Once you scan waste items, your real cumulative carbon savings and diverted material categories will calculate here.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              <Scan className="h-3.5 w-3.5" /> Scan Your First Item
            </Link>
          </div>
        )}

        <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-2 border-t border-slate-800">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Transparent Calculation Assumptions:</strong> Carbon abatement metrics reflect EPA WARM (Waste Reduction Model v16) lifecycle comparisons between virgin raw material production versus closed-loop secondary reprocessing.
          </p>
        </div>
      </div>

      {/* The 5 Rs Circular Framework */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-400" />
          <span>The 5 Rs of Waste Reduction Hierarchy</span>
        </h2>
        <p className="text-xs text-slate-400">
          Recycling is the 5th defense line. Before an item enters the recycling bin, consider higher circular intervention points:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {[
            {
              r: "1. Refuse",
              desc: "Decline single-use plastics, promotional swag, and unnecessary disposable utensils.",
            },
            {
              r: "2. Reduce",
              desc: "Purchase items with minimal packaging or concentrated refills to lower gross throughput.",
            },
            {
              r: "3. Reuse",
              desc: "Upcycle glass jars, shipping cartons, and bottles (as highlighted in our Second Life Studio).",
            },
            {
              r: "4. Rot",
              desc: "Compost food scraps, coffee grounds, and cellulose paper to prevent anaerobic methane in landfills.",
            },
            {
              r: "5. Recycle",
              desc: "Clean, dry, and sort remaining rigid containers strictly according to municipal rules.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
            >
              <h3 className="text-xs font-bold text-emerald-400">{item.r}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Illustrative Material Abatement Calculator */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-900/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-400" />
              <span>Interactive What-If Material Calculator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate weekly household diversion potential across common packaging types.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800/40 w-fit">
            Simulated Forecast
          </span>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Aluminum Cans:</span>
              <span className="font-mono text-emerald-400 font-bold">{aluminumCans}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={aluminumCans}
              onChange={(e) => setAluminumCans(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Plastic Bottles (PET #1):</span>
              <span className="font-mono text-cyan-400 font-bold">{plasticBottles}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={plasticBottles}
              onChange={(e) => setPlasticBottles(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Cardboard Boxes:</span>
              <span className="font-mono text-teal-400 font-bold">{cardboardBoxes}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={cardboardBoxes}
              onChange={(e) => setCardboardBoxes(Number(e.target.value))}
              className="w-full accent-teal-500 bg-slate-800"
            />
          </div>
        </div>

        {/* Result Metrics */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-emerald-400">~{totalCo2Estimate} kg</div>
            <div className="text-xs text-slate-400">Estimated CO₂e Abated</div>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-400">~{kwhEquivalent} kWh</div>
            <div className="text-xs text-slate-400">Offset Smelting Energy</div>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-400">100%</div>
            <div className="text-xs text-slate-400">Direct Landfill Diversion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

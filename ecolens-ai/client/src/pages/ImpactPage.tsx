import React, { useState } from "react";
import {
  Compass,
  Calculator,
  Info,
} from "lucide-react";

export const ImpactPage: React.FC = () => {
  // Interactive Illustrative Calculator
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

  // 1 kWh equivalent per 0.8 kg CO2
  const kwhEquivalent = (Number(totalCo2Estimate) * 1.25).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
          <Compass className="h-4 w-4" />
          <span className="uppercase tracking-wider">Circularity Science & Education</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Impact Modeling & Waste Reduction Education
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Understanding the physics, metallurgy, and polymer science behind circular materials.
          Explore the 5 Rs of waste hierarchy and test illustrative recovery equations.
        </p>
      </div>

      {/* The 5 Rs Circular Framework */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-100">
          The 5 Rs of Waste Reduction Hierarchy
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
              <span>Illustrative Household Abatement Calculator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive estimates based on EPA WARM (Waste Reduction Model) lifecycle factors.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800/40 w-fit">
            Illustrative Model Only
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
            <div className="text-xs text-slate-400">Smelting & Virgin Energy Offset</div>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-400">100%</div>
            <div className="text-xs text-slate-400">Direct Landfill Diversion</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-1">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong>Methodology Transparency:</strong> These figures are illustrative models derived from EPA WARM lifecycle assessments.
            Actual municipal energy savings vary based on grid fuel mixes and transportation distance to local processing mills.
          </p>
        </div>
      </div>
    </div>
  );
};

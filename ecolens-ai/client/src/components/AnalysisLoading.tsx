import React, { useEffect, useState } from "react";
import { Cpu, Search, CheckCircle2, ShieldCheck } from "lucide-react";

interface AnalysisLoadingProps {
  imagePreviewUrl: string;
}

const STAGES = [
  { text: "Ingesting 2D optical frame and verifying payload...", icon: Search },
  { text: "Executing Gemma 4 multimodal vision tokenization...", icon: Cpu },
  { text: "Querying EPA & Municipal Material Knowledge Base...", icon: CheckCircle2 },
  { text: "Enforcing Zod schema verification & uncertainty bounds...", icon: ShieldCheck },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ imagePreviewUrl }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6">
      {/* Image Preview with Radar Scanning Line */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/60 bg-slate-900">
        <img
          src={imagePreviewUrl}
          alt="Scanning waste item"
          className="w-full h-full object-cover filter brightness-90"
        />

        {/* Dynamic Holographic Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>

        {/* Animated Radar Scanning Line */}
        <div className="animate-radar"></div>

        {/* Corner HUD Markers */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

        {/* Center Tag */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 backdrop-blur-md">
          Optical Feature Extractor
        </div>
      </div>

      {/* Progress Telemetry */}
      <div className="mt-8 max-w-md w-full px-4">
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? "bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20 text-slate-100"
                    : isCompleted
                    ? "bg-slate-950/60 border-emerald-900/30 text-emerald-400"
                    : "bg-slate-950/30 border-slate-900/50 text-slate-600"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-cyan-500/20 text-cyan-300 animate-pulse"
                      : isCompleted
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-900 text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium leading-relaxed">{stage.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

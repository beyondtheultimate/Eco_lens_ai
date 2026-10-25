import React from "react";
import {
  Info,
  Cpu,
  AlertTriangle,
  ExternalLink,
  Code2,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Info className="h-4 w-4" />
          <span className="uppercase tracking-wider">Project Documentation & Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          About EcoLens AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Engineered for the <strong>MLH Hackathon Challenge: Best Use of Gemma 4</strong>.
        </p>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>The Problem: The Contamination Crisis</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Over <strong>40% of residential recycling streams</strong> fail to be reprocessed due to contamination.
            Well-intentioned consumers engage in "wish-cycling"—tossing unwashed jars, soft plastic bags, or multi-laminate cartons into bins without knowing their true material profile.
            This contaminates high-value paper pulps and damages sorting facility optical lasers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>The Solution: Edge Optical Intelligence</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            EcoLens AI provides instant, 100% private optical waste inspection powered by Google's multimodal
            <strong> Gemma 4</strong> model running locally on Ollama. It evaluates physical seams, sheen, and closures,
            cross-references deterministic municipal datasets, and generates 3 practical upcycling ideas to divert items before disposal.
          </p>
        </div>
      </div>

      {/* How It Works Architecture Pipeline */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-100">
          Technical Pipeline & Data Flow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Step 1</span>
            <h3 className="text-xs font-bold text-slate-200">2D Optical Ingestion</h3>
            <p className="text-[11px] text-slate-400">
              Browser validates MIME type and enforces strict 5 MB file size boundary.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Step 2</span>
            <h3 className="text-xs font-bold text-slate-200">Gemma 4 Multimodal</h3>
            <p className="text-[11px] text-slate-400">
              Express backend streams base64 image tensor directly into Ollama's local <code className="text-emerald-300">/api/chat</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">Step 3</span>
            <h3 className="text-xs font-bold text-slate-200">Knowledge Retrieval</h3>
            <p className="text-[11px] text-slate-400">
              Deterministic keyword matcher queries EPA, GPI, and AF&PA circular recycling datasets.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Step 4</span>
            <h3 className="text-xs font-bold text-slate-200">Zod Verification</h3>
            <p className="text-[11px] text-slate-400">
              Payload is strictly validated against <code className="text-amber-300">WasteAnalysisResultSchema</code> to eliminate hallucinations.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Gemma 4 Status & Retrieval Disclosure */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <span>Real Gemma 4 Status & Retrieval Transparency</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Actual Model Integration:</strong> EcoLens AI is hard-wired to communicate directly with local Ollama at <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-cyan-300">http://localhost:11434</code> targeting <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-emerald-300">gemma4:e2b</code>. When the weights are not downloaded, the system transparently reports an offline status rather than substituting cloud models or generating fake successful results.
          </p>

          <p>
            <strong>Retrieval Architecture:</strong> Our knowledge base utilizes <em>deterministic keyword matching</em> across verified EPA, GPI, AF&PA, and Call2Recycle guidelines. We do not make false claims of semantic vector search or embedding RAG.
          </p>
        </div>
      </div>

      {/* Known Limitations & Roadmap */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span>Known Limitations & Future Roadmap</span>
        </h2>

        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
            <span><strong>2D Optical Limits:</strong> A single-angle 2D photo cannot detect chemical barrier coatings inside cartons or distinguish food-grade PET from industrial PET. <em>Roadmap: Multi-frame spatial video scanning.</em></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
            <span><strong>Municipal Discrepancies:</strong> Sorting rules vary between neighboring county lines. <em>Roadmap: Automatic geolocation-based municipal MRF dataset routing.</em></span>
          </li>
        </ul>
      </div>

      {/* GitHub Repository Link */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Code2 className="h-4 w-4 text-emerald-400" />
          <span>Open Source on GitHub: <strong>beyondtheultimate/Eco_lens_ai</strong></span>
        </div>
        <a
          href="https://github.com/beyondtheultimate/Eco_lens_ai"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
        >
          <span>View Repo</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

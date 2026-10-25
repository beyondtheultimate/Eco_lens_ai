import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-in fade-in duration-300">
      <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
        <Compass className="h-8 w-8 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-black text-slate-100">404 — Page Not Found</h1>
      <p className="text-xs text-slate-400">
        The route you navigated to does not exist in the EcoLens AI platform.
      </p>
      <div className="pt-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

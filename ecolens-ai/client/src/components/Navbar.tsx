import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Leaf,
  Scan,
  Compass,
  Sparkles,
  BarChart3,
  BookOpen,
  History,
  Info,
  Menu,
  X,
  Cpu,
  Activity,
  Layers,
} from "lucide-react";
import { useAnalysis } from "../context/AnalysisContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { health, checkingHealth, checkHealth } = useAnalysis();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/scanner", label: "Scanner", icon: Scan },
    { to: "/results", label: "Results", icon: Layers },
    { to: "/reuse", label: "Second Life", icon: Sparkles },
    { to: "/materials", label: "Materials", icon: BookOpen },
    { to: "/impact", label: "Impact", icon: Compass },
    { to: "/history", label: "History", icon: History },
    { to: "/about", label: "About", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/60 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                EcoLens AI
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Gemma 4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              See Waste Differently. Reimagine Its Future.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Status Pill & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Model Status Pill */}
          <button
            onClick={checkHealth}
            title="Click to check Ollama local model connectivity"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-slate-900/80 hover:bg-slate-800/90 border-slate-800"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline text-slate-400">Gemma:</span>
            {checkingHealth ? (
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Activity className="h-3 w-3 animate-spin text-cyan-400" /> Checking...
              </span>
            ) : health?.modelInstalled ? (
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {health.targetModel}
              </span>
            ) : health?.isOnline ? (
              <span className="flex items-center gap-1.5 text-amber-400 text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Pull Pending
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Offline
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-emerald-950/80 bg-slate-950/98 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-900/80"
                  }`
                }
              >
                <Icon className="h-4 w-4 text-emerald-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { ScannerPage } from "./pages/ScannerPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ReusePage } from "./pages/ReusePage";
import { MaterialGuidePage } from "./pages/MaterialGuidePage";
import { ImpactPage } from "./pages/ImpactPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/second-life" element={<ReusePage />} />
              {/* Backward compatibility redirect for /reuse */}
              <Route path="/reuse" element={<Navigate to="/second-life" replace />} />
              <Route path="/materials" element={<MaterialGuidePage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950/80">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                EcoLens AI • Built for the MLH Hackathon: Best Use of Gemma 4
              </p>
              <p className="text-[11px] text-slate-600">
                100% Edge Processing • Zero Cloud Photo Storage
              </p>
            </div>
          </footer>
        </div>
      </AnalysisProvider>
    </BrowserRouter>
  );
}

export default App;

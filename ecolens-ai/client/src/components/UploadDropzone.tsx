import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, Sparkles } from "lucide-react";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
  onClear: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  isLoading,
  selectedFile,
  onClear,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleValidateAndSelect = (file: File) => {
    setErrorMsg(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the 5 MB limit.`);
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg("Please upload a standard image file (JPEG, PNG, or WebP).");
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Helper to load bundled demo sample items for quick hackathon presentation
  const handleSampleSelect = async (sampleName: string, sampleCategory: string) => {
    try {
      // Create a lightweight clean demo canvas image
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 600, 600);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(1, "#022c22");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);

        // Center item silhouette
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(300, 300, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sampleName, 300, 300);
        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#67e8f9";
        ctx.fillText(`Sample (${sampleCategory})`, 300, 340);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, "-")}.png`, {
            type: "image/png",
          });
          handleValidateAndSelect(file);
        }
      }, "image/png");
    } catch {
      setErrorMsg("Failed to generate demo sample image.");
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragOver
            ? "border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-xl shadow-cyan-950/30"
            : selectedFile
            ? "border-emerald-500/60 bg-emerald-950/10"
            : "border-slate-800 bg-slate-900/30 hover:border-emerald-500/50 hover:bg-slate-900/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleValidateAndSelect(e.target.files[0]);
            }
          }}
        />

        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 mb-4 rounded-2xl bg-gradient-to-tr from-emerald-900/40 via-slate-800 to-cyan-900/40 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all shadow-lg">
            {selectedFile ? (
              <ImageIcon className="h-8 w-8 text-emerald-400" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-100 mb-1">
            {selectedFile ? selectedFile.name : "Drop your waste photo here"}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mb-4">
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis`
              : "Supports JPEG, PNG, or WebP up to 5 MB for optical material breakdown."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-950/40 transition-all">
              {selectedFile ? "Replace Photograph" : "Browse Device Files"}
            </span>
            {selectedFile && !isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Demo Samples for Judges & Fast Testing */}
      <div className="mt-4 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Quick Demo Samples:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleSelect("Clear Water Bottle", "Plastics")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:border-emerald-500/40 hover:text-emerald-300"
          >
            🍾 PET Bottle
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleSelect("Aluminum Soda Can", "Metals")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:border-cyan-500/40 hover:text-cyan-300"
          >
            🥫 Soda Can
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleSelect("Corrugated Shipping Box", "Paper")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:border-teal-500/40 hover:text-teal-300"
          >
            📦 Cardboard Box
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleSelect("Obsolete USB Cable", "E-Waste")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:border-amber-500/40 hover:text-amber-300"
          >
            🔌 E-Waste Cable
          </button>
        </div>
      </div>
    </div>
  );
};

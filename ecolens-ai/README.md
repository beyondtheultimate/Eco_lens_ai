# EcoLens AI — Waste Analysis & Circular Intelligence

> **MLH Hackathon Challenge**: Best Use of Gemma 4  
> **Hardware / Stack**: Windows 11 | Ollama (`gemma4:e2b`) | React 19 + TypeScript + Vite + Tailwind CSS | Express + Multer + Zod

---

## 🌍 Overview & Impact

**EcoLens AI** is an autonomous, privacy-first computer vision application engineered to solve contamination in municipal recycling streams and accelerate circular economy upcycling.

By leveraging **Gemma 4** (`gemma4:e2b`) running **100% locally on Ollama**, EcoLens AI analyzes uploaded waste photographs directly on edge hardware:
- **Zero Cloud Leakage**: No consumer waste images, household documents, or private metadata leave the user's device.
- **Scientific Rigor**: Optical material breakdown with low/medium/high qualitative certainty and observed visual evidence.
- **Municipal Recycling Directives**: Actionable step-by-step preparation directives.
- **Contamination Risk Warning**: Explicit warnings regarding unrecyclable linings, food oils, and optical sorter blindspots.
- **Three Circular Upcycling Ideas**: Practical reuse suggestions to extend product lifecycles before disposal.
- **Authoritative Source Citations**: Grounded in a curated recycling knowledge base (EPA, Earth911, Aluminum Association, Call2Recycle) using honest keyword retrieval.

---

## 🏛️ System Architecture

```text
[Browser Frontend (Vite + React 19 + Tailwind)]
        │
        ▼ (POST /api/analyze - Multipart Photo <= 5MB)
[Express TypeScript Backend API]
        │
        ├──> [Multer Memory Storage & File Validation (5MB limit, MIME check)]
        │
        ├──> [Ollama HTTP Client (/api/chat)]
        │        │
        │        ▼ (Base64 Optical Tensor Stream)
        │     [Local Gemma 4 Model (gemma4:e2b)]
        │        │
        │        ▼ (Raw Structured JSON)
        │
        ├──> [Curated Recycling Knowledge Base (EPA, GPI, AF&PA Citations)]
        │        │
        │        ▼ (Direct Keyword Retrieval)
        │
        └──> [Strict Zod Runtime Validation (WasteAnalysisResultSchema)]
                 │
                 ▼ (200 JSON Payload)
[Responsive Climate-Tech Results Dashboard + Local History]
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ (Verified on v24.18.1)
- **Ollama**: Installed and running on `http://localhost:11434`
- **Gemma 4 Model**: `gemma4:e2b`

```powershell
# 1. Verify Ollama is running
curl http://localhost:11434/

# 2. Pull Gemma 4 multimodal model (requires approval)
ollama pull gemma4:e2b

# 3. Test image inference via Ollama
ollama run gemma4:e2b "Describe this item" path/to/sample.jpg
```

### 2. Start the Backend Server
```powershell
cd ecolens-ai/server
npm install
npm run dev
# Server listening on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Start the Frontend Client
In a separate terminal:
```powershell
cd ecolens-ai/client
npm install
npm run dev
# Vite dev server running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Comprehensive Test Report

| Test ID | Target Component | Description | Status | Verification Output |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | Backend Service | Knowledge base keyword retrieval | **PASSED** | Correctly resolved categories (Plastics, Metals, E-Waste) with EPA citations. |
| **T2** | Zod Schema | Valid payload parsing | **PASSED** | Strict schema validation passed for conformant payload. |
| **T3** | Zod Schema | Malformed payload rejection | **PASSED** | Correctly caught and rejected payload with fewer than 3 reuse ideas. |
| **T4** | File Ingestion | File size enforcement | **PASSED** | Files > 5 MB strictly rejected with HTTP 400 `FILE_TOO_LARGE`. |
| **T5** | File Ingestion | MIME type validation | **PASSED** | Non-image files rejected with HTTP 400 `INVALID_FILE_TYPE`. |
| **T6** | Frontend Build | Vite + TypeScript + Tailwind bundle | **PASSED** | Production build created zero bundle errors in 893ms. |
| **T7** | Backend Build | TypeScript compilation | **PASSED** | Backend compiled to `/dist` with zero `tsc` diagnostics. |

---

## 🎬 3-Minute Live Hackathon Demo Script

- **0:00 - 0:30 (The Problem & MLH Challenge Focus)**:
  - "Hello judges! 40% of curbside recycling fails due to 'wish-cycling' and material contamination. We built **EcoLens AI** to empower consumers with real-time, 100% private optical waste intelligence powered by Google's new **Gemma 4** (`gemma4:e2b`)."
- **0:30 - 1:15 (Live Optical Demonstration)**:
  - Drag and drop a photograph of a plastic bottle (or click the quick demo sample button).
  - Watch the real-time HUD radar scanning animation while Gemma 4 evaluates optical geometry, surface sheen, and closure threading.
- **1:15 - 2:00 (The Results & Scientific Rigor)**:
  - Show the **Material Breakdown**: "Notice Gemma 4 identified the body as PET #1 (85%) and the cap as Polypropylene #5 (15%)."
  - Highlight the **Qualitative Certainty Badge**: "Instead of a false probability score, EcoLens provides honest qualitative certainty backed by visual cues."
  - Point to the **Disposal Directives & Contamination Warnings**: Explains why bottles must be rinsed and caps replaced.
- **2:00 - 2:30 (Circularity & Citations)**:
  - Walk through the **Three Upcycling Ideas**: E.g. self-watering seedling planters.
  - Show the **Curated Source Citations**: Clickable citations pointing to EPA guidelines and Earth911 resin databases.
- **2:30 - 3:00 (Architecture, Edge Privacy & Q&A)**:
  - "Everything you just saw ran completely offline on edge hardware without sending a single byte to third-party cloud servers. Thank you!"

---

## ⚠️ Known Limitations & Future Roadmap

1. **2D Visual Ambiguity**: Single-angle 2D photos cannot detect interior chemical barrier films (e.g. EVOH layers inside juice pouches). *Roadmap: Multi-frame spatial video scanning.*
2. **Municipal Variance**: Drop-off vs curbside acceptance depends on regional recycling facilities. *Roadmap: Geolocation-aware municipal dataset routing.*
3. **Hardware Acceleration**: GPU offloading on Windows via DirectML / Vulkan in Ollama for sub-second latency.

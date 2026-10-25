# EcoLens AI — Optical Waste Intelligence & Circular Upcycling

> **MLH Hackathon Challenge**: Best Use of Gemma 4  
> **Repository**: [https://github.com/beyondtheultimate/Eco_lens_ai](https://github.com/beyondtheultimate/Eco_lens_ai)  
> **Hardware / Stack**: Windows 11 | Local Ollama (`gemma4:e2b`) | React 19 + TypeScript + Vite + Tailwind CSS | Express + Multer + Zod

---

## 🌍 Overview & Impact

**EcoLens AI** is an autonomous, privacy-first computer vision platform engineered to combat municipal recycling contamination and accelerate circular economy upcycling.

By leveraging **Gemma 4** (`gemma4:e2b`) running **100% locally on Ollama**, EcoLens AI analyzes uploaded waste photographs directly on edge hardware:
- 🛡️ **Zero Cloud Ingestion**: Consumer waste photographs, sensitive household packaging, or location metadata never leave the local device.
- 🔬 **Scientific Rigor**: Optical material breakdown with low/medium/high qualitative certainty and observed visual evidence.
- ♻️ **Municipal Recycling Directives**: Actionable step-by-step preparation directives (rinsing, cap retention, sorting criteria).
- ⚠️ **Contamination Risk Warning**: Explicit warnings regarding unrecyclable linings, food oils, and optical sorter blindspots.
- 💡 **Three Circular Upcycling Ideas**: Practical reuse suggestions to extend product lifecycles before disposal.
- 📚 **Authoritative Source Citations**: Grounded in a curated recycling knowledge base (EPA, Earth911, Aluminum Association, Call2Recycle, Carton Council) using genuine keyword retrieval.
- 📊 **Circularity Index & Audit Export**: Calculates recyclable material percentage and enables one-click JSON audit report exports.

---

## 🏛️ System Architecture

```text
[Browser Frontend (Vite + React 19 + Tailwind CSS)]
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
[Responsive Climate-Tech Results Dashboard + Local History + JSON Export]
```

---

## 📦 Project Structure

```text
Eco_lens_ai/
├── package.json                       # Root script runner for client & server
├── README.md                          # Main project showcase & hackathon documentation
├── .gitignore                         # Excludes node_modules, dist, .env, secrets
├── .env.example                       # Port & Ollama configuration
│
├── ecolens-ai/                        # Full-Stack Application
│   ├── server/                        # Express + TypeScript + Multer + Zod Backend
│   │   ├── src/
│   │   │   ├── app.ts                 # Express app definition & CORS configuration
│   │   │   ├── index.ts               # Server entrypoint (Port 5000)
│   │   │   ├── controllers/
│   │   │   │   ├── healthController.ts# GET /api/health (Ollama & model probing)
│   │   │   │   └── analyzeController.ts# POST /api/analyze (Image ingest & validation)
│   │   │   ├── schemas/
│   │   │   │   └── analysisSchema.ts  # Zod schema for validated AI output
│   │   │   └── services/
│   │   │       ├── knowledgeBase.ts   # Curated recycling knowledge base & citations
│   │   │       └── ollamaService.ts   # Local Gemma 4 multimodal API integration
│   │   └── tests/
│   │       ├── api.test.ts            # Knowledge retrieval & Zod schema unit tests
│   │       └── validation.test.ts     # Upload limit & MIME type rejection tests
│   │
│   └── client/                        # React 19 + Vite + TypeScript + Tailwind Frontend
│       ├── src/
│       │   ├── App.tsx                # Main UI state machine & telemetry
│       │   ├── types/index.ts         # TypeScript interfaces
│       │   └── components/
│       │       ├── Navbar.tsx         # Climate-tech header with live Ollama pill
│       │       ├── UploadDropzone.tsx # Drag-and-drop & demo samples (PET, Can, etc.)
│       │       ├── AnalysisLoading.tsx# Radar scan line & optical feature HUD
│       │       ├── ResultsDashboard.tsx# Certainty, evidence, reuse ideas & export
│       │       └── HistoryDrawer.tsx  # Offline history stored in localStorage
│       └── vite.config.ts             # Dev server with /api proxy to port 5000
│
├── app.py                             # Standalone Python CLI interface for Gemma
├── gemma_client.py                    # Standalone Python client wrapper for Ollama
└── requirements.txt                   # Python dependencies for CLI evaluation
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ (Verified on v24.18.1)
- **Ollama**: Installed and running on `http://localhost:11434`
- **Gemma 4 Model**: `gemma4:e2b` (can be pulled when ready for live vision testing)

```powershell
# Verify Ollama is running
curl http://localhost:11434/
```

### 2. Start the Backend API (Port 5000)
```powershell
cd ecolens-ai/server
npm install
npm run dev
# Server listening on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Start the Frontend Client (Port 5173)
In a separate terminal:
```powershell
cd ecolens-ai/client
npm install
npm run dev
# Vite dev server running on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Comprehensive Test Report

| Test ID | Target Component | Description | Status | Verification Output |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | Backend Service | Knowledge base keyword retrieval | **PASSED** | Correctly resolved categories (Plastics, Metals, E-Waste, Textiles, Cartons) with citations. |
| **T2** | Zod Schema | Valid payload parsing | **PASSED** | Strict schema validation passed for conformant payload. |
| **T3** | Zod Schema | Malformed payload rejection | **PASSED** | Correctly caught and rejected payload with fewer than 3 reuse ideas. |
| **T4** | File Ingestion | File size enforcement | **PASSED** | Files > 5 MB strictly rejected with HTTP 400 `FILE_TOO_LARGE`. |
| **T5** | File Ingestion | MIME type validation | **PASSED** | Non-image files rejected with HTTP 400 `INVALID_FILE_TYPE`. |
| **T6** | Frontend Build | Vite + TypeScript + Tailwind bundle | **PASSED** | Production build created zero bundle errors in 368ms. |
| **T7** | Backend Build | TypeScript compilation | **PASSED** | Backend compiled to `/dist` with zero `tsc` diagnostics. |

---

## 🎬 3-Minute Live Hackathon Demo Script

- **0:00 - 0:30 (The Problem & MLH Challenge Focus)**:
  - "Hello judges! 40% of curbside recycling fails due to 'wish-cycling' and material contamination. We built **EcoLens AI** to empower consumers with real-time, 100% private optical waste intelligence powered by Google's **Gemma 4** (`gemma4:e2b`)."
- **0:30 - 1:15 (Live Optical Demonstration)**:
  - Drag and drop a photograph of a plastic bottle (or click any of the quick demo sample buttons in the UI).
  - Watch the real-time HUD radar scanning animation while Gemma 4 evaluates optical geometry, surface sheen, and closure threading.
- **1:15 - 2:00 (The Results & Scientific Rigor)**:
  - Show the **Material Breakdown**: "Notice Gemma 4 identified the body as PET #1 (85%) and the cap as Polypropylene #5 (15%)."
  - Highlight the **Qualitative Certainty Badge**: "Instead of a false probability score, EcoLens provides honest qualitative certainty backed by visual cues."
  - Point to the **Disposal Directives & Contamination Warnings**: Explains why bottles must be rinsed and caps replaced.
- **2:00 - 2:30 (Circularity & Citations)**:
  - Walk through the **Three Upcycling Ideas**: E.g. self-watering seedling planters.
  - Show the **Curated Source Citations**: Clickable citations pointing to EPA guidelines and Earth911 resin databases.
  - Show the **Export Audit**: One-click export of structured JSON for ESG compliance and auditing.
- **2:30 - 3:00 (Architecture, Edge Privacy & Q&A)**:
  - "Everything you just saw ran completely offline on edge hardware without sending a single byte to third-party cloud servers. Thank you!"

---

## 🛡️ Privacy & Security Guidelines

- Zero user images or personal data are stored remotely or transmitted over the internet.
- Ollama is bound to `localhost:11434` for local security.
- `.env` files and `node_modules` are strictly excluded via `.gitignore`.

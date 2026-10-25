export interface MaterialEstimate {
  material: string;
  percentage: number;
  recyclable: boolean;
  notes?: string;
}

export interface Citation {
  source: string;
  title: string;
  url: string;
  guidelineSnippet: string;
  applicableRegion?: string;
  materialCategory?: string;
  verifiedDate?: string;
}

export interface ReuseIdeaDetail {
  title: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  requiredMaterials: string[];
  steps: string[];
  safetyNotes?: string;
}

export interface WasteAnalysisResult {
  itemName: string;
  primaryCategory:
    | "Plastics"
    | "Paper & Cardboard"
    | "Glass"
    | "Metals"
    | "Organics & Compost"
    | "E-Waste"
    | "Hazardous / Batteries"
    | "Textiles"
    | "Mixed / Landfill";
  certainty: "low" | "medium" | "high";
  certaintyReasoning: string;
  visibleEvidence: string[];
  materials: MaterialEstimate[];
  recyclingCategory: string;
  disposalInstructions: string[];
  contaminationRisk: string;
  uncertaintyWarnings: string[];
  reuseSuggestions: string[];
  detailedReusePlans?: ReuseIdeaDetail[];
  citations: Citation[];
  estimatedCarbonSavedKg: number;
  modelUsed: string;
  analyzedAt: string;
  municipalityNote?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  imagePreviewUrl: string;
  result: WasteAnalysisResult;
}

export interface OllamaHealthStatus {
  isOnline: boolean;
  modelInstalled: boolean;
  targetModel: string;
  installedModels: string[];
  ollamaHost: string;
}

export interface VisionHealthStatus {
  isReady: boolean;
  activeProvider: "ollama" | "gemini" | "none";
  activeModel: string;
  ollama: OllamaHealthStatus;
  hosted: {
    geminiConfigured: boolean;
    geminiModel: string;
  };
}

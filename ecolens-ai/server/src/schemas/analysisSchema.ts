import { z } from "zod";

export const MaterialEstimateSchema = z.object({
  material: z.string().min(1, "Material name is required"),
  percentage: z.number().min(0).max(100),
  recyclable: z.boolean(),
  notes: z.string().optional(),
});

export const CitationSchema = z.object({
  source: z.string(),
  title: z.string(),
  url: z.string().url().or(z.string()),
  guidelineSnippet: z.string(),
  applicableRegion: z.string().optional(),
  materialCategory: z.string().optional(),
  verifiedDate: z.string().optional(),
});

export const ReuseIdeaDetailSchema = z.object({
  title: z.string(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).default("Easy"),
  requiredMaterials: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  safetyNotes: z.string().optional(),
});

export const WasteAnalysisResultSchema = z.object({
  itemName: z.string().min(1, "Identified item name is required"),
  primaryCategory: z.enum([
    "Plastics",
    "Paper & Cardboard",
    "Glass",
    "Metals",
    "Organics & Compost",
    "E-Waste",
    "Hazardous / Batteries",
    "Textiles",
    "Mixed / Landfill",
  ]),
  certainty: z.enum(["low", "medium", "high"]),
  certaintyReasoning: z.string(),
  visibleEvidence: z.array(z.string()).min(1, "At least one visual feature evidence required"),
  materials: z.array(MaterialEstimateSchema).min(1),
  recyclingCategory: z.string(),
  disposalInstructions: z.array(z.string()).min(1),
  contaminationRisk: z.string(),
  uncertaintyWarnings: z.array(z.string()),
  reuseSuggestions: z.array(z.string()).min(3, "Must provide at least 3 practical reuse suggestions"),
  detailedReusePlans: z.array(ReuseIdeaDetailSchema).optional(),
  citations: z.array(CitationSchema),
  estimatedCarbonSavedKg: z.number().nonnegative(),
  modelUsed: z.string(),
  analyzedAt: z.string(),
  municipalityNote: z.string().optional().default("Local municipal acceptance varies. Check with your city's waste authority."),
});

export type WasteAnalysisResult = z.infer<typeof WasteAnalysisResultSchema>;
export type MaterialEstimate = z.infer<typeof MaterialEstimateSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type ReuseIdeaDetail = z.infer<typeof ReuseIdeaDetailSchema>;

import {
  WasteAnalysisResult,
  WasteAnalysisResultSchema,
  MaterialEstimate,
  ReuseIdeaDetail,
} from "../schemas/analysisSchema.js";
import { queryKnowledgeBase } from "./knowledgeBase.js";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const TARGET_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

/**
 * Normalizes model names by stripping any accidental "models/" prefix or whitespace.
 * e.g. "models/gemini-3.8-flash" -> "gemini-3.8-flash"
 */
export function sanitizeGeminiModelName(modelName?: string): string {
  if (!modelName || !modelName.trim()) {
    return DEFAULT_GEMINI_MODEL;
  }
  return modelName.trim().replace(/^models\//i, "");
}

/**
 * Returns the sanitized Gemini model identifier configured in environment variables.
 */
export function getConfiguredGeminiModel(): string {
  return sanitizeGeminiModelName(process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL);
}

/**
 * Prioritized list of vision-capable Gemini models supporting generateContent.
 */
export const GEMINI_MODEL_PREFERENCES: readonly string[] = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

interface CachedModelList {
  models: string[];
  timestamp: number;
}
let cachedModels: CachedModelList | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Queries the official Gemini API model-list endpoint:
 * GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}
 * Filters for models supporting the 'generateContent' method.
 */
export async function fetchAvailableGeminiModels(
  apiKey: string,
  forceFresh: boolean = false
): Promise<string[]> {
  if (!apiKey || apiKey.trim() === "") return [];

  if (!forceFresh && cachedModels && Date.now() - cachedModels.timestamp < CACHE_TTL_MS) {
    return cachedModels.models;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[EcoLens AI] Gemini list-models returned HTTP ${res.status}: ${errText.slice(0, 150)}`);
      return cachedModels ? cachedModels.models : [];
    }

    const data = (await res.json()) as {
      models?: Array<{
        name: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const validModels = (data.models || [])
      .filter(
        (m) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m) => sanitizeGeminiModelName(m.name));

    if (validModels.length > 0) {
      cachedModels = {
        models: validModels,
        timestamp: Date.now(),
      };
      return validModels;
    }
  } catch (err) {
    console.warn(`[EcoLens AI] Gemini model discovery request failed: ${(err as Error).message}`);
  }

  return cachedModels ? cachedModels.models : [];
}

/**
 * Resolves the vision model to use with ZERO extra network roundtrips on the critical path:
 * 1. Uses explicit GEMINI_MODEL if configured.
 * 2. Uses cached models if available from a previous discovery.
 * 3. Defaults directly to "gemini-3.8-flash".
 * Dynamic discovery and automatic retry is only triggered if the primary request returns 404.
 */
export async function resolveGeminiVisionModel(apiKey: string): Promise<string> {
  const envModel = process.env.GEMINI_MODEL ? sanitizeGeminiModelName(process.env.GEMINI_MODEL) : null;
  if (envModel) {
    return envModel;
  }

  if (cachedModels && cachedModels.models.length > 0) {
    for (const candidate of GEMINI_MODEL_PREFERENCES) {
      if (cachedModels.models.includes(candidate)) {
        return candidate;
      }
    }
    return cachedModels.models[0];
  }

  return DEFAULT_GEMINI_MODEL;
}

/**
 * Formats a clean, user-actionable error for Gemini API failures.
 */
export function formatGeminiError(
  status: number,
  errorText: string,
  attemptedModel: string,
  availableModels: string[] = []
): Error {
  let parsedMsg = errorText;
  try {
    const json = JSON.parse(errorText) as { error?: { message?: string; status?: string } };
    if (json.error?.message) {
      parsedMsg = json.error.message;
    }
  } catch {
    // keep raw text
  }

  if (status === 400 || status === 403) {
    if (
      parsedMsg.toLowerCase().includes("api_key") ||
      parsedMsg.toLowerCase().includes("api key") ||
      parsedMsg.toLowerCase().includes("credential") ||
      status === 403
    ) {
      return new Error(
        `Gemini API Authentication Failed (HTTP ${status}): ${parsedMsg}. Please create or verify your API key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in your server/Vercel environment variables.`
      );
    }
    return new Error(`Gemini API Request Error (HTTP ${status}): ${parsedMsg}`);
  }

  if (status === 429) {
    return new Error(
      `Gemini Rate Limit Exceeded (HTTP 429 / RESOURCE_EXHAUSTED): Free-tier per-minute quota has been reached. Please wait 15-30 seconds before retrying. Manage quotas at https://aistudio.google.com/`
    );
  }

  if (status === 404) {
    const listMsg =
      availableModels.length > 0
        ? `Available models for your key: [${availableModels.join(", ")}]. Set GEMINI_MODEL to one of these IDs in Vercel settings.`
        : "Verify your project has access to Generative Language models at https://aistudio.google.com/apikey";
    return new Error(
      `Gemini Vision API Model Not Found (HTTP 404): Model '${attemptedModel}' is not supported for generateContent on API v1beta. ${listMsg} (Details: ${parsedMsg})`
    );
  }

  return new Error(`Gemini Vision API error (HTTP ${status}): ${parsedMsg}`);
}

interface GeminiAttemptResult {
  ok: boolean;
  status: number;
  data?: {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  errorText?: string;
  isTransient?: boolean;
}

/**
 * Dispatches a single HTTP request to Google Gemini generateContent with strict timeout and clean logging.
 */
async function executeSingleGeminiRequest(
  apiKey: string,
  model: string,
  promptText: string,
  cleanMime: string,
  imageBase64: string,
  attemptIndex: number,
  maxRetries: number
): Promise<GeminiAttemptResult> {
  const cleanModel = sanitizeGeminiModelName(model);
  const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    cleanModel
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: cleanMime,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.2,
    },
  };

  const startTime = Date.now();
  console.log(
    `[EcoLens AI] [Attempt ${attemptIndex + 1}/${maxRetries + 1}] Invoking Gemini model '${cleanModel}'...`
  );

  try {
    const response = await fetch(primaryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000), // 25s per single attempt to respect Vercel's 60s limit
    });

    const elapsed = Date.now() - startTime;

    if (response.ok) {
      console.log(`[EcoLens AI] Model '${cleanModel}' responded successfully (HTTP 200) in ${elapsed}ms.`);
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return { ok: true, status: 200, data };
    }

    const errorText = await response.text();
    const isTransient =
      [503, 429, 500, 502, 504].includes(response.status) ||
      errorText.toLowerCase().includes("high demand") ||
      errorText.toLowerCase().includes("overloaded");

    console.warn(
      `[EcoLens AI] Model '${cleanModel}' returned HTTP ${response.status} in ${elapsed}ms (${
        isTransient ? "transient / high-demand" : "client-error"
      }): ${errorText.slice(0, 180)}`
    );

    return {
      ok: false,
      status: response.status,
      errorText,
      isTransient,
    };
  } catch (err) {
    const netErr = err as Error;
    const elapsed = Date.now() - startTime;
    const isTimeout =
      netErr.name === "TimeoutError" ||
      netErr.message?.toLowerCase().includes("timeout") ||
      netErr.message?.toLowerCase().includes("aborted");

    console.warn(
      `[EcoLens AI] Model '${cleanModel}' fetch failed in ${elapsed}ms: ${netErr.message}`
    );

    return {
      ok: false,
      status: isTimeout ? 504 : 500,
      errorText: netErr.message,
      isTransient: true,
    };
  }
}

/**
 * Executes vision generation with maximum 2 retries for transient HTTP 503/500/429 errors
 * using exponential backoff with jitter, and automatic fallback to verified alternative models
 * from the official Models API if the primary model remains overloaded or unavailable.
 */
async function callGeminiGenerateContent(
  apiKey: string,
  initialModel: string,
  promptText: string,
  cleanMime: string,
  imageBase64: string
): Promise<{ text: string; modelUsed: string }> {
  const primaryModel = sanitizeGeminiModelName(initialModel);
  const modelsToTry: string[] = [primaryModel];
  const attemptedModels: string[] = [];
  const maxRetriesPerModel = 2; // Up to 2 retries for transient errors (total 3 attempts per model)

  let lastStatus = 500;
  let lastErrorText = "Unknown error";

  // Outer loop: Try models (primary model first, then fallback models if primary persistently returns 503 or 404)
  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];
    attemptedModels.push(currentModel);

    let isModelExhausted = false;

    // Inner loop: Retries for transient HTTP 503/500/429 errors using exponential backoff with jitter
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      const result = await executeSingleGeminiRequest(
        apiKey,
        currentModel,
        promptText,
        cleanMime,
        imageBase64,
        attempt,
        maxRetriesPerModel
      );

      if (result.ok && result.data) {
        const text = result.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text && text.trim().length > 0) {
          console.log(`[EcoLens AI] Vision analysis completed successfully using '${currentModel}'.`);
          return { text, modelUsed: currentModel };
        }
      }

      lastStatus = result.status;
      lastErrorText = result.errorText || "Empty response from Gemini API";

      // Non-transient client errors (400, 401, 403) must NOT be retried
      if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) {
        console.error(
          `[EcoLens AI] Non-retryable error (HTTP ${lastStatus}) encountered on '${currentModel}'. Aborting retries.`
        );
        throw formatGeminiError(lastStatus, lastErrorText, currentModel, []);
      }

      // If 404 Model Not Found, do not retry this model; break to fallback immediately
      if (lastStatus === 404) {
        console.warn(
          `[EcoLens AI] Model '${currentModel}' not found (HTTP 404). Transitioning to fallback models.`
        );
        isModelExhausted = true;
        break;
      }

      // If transient error (503 High Demand, 429 Rate Limit, 500 Server Error) and retries remain:
      if (result.isTransient && attempt < maxRetriesPerModel) {
        // Exponential backoff with random jitter: ~1.0s - 1.4s (attempt 0), ~2.0s - 2.4s (attempt 1)
        const jitter = Math.floor(Math.random() * 400);
        const backoffMs = Math.min(1000 * Math.pow(2, attempt) + jitter, 2500);

        console.info(
          `[EcoLens AI] Transient HTTP ${lastStatus} on '${currentModel}'. Backing off ${backoffMs}ms before retry ${
            attempt + 1
          }/${maxRetriesPerModel}...`
        );
        await new Promise((r) => setTimeout(r, backoffMs));
      } else {
        isModelExhausted = true;
        break;
      }
    }

    // If current model persistently failed (e.g. 503 high demand after 2 retries, or 404) and no fallbacks queued yet:
    if (isModelExhausted && mIdx === 0) {
      console.warn(
        `[EcoLens AI] Primary model '${currentModel}' is unavailable (HTTP ${lastStatus}). Querying official Models API to discover verified fallback models...`
      );

      const verifiedModels = await fetchAvailableGeminiModels(apiKey, true);
      console.log(
        `[EcoLens AI] Official Models API returned ${verifiedModels.length} models supporting generateContent: [${verifiedModels.join(
          ", "
        )}]`
      );

      // Add verified candidates in priority order that have not been attempted yet
      for (const pref of GEMINI_MODEL_PREFERENCES) {
        const cleanPref = sanitizeGeminiModelName(pref);
        if (verifiedModels.includes(cleanPref) && !modelsToTry.includes(cleanPref)) {
          modelsToTry.push(cleanPref);
          if (modelsToTry.length >= 3) break; // Limit to 2 fallback models to stay within Vercel time limits
        }
      }

      // Fallback to any verified model with "flash" if none of preferred candidates matched
      if (modelsToTry.length === 1 && verifiedModels.length > 0) {
        for (const vModel of verifiedModels) {
          if (!modelsToTry.includes(vModel)) {
            modelsToTry.push(vModel);
            if (modelsToTry.length >= 3) break;
          }
        }
      }

      if (modelsToTry.length > 1) {
        console.info(
          `[EcoLens AI] Queued verified fallback models: [${modelsToTry.slice(1).join(", ")}]`
        );
      } else {
        console.warn(`[EcoLens AI] No alternative models available in official Models API.`);
      }
    }
  }

  // All attempted models and retries failed
  const verifiedModels = await fetchAvailableGeminiModels(apiKey);
  console.error(
    `[EcoLens AI] All attempted models [${attemptedModels.join(
      ", "
    )}] failed. Final HTTP status: ${lastStatus}. Error details: ${lastErrorText.slice(0, 200)}`
  );

  throw formatGeminiError(lastStatus, lastErrorText, attemptedModels.join(" / "), verifiedModels);
}

export interface VisionHealthStatus {
  isReady: boolean;
  activeProvider: "ollama" | "gemini" | "none";
  activeModel: string;
  ollama: {
    isOnline: boolean;
    modelInstalled: boolean;
    targetModel: string;
    installedModels: string[];
    ollamaHost: string;
  };
  hosted: {
    geminiConfigured: boolean;
    geminiModel: string;
  };
}

export async function checkVisionHealth(): Promise<VisionHealthStatus> {
  const apiKey = getGeminiApiKey();
  const geminiConfigured = Boolean(apiKey && apiKey.trim() !== "");
  const defaultGeminiModel = getConfiguredGeminiModel();

  // Check Ollama
  let ollamaOnline = false;
  let ollamaModelInstalled = false;
  let installedModels: string[] = [];

  // In cloud/serverless environments (Vercel, AWS Lambda, or production with Gemini configured),
  // skip trying to connect to localhost:11434 to avoid wasting 1-3 seconds on connection timeouts.
  const isCloudEnvironment = Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      (geminiConfigured && process.env.NODE_ENV === "production" && OLLAMA_HOST.includes("localhost"))
  );

  if (!isCloudEnvironment) {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(800), // tight 800ms timeout for local checks
      });

      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string }> };
        installedModels = (data.models || []).map((m) => m.name);
        ollamaOnline = true;
        ollamaModelInstalled = installedModels.some(
          (name) =>
            name === TARGET_MODEL ||
            name.startsWith(`${TARGET_MODEL}:`) ||
            name.includes(TARGET_MODEL)
        );
      }
    } catch {
      ollamaOnline = false;
      ollamaModelInstalled = false;
    }
  }

  // Determine active provider
  let activeProvider: "ollama" | "gemini" | "none" = "none";
  let activeModel = "None";

  if (ollamaModelInstalled) {
    activeProvider = "ollama";
    activeModel = TARGET_MODEL;
  } else if (geminiConfigured) {
    activeProvider = "gemini";
    activeModel = defaultGeminiModel;
  } else if (ollamaOnline) {
    activeModel = `${TARGET_MODEL} (Not pulled)`;
  }

  return {
    isReady: activeProvider !== "none",
    activeProvider,
    activeModel,
    ollama: {
      isOnline: ollamaOnline,
      modelInstalled: ollamaModelInstalled,
      targetModel: TARGET_MODEL,
      installedModels,
      ollamaHost: OLLAMA_HOST,
    },
    hosted: {
      geminiConfigured,
      geminiModel: defaultGeminiModel,
    },
  };
}

// Kept for backward compatibility with health endpoint
export async function checkOllamaHealth() {
  const v = await checkVisionHealth();
  return v.ollama;
}

export interface RawVisionOutput {
  itemName?: string;
  primaryCategory?: string;
  certainty?: string;
  certaintyReasoning?: string;
  visibleEvidence?: unknown;
  materials?: unknown;
  recyclingCategory?: string;
  disposalInstructions?: unknown;
  contaminationRisk?: string;
  uncertaintyWarnings?: unknown;
  reuseSuggestions?: unknown;
  detailedReusePlans?: unknown;
  estimatedCarbonSavedKg?: unknown;
}

/**
 * Normalizes primaryCategory into the strict Zod schema enum without failing on minor variations.
 */
export function normalizePrimaryCategory(
  cat?: string,
  fallback: WasteAnalysisResult["primaryCategory"] = "Plastics"
): WasteAnalysisResult["primaryCategory"] {
  const validCategories: Array<WasteAnalysisResult["primaryCategory"]> = [
    "Plastics",
    "Paper & Cardboard",
    "Glass",
    "Metals",
    "Organics & Compost",
    "E-Waste",
    "Hazardous / Batteries",
    "Textiles",
    "Mixed / Landfill",
  ];

  if (!cat) return fallback;

  const lower = cat.toLowerCase().trim();
  if (
    lower.includes("plastic") ||
    lower.includes("polymer") ||
    lower.includes("resin") ||
    lower.includes("pet") ||
    lower.includes("hdpe") ||
    lower.includes("polypropylene")
  ) {
    return "Plastics";
  }
  if (
    lower.includes("paper") ||
    lower.includes("cardboard") ||
    lower.includes("carton") ||
    lower.includes("corrugated") ||
    lower.includes("box")
  ) {
    return "Paper & Cardboard";
  }
  if (lower.includes("glass") || lower.includes("silica") || lower.includes("cullet")) {
    return "Glass";
  }
  if (
    lower.includes("metal") ||
    lower.includes("aluminum") ||
    lower.includes("steel") ||
    lower.includes("tin") ||
    lower.includes("can") ||
    lower.includes("foil")
  ) {
    return "Metals";
  }
  if (
    lower.includes("organic") ||
    lower.includes("compost") ||
    lower.includes("food") ||
    lower.includes("yard") ||
    lower.includes("scraps")
  ) {
    return "Organics & Compost";
  }
  if (
    lower.includes("e-waste") ||
    lower.includes("electronic") ||
    lower.includes("circuit") ||
    lower.includes("cable") ||
    lower.includes("charger") ||
    lower.includes("phone")
  ) {
    return "E-Waste";
  }
  if (
    lower.includes("hazard") ||
    lower.includes("battery") ||
    lower.includes("batteries") ||
    lower.includes("chemical") ||
    lower.includes("paint")
  ) {
    return "Hazardous / Batteries";
  }
  if (
    lower.includes("textile") ||
    lower.includes("cloth") ||
    lower.includes("fabric") ||
    lower.includes("cotton") ||
    lower.includes("wool") ||
    lower.includes("apparel")
  ) {
    return "Textiles";
  }
  if (
    lower.includes("trash") ||
    lower.includes("landfill") ||
    lower.includes("mixed") ||
    lower.includes("residual") ||
    lower.includes("non-recyclable")
  ) {
    return "Mixed / Landfill";
  }

  const exact = validCategories.find((c) => c.toLowerCase() === lower);
  return exact || fallback;
}

/**
 * Normalizes certainty to strictly 'low' | 'medium' | 'high'.
 */
export function normalizeCertainty(val?: string): "low" | "medium" | "high" {
  const lower = (val || "").toLowerCase().trim();
  if (lower.includes("high") || lower.includes("strong") || lower.includes("confident")) return "high";
  if (lower.includes("low") || lower.includes("uncertain") || lower.includes("ambiguous")) return "low";
  return "medium";
}

/**
 * Normalizes an array or string into a clean array of strings with a minimum size.
 */
export function normalizeStringArray(val: unknown, fallback: string[]): string[] {
  if (Array.isArray(val)) {
    const cleaned = val
      .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
      .filter((s) => s.length > 0);
    if (cleaned.length > 0) return cleaned;
  } else if (typeof val === "string" && val.trim().length > 0) {
    if (val.includes("\n")) {
      const lines = val
        .split("\n")
        .map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim())
        .filter((s) => s.length > 1);
      if (lines.length > 0) return lines;
    }
    const sentences = val
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.replace(/^[-*•\d.]+\s*/, "").trim())
      .filter((s) => s.length > 1);
    if (sentences.length > 0) return sentences;
    return [val.trim()];
  }
  return fallback;
}

/**
 * Normalizes material estimates, ensuring percentage is a valid number and recyclable is a boolean.
 */
export function normalizeMaterials(
  materials: unknown,
  defaultMaterial: string,
  defaultRecyclable: boolean
): MaterialEstimate[] {
  if (Array.isArray(materials) && materials.length > 0) {
    const list: MaterialEstimate[] = [];
    for (const item of materials) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const name = String(obj.material || obj.name || "").trim();
      if (!name) continue;

      let pct = 100;
      if (typeof obj.percentage === "number") {
        pct = Math.min(100, Math.max(0, obj.percentage));
      } else if (typeof obj.percentage === "string") {
        const parsed = parseFloat(obj.percentage.replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed)) pct = Math.min(100, Math.max(0, parsed));
      }

      let rec = defaultRecyclable;
      if (typeof obj.recyclable === "boolean") {
        rec = obj.recyclable;
      } else if (typeof obj.recyclable === "string") {
        rec = obj.recyclable.toLowerCase() === "true" || obj.recyclable.toLowerCase() === "yes";
      }

      const mat: MaterialEstimate = {
        material: name,
        percentage: pct,
        recyclable: rec,
      };
      if (typeof obj.notes === "string" && obj.notes.trim()) {
        mat.notes = obj.notes.trim();
      }
      list.push(mat);
    }

    if (list.length > 0) return list;
  }

  return [{ material: defaultMaterial, percentage: 100, recyclable: defaultRecyclable }];
}

const SYSTEM_PROMPT = `You are EcoLens AI, a specialized circular economy and environmental computer vision model.
Analyze the provided photograph of a discarded waste item or recyclable packaging material.
Be strictly honest and scientifically rigorous. Never fabricate certainty if image features are ambiguous, blurred, or occluded.
If the image shows non-waste or ambiguous objects, explain the visual uncertainty transparently.

You MUST respond strictly in valid JSON matching this schema:
{
  "itemName": "Specific item name (e.g. Clear PET 500ml Water Bottle with Polypropylene Cap)",
  "primaryCategory": "One of: Plastics, Paper & Cardboard, Glass, Metals, Organics & Compost, E-Waste, Hazardous / Batteries, Textiles, Mixed / Landfill",
  "certainty": "low" | "medium" | "high",
  "certaintyReasoning": "Why you chose this certainty based on lighting, clarity, visible resin codes, seams, or logos",
  "visibleEvidence": [
    "Observed visual clue 1 (e.g. Transparent rigid polymer body, blue threaded plastic screw cap)",
    "Observed visual clue 2 (e.g. Mold seam line, triangular recycle imprint on bottle base)"
  ],
  "materials": [
    { "material": "Polyethylene Terephthalate (PET #1)", "percentage": 85, "recyclable": true, "notes": "Main bottle body" },
    { "material": "Polypropylene (PP #5)", "percentage": 15, "recyclable": true, "notes": "Screw cap" }
  ],
  "recyclingCategory": "Curbside Recyclable / Drop-off Only / Trash / Compost / Hazardous Drop-Off",
  "disposalInstructions": [
    "Step 1: Empty remaining liquids and rinse container with cold water",
    "Step 2: Re-thread screw cap onto bottle so it does not get lost during mechanical sorting",
    "Step 3: Deposit in municipal curbside recycling container"
  ],
  "contaminationRisk": "Explanation of potential hazards (e.g. Food grease, residual dairy, non-removable adhesives)",
  "uncertaintyWarnings": [
    "Explain what cannot be visually verified from 2D photos (e.g. Internal chemical barrier films, microscopic food oils)"
  ],
  "reuseSuggestions": [
    "Practical upcycling idea 1 (e.g. Cut top funnel section to create self-watering seedling planter)",
    "Practical upcycling idea 2 (e.g. Use clean bottle as lightweight drip-irrigation reservoir for potted plants)",
    "Practical upcycling idea 3 (e.g. Store small workshop hardware like screws, nails, or buttons)"
  ],
  "detailedReusePlans": [
    {
      "title": "Self-Watering Seedling Herb Planter",
      "difficulty": "Easy",
      "requiredMaterials": ["Clean bottle", "Kitchen shears", "Cotton wick", "Potting soil"],
      "steps": [
        "Cut the bottle horizontally 4 inches below the neck.",
        "Invert the funnel-shaped top half into the lower cylindrical base.",
        "Thread a cotton string through the open spout into the base reservoir.",
        "Fill top with potting soil, sow seeds, and add water to base."
      ],
      "safetyNotes": "Smooth sharp cut edges with tape or sandpaper."
    }
  ],
  "estimatedCarbonSavedKg": 0.15
}`;

/**
 * Execute vision inference using either local Ollama (Gemma) or hosted Google Gemini Multimodal Vision.
 */
export async function analyzeImageWithGemma(
  imageBase64: string,
  fileName: string,
  mimeType: string = "image/jpeg",
  municipality?: string
): Promise<WasteAnalysisResult> {
  const health = await checkVisionHealth();

  if (!health.isReady) {
    if (health.ollama.isOnline) {
      throw new Error(
        `Ollama is online at ${health.ollama.ollamaHost}, but model '${health.ollama.targetModel}' has not been pulled. Currently installed models: [${
          health.ollama.installedModels.join(", ") || "none"
        }]. Please run 'ollama pull ${health.ollama.targetModel}' locally, or configure GEMINI_API_KEY in environment variables for hosted cloud inference.`
      );
    }

    throw new Error(
      `No vision inference service is available. For local inference: launch Ollama and pull '${health.ollama.targetModel}'. For hosted cloud deployment: set GEMINI_API_KEY in your server environment variables.`
    );
  }

  let rawJsonText = "";
  let modelIdentifier = "";

  // 1. If Ollama has the target model installed, prioritize local Ollama
  if (health.activeProvider === "ollama") {
    modelIdentifier = `${TARGET_MODEL} (Ollama Local)`;

    const userPrompt = municipality
      ? `Analyze this discarded waste item for a resident in ${municipality}. Return strict JSON.`
      : "Analyze this discarded waste item and return the environmental recycling breakdown in strict JSON.";

    const requestBody = {
      model: TARGET_MODEL,
      messages: [
        {
          role: "user",
          content: userPrompt,
          images: [imageBase64],
        },
      ],
      system: SYSTEM_PROMPT,
      format: "json",
      stream: false,
      options: {
        temperature: 0.2,
      },
    };

    let response: Response;
    try {
      response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000),
      });
    } catch (ollamaErr) {
      const netErr = ollamaErr as Error;
      if (netErr.name === "TimeoutError" || netErr.message?.toLowerCase().includes("timeout") || netErr.message?.toLowerCase().includes("aborted")) {
        throw new Error(
          `MULTIMODAL_INFERENCE_TIMEOUT: Local Ollama (${TARGET_MODEL}) took longer than 60 seconds to process the image.`
        );
      }
      throw ollamaErr;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const responseJson = (await response.json()) as {
      message?: { content?: string };
      error?: string;
    };

    if (responseJson.error) {
      throw new Error(`Ollama model error: ${responseJson.error}`);
    }

    rawJsonText = responseJson.message?.content || "";
  } else if (health.activeProvider === "gemini") {
    // 2. Use Google Gemini Multimodal Vision API
    const apiKey = getGeminiApiKey();
    const resolvedModel = await resolveGeminiVisionModel(apiKey);

    const promptText = municipality
      ? `${SYSTEM_PROMPT}\n\nUser Municipality context: ${municipality}.\nAnalyze this uploaded waste photo and provide structured circular analysis.`
      : `${SYSTEM_PROMPT}\n\nAnalyze this uploaded waste photo and provide structured circular analysis.`;

    // Standardize MIME type for Gemini
    let cleanMime = (mimeType || "").toLowerCase().trim();
    if (
      cleanMime === "image/jfif" ||
      cleanMime === "image/pjpeg" ||
      cleanMime === "image/jpg" ||
      cleanMime === "application/octet-stream" ||
      fileName.toLowerCase().endsWith(".jfif") ||
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg")
    ) {
      cleanMime = "image/jpeg";
    } else if (cleanMime === "image/png" || fileName.toLowerCase().endsWith(".png")) {
      cleanMime = "image/png";
    } else if (cleanMime === "image/webp" || fileName.toLowerCase().endsWith(".webp")) {
      cleanMime = "image/webp";
    } else {
      cleanMime = "image/jpeg";
    }

    const { text, modelUsed } = await callGeminiGenerateContent(
      apiKey,
      resolvedModel,
      promptText,
      cleanMime,
      imageBase64
    );

    modelIdentifier = `${modelUsed} (Google Hosted Vision)`;
    rawJsonText = text;
  }

  if (!rawJsonText || rawJsonText.trim() === "") {
    throw new Error("Vision inference engine returned an empty response.");
  }

  // Parse JSON response from model
  let parsed: RawVisionOutput;
  try {
    const cleaned = rawJsonText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse vision model JSON output: ${(err as Error).message}. Raw response was: ${rawJsonText.slice(
        0,
        250
      )}...`
    );
  }

  // Query curated knowledge base for verified municipal standards and citations
  const queryTerms = `${parsed.itemName || ""} ${parsed.primaryCategory || ""} ${(
    Array.isArray(parsed.materials) ? parsed.materials : []
  )
    .map((m: any) => m?.material || m?.name || "")
    .join(" ")}`;
  const knowledge = queryKnowledgeBase(queryTerms);

  // Normalize category robustly
  const finalCategory = normalizePrimaryCategory(
    parsed.primaryCategory,
    knowledge.category as WasteAnalysisResult["primaryCategory"]
  );

  // Normalize certainty
  const finalCertainty = normalizeCertainty(parsed.certainty);

  // Normalize visibleEvidence
  const finalVisibleEvidence = normalizeStringArray(parsed.visibleEvidence, [
    "Item morphology and surface texture matched standard packaging profiles.",
  ]);

  // Normalize materials
  const finalMaterials = normalizeMaterials(
    parsed.materials,
    knowledge.primaryMaterial,
    knowledge.defaultRecyclable
  );

  // Normalize disposal instructions
  const finalDisposal = normalizeStringArray(parsed.disposalInstructions, knowledge.standardDisposal);

  // Normalize uncertainty warnings
  const finalUncertainty = normalizeStringArray(parsed.uncertaintyWarnings, [
    "Internal multi-laminate barrier coatings cannot be fully verified from 2D photos.",
    "Local municipal recycling sorting rules vary by jurisdiction.",
  ]);

  // Normalize reuseSuggestions to at least 3 items
  const extractedReuse = normalizeStringArray(parsed.reuseSuggestions, knowledge.defaultReuseIdeas);
  let finalReuse: string[] = [];
  if (extractedReuse.length >= 3) {
    finalReuse = extractedReuse.slice(0, 3);
  } else {
    finalReuse = [
      extractedReuse[0] || knowledge.defaultReuseIdeas[0],
      extractedReuse[1] || knowledge.defaultReuseIdeas[1],
      knowledge.defaultReuseIdeas[2],
    ];
  }

  // Validate or assign detailed reuse plans
  let detailedPlans: ReuseIdeaDetail[] = [];
  if (Array.isArray(parsed.detailedReusePlans) && parsed.detailedReusePlans.length > 0) {
    detailedPlans = parsed.detailedReusePlans.map((plan: any) => ({
      title: String(plan.title || `Upcycling Plan: ${finalReuse[0]}`),
      difficulty: ["Easy", "Moderate", "Advanced"].includes(plan.difficulty) ? plan.difficulty : "Easy",
      requiredMaterials: Array.isArray(plan.requiredMaterials)
        ? plan.requiredMaterials.map(String)
        : ["Household scissors", "Clean container"],
      steps: Array.isArray(plan.steps)
        ? plan.steps.map(String)
        : ["Clean item thoroughly", "Cut or repurpose for household use"],
      safetyNotes: plan.safetyNotes ? String(plan.safetyNotes) : "Take care with sharp edges.",
    }));
  } else {
    detailedPlans = [
      {
        title: `Upcycling Workshop: ${finalReuse[0]}`,
        difficulty: "Easy",
        requiredMaterials: ["Household scissors or utility knife", "Adhesive or twine", "Clean container"],
        steps: [
          "Thoroughly wash and dry the object to remove food matter and labels.",
          "Cut or reshape according to your intended household use.",
          "Inspect edges and tape or sand any sharp surfaces for safety.",
        ],
        safetyNotes: "Always wear work gloves when cutting rigid polymers or sheet metals.",
      },
    ];
  }

  // Estimated carbon saved
  let finalCarbon = knowledge.averageCo2SavedKg;
  if (typeof parsed.estimatedCarbonSavedKg === "number" && parsed.estimatedCarbonSavedKg >= 0) {
    finalCarbon = parsed.estimatedCarbonSavedKg;
  } else if (typeof parsed.estimatedCarbonSavedKg === "string") {
    const parsedNum = parseFloat(parsed.estimatedCarbonSavedKg);
    if (!isNaN(parsedNum) && parsedNum >= 0) {
      finalCarbon = parsedNum;
    }
  }

  // Build full validated payload
  const combinedPayload = {
    itemName: parsed.itemName ? String(parsed.itemName).trim() : `Item (${fileName})`,
    primaryCategory: finalCategory,
    certainty: finalCertainty,
    certaintyReasoning:
      typeof parsed.certaintyReasoning === "string" && parsed.certaintyReasoning.trim().length > 0
        ? parsed.certaintyReasoning.trim()
        : "Classification inferred from visual morphology and material cues in the uploaded photograph.",
    visibleEvidence: finalVisibleEvidence,
    materials: finalMaterials,
    recyclingCategory:
      typeof parsed.recyclingCategory === "string" && parsed.recyclingCategory.trim().length > 0
        ? parsed.recyclingCategory.trim()
        : knowledge.defaultRecyclable
        ? "Curbside Recyclable"
        : "Special Drop-Off Required",
    disposalInstructions: finalDisposal,
    contaminationRisk:
      typeof parsed.contaminationRisk === "string" && parsed.contaminationRisk.trim().length > 0
        ? parsed.contaminationRisk.trim()
        : knowledge.contaminationWarnings[0] ||
          "Check for food residue or non-removable mixed-material seals.",
    uncertaintyWarnings: finalUncertainty,
    reuseSuggestions: finalReuse,
    detailedReusePlans: detailedPlans,
    citations: knowledge.citations,
    estimatedCarbonSavedKg: finalCarbon,
    modelUsed: modelIdentifier,
    analyzedAt: new Date().toISOString(),
    municipalityNote: municipality
      ? `Tailored guidance considering municipal context for '${municipality}'. Verify exact collection rules with local public works.`
      : "Local municipal acceptance varies. Check with your city's waste authority.",
  };

  // Safe parse with Zod
  const validation = WasteAnalysisResultSchema.safeParse(combinedPayload);
  if (!validation.success) {
    const errorDetails = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`AI output failed schema validation: ${errorDetails}`);
  }

  return validation.data;
}

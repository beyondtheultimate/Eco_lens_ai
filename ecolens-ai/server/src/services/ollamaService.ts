import {
  WasteAnalysisResult,
  WasteAnalysisResultSchema,
  MaterialEstimate,
  ReuseIdeaDetail,
} from "../schemas/analysisSchema.js";
import { queryKnowledgeBase } from "./knowledgeBase.js";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const TARGET_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

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
  const geminiConfigured = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim() !== "");

  // Check Ollama
  let ollamaOnline = false;
  let ollamaModelInstalled = false;
  let installedModels: string[] = [];

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
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

  // Determine active provider
  let activeProvider: "ollama" | "gemini" | "none" = "none";
  let activeModel = "None";

  if (ollamaModelInstalled) {
    activeProvider = "ollama";
    activeModel = TARGET_MODEL;
  } else if (geminiConfigured) {
    activeProvider = "gemini";
    activeModel = GEMINI_MODEL;
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
      geminiModel: GEMINI_MODEL,
    },
  };
}

// Kept for backward compatibility with health endpoint
export async function checkOllamaHealth() {
  const v = await checkVisionHealth();
  return v.ollama;
}

export interface RawVisionOutput {
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
  estimatedCarbonSavedKg?: number;
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
 * Execute vision inference using either local Ollama or hosted Gemini
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
        `Ollama is online at ${health.ollama.ollamaHost}, but model '${health.ollama.targetModel}' has not been pulled. Currently installed models: [${health.ollama.installedModels.join(
          ", "
        ) || "none"}]. Please run 'ollama pull ${health.ollama.targetModel}' locally, or configure GEMINI_API_KEY in environment variables for hosted cloud inference.`
      );
    }

    throw new Error(
      `No vision inference service is available. For local inference: launch Ollama and pull '${health.ollama.targetModel}'. For hosted cloud deployment: set GEMINI_API_KEY in your server environment variables.`
    );
  }

  let rawJsonText = "";
  let modelIdentifier = "";

  // 1. If Ollama has the model installed, prioritize local Ollama
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

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(90000),
    });

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
    modelIdentifier = `${GEMINI_MODEL} (Google Hosted Vision)`;

    const promptText = municipality
      ? `${SYSTEM_PROMPT}\n\nUser Municipality context: ${municipality}.\nAnalyze this uploaded waste photo and provide structured circular analysis.`
      : `${SYSTEM_PROMPT}\n\nAnalyze this uploaded waste photo and provide structured circular analysis.`;

    // Standardize MIME type for Gemini
    let cleanMime = mimeType.toLowerCase();
    if (cleanMime === "image/jfif" || cleanMime === "image/pjpeg" || cleanMime === "application/octet-stream") {
      cleanMime = "image/jpeg";
    }

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
      GEMINI_API_KEY
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Vision API error (${response.status}): ${errText}`);
    }

    const geminiData = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
    parsed.materials || []
  )
    .map((m) => m.material)
    .join(" ")}`;
  const knowledge = queryKnowledgeBase(queryTerms);

  // Normalize reuseSuggestions to at least 3 items
  let finalReuse: string[] = [];
  if (Array.isArray(parsed.reuseSuggestions) && parsed.reuseSuggestions.length >= 3) {
    finalReuse = parsed.reuseSuggestions.slice(0, 3);
  } else if (Array.isArray(parsed.reuseSuggestions) && parsed.reuseSuggestions.length > 0) {
    finalReuse = [
      parsed.reuseSuggestions[0],
      parsed.reuseSuggestions[1] || knowledge.defaultReuseIdeas[1],
      parsed.reuseSuggestions[2] || knowledge.defaultReuseIdeas[2],
    ];
  } else {
    finalReuse = [...knowledge.defaultReuseIdeas];
  }

  // Validate or assign detailed reuse plans
  let detailedPlans: ReuseIdeaDetail[] = [];
  if (Array.isArray(parsed.detailedReusePlans) && parsed.detailedReusePlans.length > 0) {
    detailedPlans = parsed.detailedReusePlans;
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

  // Build full validated payload
  const combinedPayload = {
    itemName: parsed.itemName || `Item (${fileName})`,
    primaryCategory: parsed.primaryCategory || knowledge.category,
    certainty: parsed.certainty || "medium",
    certaintyReasoning:
      parsed.certaintyReasoning ||
      "Classification inferred from visual morphology and material cues in the uploaded photograph.",
    visibleEvidence:
      Array.isArray(parsed.visibleEvidence) && parsed.visibleEvidence.length > 0
        ? parsed.visibleEvidence
        : ["Item morphology and surface texture matched standard packaging profiles."],
    materials:
      Array.isArray(parsed.materials) && parsed.materials.length > 0
        ? parsed.materials
        : [
            {
              material: knowledge.primaryMaterial,
              percentage: 100,
              recyclable: knowledge.defaultRecyclable,
            },
          ],
    recyclingCategory:
      parsed.recyclingCategory ||
      (knowledge.defaultRecyclable ? "Curbside Recyclable" : "Special Drop-Off Required"),
    disposalInstructions:
      Array.isArray(parsed.disposalInstructions) && parsed.disposalInstructions.length > 0
        ? parsed.disposalInstructions
        : knowledge.standardDisposal,
    contaminationRisk:
      parsed.contaminationRisk ||
      knowledge.contaminationWarnings[0] ||
      "Check for food residue or non-removable mixed-material seals.",
    uncertaintyWarnings:
      Array.isArray(parsed.uncertaintyWarnings) && parsed.uncertaintyWarnings.length > 0
        ? parsed.uncertaintyWarnings
        : [
            "Internal multi-laminate barrier coatings cannot be fully verified from 2D photos.",
            "Local municipal recycling sorting rules vary by jurisdiction.",
          ],
    reuseSuggestions: finalReuse,
    detailedReusePlans: detailedPlans,
    citations: knowledge.citations,
    estimatedCarbonSavedKg:
      typeof parsed.estimatedCarbonSavedKg === "number" && parsed.estimatedCarbonSavedKg > 0
        ? parsed.estimatedCarbonSavedKg
        : knowledge.averageCo2SavedKg,
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

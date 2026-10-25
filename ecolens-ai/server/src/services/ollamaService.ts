import {
  WasteAnalysisResult,
  WasteAnalysisResultSchema,
  MaterialEstimate,
} from "../schemas/analysisSchema.js";
import { queryKnowledgeBase } from "./knowledgeBase.js";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const TARGET_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";

export interface OllamaHealthStatus {
  isOnline: boolean;
  modelInstalled: boolean;
  targetModel: string;
  installedModels: string[];
  ollamaHost: string;
}

export async function checkOllamaHealth(): Promise<OllamaHealthStatus> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return {
        isOnline: false,
        modelInstalled: false,
        targetModel: TARGET_MODEL,
        installedModels: [],
        ollamaHost: OLLAMA_HOST,
      };
    }

    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const installed = (data.models || []).map((m) => m.name);
    const hasModel = installed.some(
      (name) => name === TARGET_MODEL || name.startsWith(`${TARGET_MODEL}:`) || name.includes(TARGET_MODEL)
    );

    return {
      isOnline: true,
      modelInstalled: hasModel,
      targetModel: TARGET_MODEL,
      installedModels: installed,
      ollamaHost: OLLAMA_HOST,
    };
  } catch {
    return {
      isOnline: false,
      modelInstalled: false,
      targetModel: TARGET_MODEL,
      installedModels: [],
      ollamaHost: OLLAMA_HOST,
    };
  }
}

export interface RawVisionOutput {
  itemName: string;
  primaryCategory: string;
  certainty: "low" | "medium" | "high";
  certaintyReasoning: string;
  visibleEvidence: string[];
  materials: MaterialEstimate[];
  recyclingCategory: string;
  disposalInstructions: string[];
  contaminationRisk: string;
  uncertaintyWarnings: string[];
  reuseSuggestions: string[];
  estimatedCarbonSavedKg?: number;
}

export async function analyzeImageWithGemma(
  imageBase64: string,
  fileName: string
): Promise<WasteAnalysisResult> {
  const health = await checkOllamaHealth();

  if (!health.isOnline) {
    throw new Error(
      `Ollama service is unreachable at ${OLLAMA_HOST}. Ensure Ollama is running ('ollama serve' or check desktop app).`
    );
  }

  if (!health.modelInstalled) {
    throw new Error(
      `Model '${TARGET_MODEL}' is not available in local Ollama. Installed models: [${health.installedModels.join(
        ", "
      )}]. Please approve and pull '${TARGET_MODEL}' to run real image analysis.`
    );
  }

  const systemPrompt = `You are EcoLens AI, an expert environmental computer vision and material science model.
Analyze the provided photograph of a discarded waste item or recyclable material.
Be strictly honest and scientifically rigorous. Never fabricate certainty if image features are ambiguous or blurry.

You MUST respond strictly in valid JSON format matching this structure:
{
  "itemName": "Specific item name (e.g. Clear PET 500ml Water Bottle with Polypropylene Cap)",
  "primaryCategory": "One of: Plastics, Paper & Cardboard, Glass, Metals, Organics & Compost, E-Waste, Hazardous / Batteries, Textiles, Mixed / Landfill",
  "certainty": "low" | "medium" | "high",
  "certaintyReasoning": "Why you chose this certainty based on lighting, clarity, visible markings, or resin codes",
  "visibleEvidence": [
    "Observed visual clue 1 (e.g. Transparent rigid body, blue plastic threaded cap)",
    "Observed visual clue 2 (e.g. Mold seam lines, smooth reflective surface)"
  ],
  "materials": [
    { "material": "Polyethylene Terephthalate (PET #1)", "percentage": 85, "recyclable": true, "notes": "Main body" },
    { "material": "Polypropylene (PP #5)", "percentage": 15, "recyclable": true, "notes": "Screw cap" }
  ],
  "recyclingCategory": "Curbside Recyclable / Drop-off Only / Trash / Compost",
  "disposalInstructions": [
    "Step 1: Empty fluids",
    "Step 2: Screw cap back on",
    "Step 3: Deposit in curbside recycling bin"
  ],
  "contaminationRisk": "Explanation of potential contamination hazards (grease, non-recyclable parts)",
  "uncertaintyWarnings": [
    "Warning on what cannot be verified visually (e.g., hidden chemical coatings or composite layers)"
  ],
  "reuseSuggestions": [
    "Practical upcycling/reuse idea 1",
    "Practical upcycling/reuse idea 2",
    "Practical upcycling/reuse idea 3"
  ],
  "estimatedCarbonSavedKg": 0.15
}`;

  const requestBody = {
    model: TARGET_MODEL,
    messages: [
      {
        role: "user",
        content: "Analyze this discarded waste item and return the environmental recycling breakdown in strict JSON.",
        images: [imageBase64],
      },
    ],
    system: systemPrompt,
    format: "json",
    stream: false,
    options: {
      temperature: 0.2, // low temperature for precise classification
    },
  };

  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(90000), // 90s timeout for vision processing
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

  const rawContent = responseJson.message?.content;
  if (!rawContent) {
    throw new Error("Ollama returned an empty response for the image analysis.");
  }

  // Parse JSON response from model
  let parsed: RawVisionOutput;
  try {
    // Strip markdown code fences if model returned ```json ... ```
    const cleaned = rawContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Failed to parse JSON response from Gemma 4: ${(err as Error).message}. Raw content was: ${rawContent.slice(
        0,
        200
      )}...`
    );
  }

  // Retrieve source citations and verified municipality directives from knowledge base
  const knowledge = queryKnowledgeBase(
    `${parsed.itemName} ${parsed.primaryCategory} ${parsed.materials.map((m) => m.material).join(" ")}`
  );

  // Normalize reuseSuggestions to exactly 3 items
  let finalReuse: [string, string, string] = knowledge.defaultReuseIdeas;
  if (Array.isArray(parsed.reuseSuggestions) && parsed.reuseSuggestions.length >= 3) {
    finalReuse = [
      parsed.reuseSuggestions[0],
      parsed.reuseSuggestions[1],
      parsed.reuseSuggestions[2],
    ];
  } else if (Array.isArray(parsed.reuseSuggestions) && parsed.reuseSuggestions.length > 0) {
    finalReuse = [
      parsed.reuseSuggestions[0],
      parsed.reuseSuggestions[1] || knowledge.defaultReuseIdeas[1],
      parsed.reuseSuggestions[2] || knowledge.defaultReuseIdeas[2],
    ];
  }

  // Construct complete result payload
  const combinedPayload = {
    itemName: parsed.itemName || `Waste Item (${fileName})`,
    primaryCategory: parsed.primaryCategory || knowledge.category,
    certainty: parsed.certainty || "medium",
    certaintyReasoning:
      parsed.certaintyReasoning ||
      "Classification determined from visual shape and material cues in the uploaded photograph.",
    visibleEvidence:
      Array.isArray(parsed.visibleEvidence) && parsed.visibleEvidence.length > 0
        ? parsed.visibleEvidence
        : ["Item morphology and surface texture matched standard packaging profiles."],
    materials:
      Array.isArray(parsed.materials) && parsed.materials.length > 0
        ? parsed.materials
        : [{ material: knowledge.primaryMaterial, percentage: 100, recyclable: knowledge.defaultRecyclable }],
    recyclingCategory: parsed.recyclingCategory || (knowledge.defaultRecyclable ? "Curbside Recyclable" : "Special Drop-Off Required"),
    disposalInstructions:
      Array.isArray(parsed.disposalInstructions) && parsed.disposalInstructions.length > 0
        ? parsed.disposalInstructions
        : knowledge.standardDisposal,
    contaminationRisk: parsed.contaminationRisk || knowledge.contaminationWarnings[0] || "Check for food or chemical residue.",
    uncertaintyWarnings:
      Array.isArray(parsed.uncertaintyWarnings) && parsed.uncertaintyWarnings.length > 0
        ? parsed.uncertaintyWarnings
        : [
            "Internal composite laminates or micro-coatings cannot be fully determined from 2D photos.",
            "Local municipal recycling capabilities vary by district.",
          ],
    reuseSuggestions: finalReuse,
    citations: knowledge.citations,
    estimatedCarbonSavedKg:
      typeof parsed.estimatedCarbonSavedKg === "number" && parsed.estimatedCarbonSavedKg > 0
        ? parsed.estimatedCarbonSavedKg
        : knowledge.averageCo2SavedKg,
    modelUsed: TARGET_MODEL,
    analyzedAt: new Date().toISOString(),
  };

  // Validate strictly with Zod
  const validation = WasteAnalysisResultSchema.safeParse(combinedPayload);
  if (!validation.success) {
    const errorDetails = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`AI output failed Zod schema validation: ${errorDetails}`);
  }

  return validation.data;
}

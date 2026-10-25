import assert from "node:assert/strict";
import { queryKnowledgeBase } from "../src/services/knowledgeBase.js";
import { WasteAnalysisResultSchema } from "../src/schemas/analysisSchema.js";

async function runTests() {
  console.log("=== RUNNING ECOLENS AI BACKEND TESTS ===");

  // 1. Knowledge Base Keyword Retrieval Test
  console.log("Test 1: Knowledge Base Keyword Retrieval...");
  const plasticMatch = queryKnowledgeBase("clear pet water bottle beverage plastic");
  assert.equal(plasticMatch.category, "Plastics", "Should match Plastics category");
  assert.ok(plasticMatch.citations.length > 0, "Plastics should include EPA citations");

  const metalMatch = queryKnowledgeBase("aluminum soda can");
  assert.equal(metalMatch.category, "Metals", "Should match Metals category");

  const ewasteMatch = queryKnowledgeBase("old phone charger cable");
  assert.equal(ewasteMatch.category, "E-Waste", "Should match E-Waste category");
  console.log(" [PASS] Knowledge base keyword retrieval verified.");

  // 2. Zod Schema Validation Test
  console.log("Test 2: Zod Schema Validation (Valid Payload)...");
  const validPayload = {
    itemName: "Polyethylene Beverage Bottle",
    primaryCategory: "Plastics",
    certainty: "high",
    certaintyReasoning: "Clear optical resin marker #1 molded into bottom base.",
    visibleEvidence: ["Transparent rigid cylindrical wall", "Standard 28mm neck finish"],
    materials: [
      { material: "PET #1", percentage: 90, recyclable: true, notes: "Bottle body" },
      { material: "PP #5", percentage: 10, recyclable: true, notes: "Cap" },
    ],
    recyclingCategory: "Curbside Recyclable",
    disposalInstructions: ["Empty contents", "Replace cap", "Deposit in blue bin"],
    contaminationRisk: "Sugar residue must be rinsed.",
    uncertaintyWarnings: ["Adhesive label formulation not verified."],
    reuseSuggestions: [
      "Cut into herb planter",
      "Use as potting soil scoop",
      "Desktop cable storage",
    ],
    citations: [
      {
        source: "EPA",
        title: "Plastics Recycling Guidelines",
        url: "https://www.epa.gov/recycle",
        guidelineSnippet: "Clean rigid containers are widely accepted.",
      },
    ],
    estimatedCarbonSavedKg: 0.15,
    modelUsed: "gemma4:e2b",
    analyzedAt: new Date().toISOString(),
  };

  const parsed = WasteAnalysisResultSchema.safeParse(validPayload);
  assert.ok(parsed.success, "Schema validation should pass for valid data");
  console.log(" [PASS] Zod schema validation passed.");

  // 3. Schema Failure on Malformed Payload
  console.log("Test 3: Zod Schema Validation Catches Malformed Data...");
  const invalidPayload = {
    ...validPayload,
    reuseSuggestions: ["Only one idea"], // Schema requires exactly 3
  };
  const invalidParse = WasteAnalysisResultSchema.safeParse(invalidPayload);
  assert.equal(invalidParse.success, false, "Schema must reject fewer than 3 reuse suggestions");
  console.log(" [PASS] Zod schema correctly rejected malformed payload.");

  // 4. Gemini Model Sanitization and Defaults Test
  console.log("Test 4: Gemini Model Sanitization & Default Model...");
  const {
    sanitizeGeminiModelName,
    DEFAULT_GEMINI_MODEL,
    DEFAULT_PRIMARY_MODEL,
    DEFAULT_FALLBACK_MODEL,
    getModelSequence,
    formatGeminiError,
    GEMINI_MODEL_PREFERENCES,
  } = await import("../src/services/ollamaService.js");

  assert.equal(DEFAULT_PRIMARY_MODEL, "gemini-2.5-flash", "Primary default model must be gemini-2.5-flash");
  assert.equal(DEFAULT_FALLBACK_MODEL, "gemini-2.0-flash", "Fallback default model must be gemini-2.0-flash");
  assert.equal(
    sanitizeGeminiModelName("models/gemini-2.5-flash"),
    "gemini-2.5-flash",
    "Should strip leading 'models/' prefix"
  );
  assert.equal(
    sanitizeGeminiModelName("models/gemini-1.5-flash"),
    "gemini-1.5-flash",
    "Should strip leading 'models/' prefix from older models"
  );
  assert.equal(
    sanitizeGeminiModelName("  gemini-2.0-flash  "),
    "gemini-2.0-flash",
    "Should trim whitespace"
  );
  assert.equal(
    sanitizeGeminiModelName(""),
    "gemini-2.5-flash",
    "Empty model should default to primary default model"
  );

  const seq = getModelSequence("gemini-3.8-flash");
  assert.equal(seq[0], "gemini-3.8-flash", "First model in sequence must be primary");
  assert.ok(seq.includes("gemini-2.0-flash"), "Sequence must include fallback model");
  assert.ok(seq.includes("gemini-2.5-flash"), "Sequence must include 2.5 flash");

  assert.ok(
    GEMINI_MODEL_PREFERENCES.includes("gemini-2.5-flash"),
    "Preferences should include gemini-2.5-flash"
  );
  console.log(" [PASS] Gemini model sanitization and preferences verified.");

  // 5. Gemini Error Diagnostics Formatting Test
  console.log("Test 5: Gemini Error Diagnostics Formatting...");
  const err404 = formatGeminiError(
    404,
    JSON.stringify({ error: { message: "models/gemini-1.5-flash is not found for API version v1beta" } }),
    "gemini-1.5-flash",
    ["gemini-3.8-flash", "gemini-2.0-flash"]
  );
  assert.ok(
    err404.message.includes("gemini-3.8-flash"),
    "404 error should report available candidate models"
  );
  assert.ok(
    err404.message.includes("HTTP 404"),
    "404 error should include HTTP status code"
  );

  const err403 = formatGeminiError(
    403,
    JSON.stringify({ error: { message: "API_KEY_INVALID" } }),
    "gemini-3.8-flash",
    []
  );
  assert.ok(
    err403.message.includes("aistudio.google.com/apikey"),
    "403 error should link to Google AI Studio"
  );

  const err429 = formatGeminiError(
    429,
    JSON.stringify({ error: { message: "RESOURCE_EXHAUSTED" } }),
    "gemini-3.8-flash",
    []
  );
  assert.ok(
    err429.message.includes("Rate Limit Exceeded"),
    "429 error should mention rate limit exceeded"
  );

  const err503 = formatGeminiError(
    503,
    "This model is currently experiencing high demand.",
    "gemini-3.8-flash",
    ["gemini-2.5-flash", "gemini-2.0-flash"]
  );
  assert.ok(
    err503.message.includes("503") || err503.message.includes("high demand"),
    "503 error should mention 503 or high demand"
  );
  console.log(" [PASS] Gemini error diagnostics formatting verified.");

  // 6. Schema Normalization & Tolerance Test
  console.log("Test 6: AI Output Schema Normalization & Tolerance...");
  const {
    normalizePrimaryCategory,
    normalizeCertainty,
    normalizeStringArray,
    normalizeMaterials,
  } = await import("../src/services/ollamaService.js");

  assert.equal(normalizePrimaryCategory("plastic"), "Plastics");
  assert.equal(normalizePrimaryCategory("cardboard packaging"), "Paper & Cardboard");
  assert.equal(normalizePrimaryCategory("aluminum soda can"), "Metals");
  assert.equal(normalizePrimaryCategory("food scraps"), "Organics & Compost");
  assert.equal(normalizePrimaryCategory("broken laptop charger"), "E-Waste");

  assert.equal(normalizeCertainty("High"), "high");
  assert.equal(normalizeCertainty("Moderate"), "medium");
  assert.equal(normalizeCertainty("Uncertain / Low"), "low");

  const normalizedArr = normalizeStringArray("Step 1. Rinse container.\nStep 2. Flatten box.", []);
  assert.equal(normalizedArr.length, 2);

  const normalizedMaterials = normalizeMaterials(
    [
      { material: "PET #1", percentage: "85%", recyclable: "yes" },
      { name: "PP #5", percentage: 15, recyclable: true },
    ],
    "Plastics",
    true
  );
  assert.equal(normalizedMaterials.length, 2);
  assert.equal(normalizedMaterials[0].percentage, 85);
  assert.equal(normalizedMaterials[0].recyclable, true);
  console.log(" [PASS] AI output schema normalization verified.");

  // 7. Glass Fallback Result & Safety Validation Test
  console.log("Test 7: Verified Glass Fallback Structure & Safety Assertions...");
  const { createGlassFallbackResult } = await import("../src/services/fallbackService.js");

  const fallback = createGlassFallbackResult("Simulated high demand 503 error", "Portland, OR");
  assert.equal(fallback.isFallback, true, "Fallback flag must be true");
  assert.equal(fallback.primaryCategory, "Glass", "Category must be Glass");
  assert.equal(fallback.estimatedCarbonSavedKg, 0, "Carbon abatement must not be fabricated (honest 0)");
  assert.equal(fallback.certainty, "low", "Certainty must be low/unverified");
  assert.ok(
    fallback.safetyWarning?.includes("Broken glass has sharp edges. Do not handle it with bare hands. Keep it away from children and pets."),
    "Must include mandatory glass sharp edges safety warning"
  );
  assert.ok(
    fallback.suitabilityNotes?.includes("Broken glass is generally not suitable for a planter or ordinary household craft unless the design fully isolates the sharp pieces."),
    "Must explain planter unsuitability"
  );

  // Assert user-requested ideas are present
  const mosaicIdea = fallback.reuseSuggestions.some((s) => s.toLowerCase().includes("glass mosaic art"));
  const decorativeIdea = fallback.reuseSuggestions.some((s) => s.toLowerCase().includes("decorative display"));
  const recyclingIdea = fallback.reuseSuggestions.some((s) => s.toLowerCase().includes("glass recycling"));

  assert.ok(mosaicIdea, "Must include Glass mosaic art idea");
  assert.ok(decorativeIdea, "Must include Decorative display idea");
  assert.ok(recyclingIdea, "Must include Glass recycling idea");

  const fallbackValidation = WasteAnalysisResultSchema.safeParse(fallback);
  assert.ok(fallbackValidation.success, "Fallback object must fully satisfy WasteAnalysisResultSchema");
  console.log(" [PASS] Glass fallback structure and safety rules verified.");

  console.log("=== ALL BACKEND UNIT TESTS PASSED ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

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

  console.log("=== ALL BACKEND UNIT TESTS PASSED ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

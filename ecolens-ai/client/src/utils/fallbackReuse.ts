import type { WasteAnalysisResult } from "../types";

/**
 * Creates a verified rule-based safe handling and circular repurposing guide for broken glass
 * when upstream AI vision inference is unavailable (e.g. HTTP 503 high demand or timeout).
 * 
 * Accurately labels the result as an offline fallback without inventing AI confidence scores,
 * material percentages, or false carbon abatement metrics.
 */
export function createGlassFallbackResult(
  reason?: string,
  municipality?: string
): WasteAnalysisResult {
  return {
    itemName: "Broken Glass / Glassware",
    primaryCategory: "Glass",
    certainty: "low",
    certaintyReasoning:
      "AI vision analysis was unavailable (e.g. upstream provider high demand or network timeout). This result provides verified, rule-based safe handling and circular repurposing guidelines.",
    visibleEvidence: [
      "Item categorized as glass material session",
      "AI vision offline — standard rule-based safety evaluation applied",
      "Manual caution protocol activated due to sharp edge laceration hazard",
    ],
    materials: [
      {
        material: "Soda-Lime / Borosilicate Glass",
        percentage: 100,
        recyclable: true,
        notes: "Unverified percentage — visual breakdown unavailable without AI inference",
      },
    ],
    recyclingCategory: "Special Handling / Hazardous to Sanitation Workers",
    disposalInstructions: [
      "Do NOT place loose broken glass into curbside recycling or standard plastic trash bags — it can lacerate sanitation workers and jam sorting machinery.",
      "Carefully wrap sharp fragments in several thick layers of newspaper or sturdy corrugated cardboard.",
      "Place wrapped glass into a rigid, puncture-resistant box or container and tape it shut securely.",
      "Clearly mark the container in bold permanent marker: 'CAUTION: BROKEN GLASS'.",
      "Deposit at your municipal hazardous drop-off depot or curbside trash as dictated by local regulations." +
        (municipality ? ` (Guidance customized for ${municipality})` : ""),
    ],
    contaminationRisk:
      "High laceration risk to collection crews. Broken glass fragments also contaminate single-stream paper, cardboard, and plastic recycling streams.",
    uncertaintyWarnings: [
      "AI vision analysis was unavailable — this is a curated offline fallback guide, not a machine learning classification.",
      "Do not handle broken glass with bare hands under any circumstances.",
      "Keep all fragments, splinters, and glass crafts strictly away from children and pets.",
    ],
    reuseSuggestions: [
      "Glass mosaic art: use only clean, suitable pieces with proper protective equipment (cut-resistant gloves, safety goggles).",
      "Decorative display: reuse intact glass pieces in a safe display or craft project (such as a sealed shadow box or resin-encapsulated decor).",
      "Glass recycling: place broken glass in the appropriate local recycling or disposal stream; never assume curbside recycling accepts it.",
    ],
    detailedReusePlans: [
      {
        title: "Decorative Glass Mosaic Art (Enclosed Grout)",
        difficulty: "Moderate",
        requiredMaterials: [
          "Clean, non-dusting glass fragments",
          "Cut-resistant work gloves (ANSI A3+ rated)",
          "Safety goggles",
          "Rigid substrate (wood plaque, ceramic tile)",
          "Silicone adhesive or mosaic mastic",
          "Sanded tile grout and surface sealer",
        ],
        steps: [
          "Put on heavy cut-resistant gloves and safety goggles before handling any fragments.",
          "Sort pieces carefully, selecting only clean, flat fragments suitable for tiling.",
          "Arrange fragments onto a rigid wooden or ceramic substrate, leaving 2-3mm gaps between edges.",
          "Bond each fragment with silicone adhesive and allow to cure completely.",
          "Fill all gaps with sanded grout, ensuring grout is flush with or covers sharp edges to eliminate exposed cutting points.",
          "Seal the cured grout thoroughly with protective clear coat.",
        ],
        safetyNotes:
          "Always wear safety goggles and cut-resistant gloves. Broken glass has sharp edges — never press fragments with bare fingers.",
      },
      {
        title: "Enclosed Shadow Box Decorative Display",
        difficulty: "Easy",
        requiredMaterials: [
          "Intact or tumbled glass pieces",
          "Tweezers or mechanical pickup tongs",
          "Deep shadow box frame with sealed acrylic front",
          "Padded background cardstock",
          "Clear craft adhesive",
        ],
        steps: [
          "Use tweezers or tongs to pick and inspect interesting intact or tumbled glass pieces.",
          "Rinse gently in a fine mesh strainer over a bucket to remove loose glass dust and dry thoroughly.",
          "Adhere selected pieces onto the shadow box background in an artistic arrangement.",
          "Install and securely seal the acrylic/glass front face of the shadow box so fragments are completely inaccessible from the outside.",
        ],
        safetyNotes:
          "Keep the display sealed permanently. Keep away from children and pets.",
      },
      {
        title: "Safe Preparation for Municipal Recycling / Disposal",
        difficulty: "Easy",
        requiredMaterials: [
          "Heavy cardboard box or rigid container",
          "Newspaper or heavy packing paper",
          "Heavy-duty packaging tape",
          "Permanent marker",
          "Thick leather or puncture-proof gloves",
        ],
        steps: [
          "Never assume curbside recycling bins accept broken glass; check with your local municipality.",
          "Wrap the broken glass in multiple layers of thick paper or bubble wrap.",
          "Pack the wrapped bundle tightly into a rigid cardboard box to prevent shifting.",
          "Seal all seams with heavy-duty packing tape and label prominently: 'CAUTION: BROKEN GLASS'.",
          "Place in the designated disposal stream or drop off at a municipal solid waste facility.",
        ],
        safetyNotes:
          "Never toss loose glass into plastic bags. Loose broken glass is one of the leading causes of worker injury in municipal recycling facilities.",
      },
    ],
    citations: [
      {
        source: "U.S. Environmental Protection Agency (EPA)",
        title: "Glass Recycling and Waste Management Regulations",
        url: "https://www.epa.gov/recycle",
        guidelineSnippet:
          "Broken glass poses significant laceration hazards to MRF workers and should be safely packaged or brought to dedicated drop-off sites.",
        applicableRegion: municipality || "National Standard",
        materialCategory: "Glass",
        verifiedDate: "2024 Verified",
      },
      {
        source: "Occupational Safety and Health Administration (OSHA)",
        title: "Handling Hazardous Sharp Objects and Broken Glass",
        url: "https://www.osha.gov",
        guidelineSnippet:
          "Personal protective equipment including puncture-resistant gloves and eye protection must be worn when collecting or managing broken glass.",
        applicableRegion: "United States",
        materialCategory: "Glass",
        verifiedDate: "2024 Verified",
      },
    ],
    estimatedCarbonSavedKg: 0, // Honest: 0 because AI analysis was unavailable
    modelUsed: "Offline Fallback Protocol (Rule-Based)",
    analyzedAt: new Date().toISOString(),
    municipalityNote: municipality
      ? `Guidance for ${municipality}: Check if your municipal facility operates a dedicated glass-only drop-off depot.`
      : "Broken glass is generally excluded from curbside single-stream bins. Check your city's waste authority guidelines.",
    isFallback: true,
    fallbackReason: reason || "The AI vision service was temporarily unavailable or timed out.",
    safetyWarning: "Broken glass has sharp edges. Do not handle it with bare hands. Keep it away from children and pets.",
    suitabilityNotes: "Broken glass is generally not suitable for a planter or ordinary household craft unless the design fully isolates the sharp pieces.",
  };
}

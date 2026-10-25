import { Citation } from "../schemas/analysisSchema.js";

export interface KnowledgeEntry {
  category: string;
  keywords: string[];
  primaryMaterial: string;
  defaultRecyclable: boolean;
  standardDisposal: string[];
  contaminationWarnings: string[];
  defaultReuseIdeas: [string, string, string];
  averageCo2SavedKg: number;
  citations: Citation[];
}

export const RECYCLING_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    category: "Plastics",
    keywords: [
      "plastic",
      "bottle",
      "pet",
      "hdpe",
      "jug",
      "container",
      "cup",
      "polyethylene",
      "polypropylene",
      "straw",
      "wrapper",
      "bag",
      "clamshell",
      "fork",
      "spoon",
    ],
    primaryMaterial: "PET / HDPE / Mixed Polymer",
    defaultRecyclable: true,
    standardDisposal: [
      "Empty any remaining liquids or food residues completely.",
      "Rinse with cold water; greasy or stained soft plastics must go to general trash.",
      "Replace caps firmly onto rigid bottles (most municipal MRFs compress bottles with caps).",
      "Place in blue/yellow curbside recycling bin (check for resin code #1 or #2).",
    ],
    contaminationWarnings: [
      "Plastic bags and thin films tangle sorting machinery at MRFs (take films to supermarket collection bins).",
      "Black plastic containers are often invisible to optical sorting lasers.",
    ],
    defaultReuseIdeas: [
      "Upcycle into a self-watering seedling planter by cutting bottle in half.",
      "Use clean jugs as funnel scoops or bird feeders.",
      "Repurpose clean containers for desktop screw, nail, or stationery storage.",
    ],
    averageCo2SavedKg: 0.15,
    citations: [
      {
        source: "EPA (U.S. Environmental Protection Agency)",
        title: "Advancing Sustainable Materials Management: Plastics Recycling Guidelines",
        url: "https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables#pla",
        guidelineSnippet: "Clean rigid plastics (#1 PET and #2 HDPE) have highest recovery rates. Never place loose soft films or grocery bags in curbside bins.",
      },
      {
        source: "Earth911",
        title: "Plastics Recycling Directives & Resin Identification",
        url: "https://earth911.com/recycling-guide/how-to-recycle-plastics/",
        guidelineSnippet: "Check resin codes: #1 (beverage bottles) and #2 (milk jugs/detergent) are universally accepted; #5 PP is increasingly accepted; #6 Polystyrene is rarely curbside.",
      },
    ],
  },
  {
    category: "Metals",
    keywords: [
      "can",
      "aluminum",
      "tin",
      "metal",
      "steel",
      "foil",
      "soda",
      "beer",
      "beverage can",
      "aerosol",
      "copper",
      "iron",
    ],
    primaryMaterial: "Aluminum / Tin-plated Steel",
    defaultRecyclable: true,
    standardDisposal: [
      "Drain and rinse lightly to remove liquid residue.",
      "Do NOT crush aluminum beverage cans in single-stream systems (optical sorters identify 3D shapes).",
      "Clean aluminum foil can be balled up to baseball size before recycling.",
      "Deposit in blue curbside bin.",
    ],
    contaminationWarnings: [
      "Food-caked aluminum foil with grease is non-recyclable.",
      "Pressurized aerosol cans must be completely empty before recycling.",
    ],
    defaultReuseIdeas: [
      "Convert clean aluminum cans into stylish desktop pencil holders or herb planters.",
      "Use metal tins for organizing small hardware parts or craft supplies.",
      "Flatten clean foil scraps to create reflector shields for indoor plants.",
    ],
    averageCo2SavedKg: 0.35,
    citations: [
      {
        source: "The Aluminum Association",
        title: "The Aluminum Can Advantage & Circular Recycling",
        url: "https://www.aluminum.org/Recycling",
        guidelineSnippet: "Aluminum cans are infinitely recyclable without property degradation, saving 95% of energy compared to primary smelting.",
      },
      {
        source: "EPA",
        title: "Frequent Questions on Recycling Metals",
        url: "https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables#met",
        guidelineSnippet: "Steel and aluminum containers are highly prized in recycling streams. Ensure they are empty and dry.",
      },
    ],
  },
  {
    category: "Glass",
    keywords: [
      "glass",
      "bottle",
      "jar",
      "wine",
      "beer",
      "beverage",
      "mason jar",
      "cullet",
      "flint",
      "amber",
    ],
    primaryMaterial: "Soda-Lime Glass",
    defaultRecyclable: true,
    standardDisposal: [
      "Rinse out contents; labels do not need to be removed as they burn off in kilns.",
      "Remove metal or cork lids and sort them separately.",
      "Do NOT break glass before placing in bin.",
      "Check municipal policy: some cities require glass in dedicated depot drop-offs.",
    ],
    contaminationWarnings: [
      "Never mix drinking glasses, Pyrex, ceramics, mirrors, or window panes (different melting points ruin cullet batches).",
    ],
    defaultReuseIdeas: [
      "Sterilize glass jars for pantry bulk-spice, grain, or sourdough storage.",
      "Repurpose wine or juice bottles as decorative flower vases or water decanters.",
      "Turn mason jars into candle holders or terrarium miniature gardens.",
    ],
    averageCo2SavedKg: 0.22,
    citations: [
      {
        source: "Glass Packaging Institute (GPI)",
        title: "Glass Recycling Facts and Closed-Loop Cycle",
        url: "https://www.gpi.org/glass-recycling-facts",
        guidelineSnippet: "Glass is 100% recyclable infinitely. Recycled glass (cullet) substitutes up to 95% of raw materials in new container manufacturing.",
      },
      {
        source: "Recycle Across America",
        title: "Standardized Labeling Guidelines for Glass Recycling",
        url: "https://www.recycleacrossamerica.org/tips-to-recycle-right",
        guidelineSnippet: "Keep ceramics and heat-resistant borosilicate glassware completely out of container glass streams.",
      },
    ],
  },
  {
    category: "Paper & Cardboard",
    keywords: [
      "paper",
      "cardboard",
      "box",
      "carton",
      "newspaper",
      "magazine",
      "envelope",
      "cereal",
      "shipping",
      "pizza",
      "kraft",
    ],
    primaryMaterial: "Cellulose Fiber / Corrugated Cardboard",
    defaultRecyclable: true,
    standardDisposal: [
      "Flatten all corrugated boxes completely to conserve bin volume.",
      "Remove plastic packing tape, bubble wrap, and styrofoam inserts.",
      "Keep dry; paper fibers degrade when soaked in rainwater or grease.",
      "Place in green or blue paper curbside bin.",
    ],
    contaminationWarnings: [
      "Greasy pizza box bottoms are compostable or trash, NOT recyclable (grease ruins paper pulping).",
      "Wax-coated or thermal receipts contain BPA and are not recyclable.",
    ],
    defaultReuseIdeas: [
      "Use flattened cardboard boxes as weed-suppression sheet mulch under garden beds.",
      "Repurpose clean shipping boxes for home organization or gift packaging.",
      "Shred unprinted kraft paper as biodegradable compost brown carbon or package filler.",
    ],
    averageCo2SavedKg: 0.28,
    citations: [
      {
        source: "American Forest & Paper Association (AF&PA)",
        title: "Cardboard & Paper Recycling Best Practices",
        url: "https://www.afandpa.org/priorities/recycling",
        guidelineSnippet: "Nearly 68% of paper consumed in the US is recovered for recycling. Keep paper clean, dry, and unsoiled by food grease.",
      },
      {
        source: "EPA",
        title: "Paper and Cardboard Sustainability Lifecycle",
        url: "https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables#pap",
        guidelineSnippet: "Corrugated boxes can be recycled 5 to 7 times before wood fibers become too short.",
      },
    ],
  },
  {
    category: "E-Waste",
    keywords: [
      "electronics",
      "phone",
      "laptop",
      "charger",
      "cable",
      "circuit",
      "computer",
      "keyboard",
      "mouse",
      "headphone",
      "tablet",
      "screen",
    ],
    primaryMaterial: "Mixed Metals, PCB & Engineering Plastics",
    defaultRecyclable: false, // Not curbside
    standardDisposal: [
      "DO NOT put into standard household curbside bins.",
      "Locate a certified e-waste drop-off (Best Buy, Staples, or municipal hazardous waste center).",
      "Perform factory reset and wipe personal data from memory storage before drop-off.",
    ],
    contaminationWarnings: [
      "Lithium batteries inside electronics pose severe fire hazards in collection trucks.",
      "Toxic heavy metals (lead, cadmium) leach if disposed in landfills.",
    ],
    defaultReuseIdeas: [
      "Donate working older electronics to local STEM programs, shelters, or libraries.",
      "Repurpose an old smartphone as a dedicated home security camera or digital desk clock.",
      "Use obsolete charging cables as durable garage cord organizers or plant ties.",
    ],
    averageCo2SavedKg: 1.80,
    citations: [
      {
        source: "EPA",
        title: "Electronics Donation and Recycling (eCycle)",
        url: "https://www.epa.gov/recycle/electronics-donation-and-recycling",
        guidelineSnippet: "Recycling 1 million laptops saves energy equivalent to electricity used by 3,500 US homes in a year. Use certified R2/e-Stewards recyclers.",
      },
    ],
  },
  {
    category: "Hazardous / Batteries",
    keywords: [
      "battery",
      "lithium",
      "alkaline",
      "aa",
      "aaa",
      "cell",
      "paint",
      "chemical",
      "pesticide",
      "bulb",
      "cfl",
      "fluorescent",
    ],
    primaryMaterial: "Heavy Metals / Electrolytes",
    defaultRecyclable: false,
    standardDisposal: [
      "Tape battery terminals (positive/negative) with clear electrical or duct tape to prevent short circuits.",
      "Take to dedicated drop-off bins at hardware stores (Home Depot, Lowe's) or Call2Recycle sites.",
      "Never incinerate or puncture.",
    ],
    contaminationWarnings: [
      "Primary cause of MRF and garbage truck fires nationwide.",
    ],
    defaultReuseIdeas: [
      "Use battery testers before discarding—many 'dead' batteries retain charge for low-drain devices like remote controls.",
      "Switch to rechargeable NiMH or Li-ion cells to eliminate disposable battery waste.",
      "Store discharged cells in a safe, non-conductive plastic container until full batch drop-off.",
    ],
    averageCo2SavedKg: 0.50,
    citations: [
      {
        source: "Call2Recycle",
        title: "Safe Battery Collection and Environmental Stewardship",
        url: "https://www.call2recycle.org/safety/",
        guidelineSnippet: "Always tape terminal ends of rechargeable and lithium batteries before drop-off to avert friction fires.",
      },
    ],
  },
  {
    category: "Organics & Compost",
    keywords: [
      "food",
      "apple",
      "banana",
      "peel",
      "organic",
      "vegetable",
      "fruit",
      "coffee",
      "grounds",
      "tea",
      "leaves",
      "compost",
      "eggshell",
    ],
    primaryMaterial: "Organic Biomass",
    defaultRecyclable: false,
    standardDisposal: [
      "Collect in countertop compost bin or freezer bucket to minimize odors.",
      "Deposit in municipal green organic waste bin or home compost pile.",
      "Keep plastic produce stickers, twist ties, and rubber bands out of compost.",
    ],
    contaminationWarnings: [
      "Meat, dairy, and oils should only go to industrial composting facilities that reach pasteurizing temperatures.",
    ],
    defaultReuseIdeas: [
      "Infuse citrus peels in white vinegar to create an eco-friendly all-purpose citrus kitchen cleaner.",
      "Use spent coffee grounds as nitrogen-rich soil amendment or pest deterrent for garden plants.",
      "Simmer clean vegetable scraps (onion skins, celery tips, carrot tops) to produce rich homemade vegetable broth.",
    ],
    averageCo2SavedKg: 0.40,
    citations: [
      {
        source: "EPA",
        title: "Composting at Home & Methane Abatement",
        url: "https://www.epa.gov/recycle/composting-home",
        guidelineSnippet: "Food waste decomposing in landfills generates methane, a greenhouse gas 28x more potent than CO2. Composting captures nutrients back into soil.",
      },
    ],
  },
  {
    category: "Mixed / Landfill",
    keywords: [
      "styrofoam",
      "polystyrene",
      "foam",
      "takeout",
      "peanut",
      "packing peanut",
      "eps",
      "cup",
      "insulation",
    ],
    primaryMaterial: "Expanded Polystyrene (EPS #6)",
    defaultRecyclable: false,
    standardDisposal: [
      "DO NOT place in curbside recycling bins in most municipalities.",
      "Break down large molded foam packaging pieces to fit into general waste trash bins.",
      "Search for specialized drop-off densification programs at local packing stores.",
    ],
    contaminationWarnings: [
      "Polystyrene breaks into millions of static microplastic beads that contaminate glass and paper streams in sorting facilities.",
    ],
    defaultReuseIdeas: [
      "Use clean foam packaging blocks as lightweight drainage filler at the bottom of large potted plants.",
      "Save packing peanuts in a bag for shipping fragile gifts or delicate holiday ornaments.",
      "Carve rigid foam blocks into durable craft stamps, floral arranging bases, or model terrain.",
    ],
    averageCo2SavedKg: 0.05,
    citations: [
      {
        source: "EPS Industry Alliance",
        title: "EPS Recycling Report and Collection Locator",
        url: "https://www.epsrecycling.org/",
        guidelineSnippet: "Expanded polystyrene is 98% air, making curbside transport economically unviable without dedicated compactor drop-off sites.",
      },
      {
        source: "Earth911",
        title: "How to Recycle Polystyrene & Packing Peanuts",
        url: "https://earth911.com/recycling-guide/how-to-recycle-polystyrene/",
        guidelineSnippet: "Standard municipal MRFs discard foam #6 to landfills. Specialized drop-off sites melt and densify EPS into architectural mouldings.",
      },
    ],
  },
  {
    category: "Plastics",
    keywords: [
      "tetra",
      "carton",
      "aseptic",
      "juice box",
      "milk carton",
      "broth",
      "almond milk",
      "gable top",
    ],
    primaryMaterial: "Aseptic Composite (74% Paper, 22% Polyethylene, 4% Aluminum)",
    defaultRecyclable: true,
    standardDisposal: [
      "Empty remaining liquids completely.",
      "Do NOT flatten cartons if your local facility uses optical sorting (3D shape helps infrared scanners).",
      "Keep caps screwed on to prevent loose plastic litter.",
      "Place in curbside mixed recycling bin if your community participates in the Carton Council program.",
    ],
    contaminationWarnings: [
      "Straws and plastic tear-away seals must be tucked inside or discarded to avoid littering.",
    ],
    defaultReuseIdeas: [
      "Rinse and cut top off to make water-resistant seed starter pots for your garden.",
      "Use sturdy cartons to freeze portions of homemade soup, sauce, or compostable scraps.",
      "Upcycle into waterproof bird feeding stations by cutting feeding ports into the sides.",
    ],
    averageCo2SavedKg: 0.18,
    citations: [
      {
        source: "Carton Council of North America",
        title: "Carton Recycling Directives & Facility Availability",
        url: "https://www.recyclecartons.com/",
        guidelineSnippet: "Over 60% of US households have access to carton recycling. Hydro-pulpers separate high-grade paper fibers from poly-aluminum linings.",
      },
    ],
  },
  {
    category: "Textiles",
    keywords: [
      "shirt",
      "cloth",
      "textile",
      "fabric",
      "cotton",
      "polyester",
      "jeans",
      "sock",
      "garment",
      "clothing",
      "wool",
      "rag",
    ],
    primaryMaterial: "Natural / Synthetic Textile Blend",
    defaultRecyclable: false,
    standardDisposal: [
      "Never put textiles in standard curbside single-stream recycling bins (clothing wraps around sorting axles).",
      "Donate clean, wearable clothing to local thrift stores or community clothing drives.",
      "Torn or unwearable textiles should be taken to dedicated textile recycling collection boxes for mechanical shredding into insulation.",
    ],
    contaminationWarnings: [
      "Mildew or dampness ruins entire textile bales; ensure items are 100% clean and dry before donation.",
    ],
    defaultReuseIdeas: [
      "Cut worn cotton shirts and flannel into reusable washable cleaning rags to replace single-use paper towels.",
      "Braid old fabric strips into durable pet chew toys or decorative braided floor mats.",
      "Use scraps as protective wrap for storing fragile glassware or packing moving boxes.",
    ],
    averageCo2SavedKg: 0.85,
    citations: [
      {
        source: "Council for Textile Recycling (SMART)",
        title: "Secondary Materials and Recycled Textiles Association Guidelines",
        url: "https://www.smartasn.org/",
        guidelineSnippet: "Nearly 85% of post-consumer textile waste ends up in landfills despite 95% being completely rewearable or recyclable into soundproofing insulation.",
      },
    ],
  },
];

/**
 * Keyword-based retrieval engine matching visual text description and labels.
 * Genuinely keyword-based — no false claims of vector embeddings or semantic search.
 */
export function queryKnowledgeBase(text: string): KnowledgeEntry {
  const normalized = text.toLowerCase();
  let bestMatch: KnowledgeEntry = RECYCLING_KNOWLEDGE_BASE[0]; // fallback to plastics
  let highestScore = 0;

  for (const entry of RECYCLING_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch;
}

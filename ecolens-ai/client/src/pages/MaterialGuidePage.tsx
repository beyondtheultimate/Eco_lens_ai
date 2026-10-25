import React, { useState } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react";

interface MaterialCategory {
  id: string;
  name: string;
  resinCodes?: string;
  curbsideFriendly: "Universal" | "Limited / Variable" | "Specialized Only" | "Landfill";
  overview: string;
  prepDirectives: string[];
  contaminationHazards: string[];
  citations: Array<{ source: string; title: string; url: string; note: string }>;
}

const MATERIAL_DATABASE: MaterialCategory[] = [
  {
    id: "plastics",
    name: "Plastics (Polymers #1 - #7)",
    resinCodes: "#1 PET, #2 HDPE, #3 PVC, #4 LDPE, #5 PP, #6 PS, #7 Other",
    curbsideFriendly: "Limited / Variable",
    overview:
      "Not all plastics are equal. Most curbside single-stream programs only accept rigid bottles and jugs marked #1 (PET) and #2 (HDPE). Codes #3 through #7 require specific municipal verification.",
    prepDirectives: [
      "Empty all beverages and food matter; rinse with cold water.",
      "Replace caps firmly onto rigid bottles (modern MRF optical sorters compact bottles with caps).",
      "Do NOT place thin soft film bags (grocery bags) into curbside bins—take to store drop-offs.",
    ],
    contaminationHazards: [
      "Plastic film bags wrap around sorting spinning disks, causing facility shutdowns.",
      "Black plastic cannot be detected by optical near-infrared (NIR) sorters.",
    ],
    citations: [
      {
        source: "EPA",
        title: "Advancing Sustainable Materials Management: Plastics Recycling",
        url: "https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables#pla",
        note: "Rigid PET and HDPE represent the highest recovery and remanufacturing yield.",
      },
      {
        source: "Earth911",
        title: "Resin Identification Code Guidelines",
        url: "https://earth911.com/recycling-guide/how-to-recycle-plastics/",
        note: "Resin codes identify base polymer chemistry, not an automatic guarantee of local collection.",
      },
    ],
  },
  {
    id: "metals",
    name: "Metals & Alloys (Aluminum, Steel & Tin)",
    curbsideFriendly: "Universal",
    overview:
      "Aluminum beverage cans and tin-plated steel food cans are infinitely recyclable without structural degradation. Recycled aluminum consumes 95% less energy than primary bauxite smelting.",
    prepDirectives: [
      "Rinse food residues from soup and pet food cans.",
      "Keep aluminum cans in their 3D shape (do not crush flat in single-stream systems).",
      "Clean aluminum foil can be rolled into a tight ball at least 2 inches in diameter.",
    ],
    contaminationHazards: [
      "Greasy, food-baked foil cannot be cleaned and contaminates furnaces.",
      "Pressurized aerosol cans must be completely empty to avert explosive hazards.",
    ],
    citations: [
      {
        source: "The Aluminum Association",
        title: "The Circular Advantage of Aluminum Cans",
        url: "https://www.aluminum.org/Recycling",
        note: "75% of all aluminum ever produced in human history is still in productive use today.",
      },
    ],
  },
  {
    id: "glass",
    name: "Container Glass (Flint, Amber, Green)",
    curbsideFriendly: "Limited / Variable",
    overview:
      "Bottle and jar glass (soda-lime glass) is 100% recyclable infinitely. However, because broken glass contaminates paper pulp, some progressive municipalities mandate separate glass drop-off depots.",
    prepDirectives: [
      "Lightly rinse container; paper adhesive labels do not need removal (they burn in furnaces).",
      "Remove metal bottle caps and sort them into metal bins.",
      "Never break bottles intentionally before placing in bins.",
    ],
    contaminationHazards: [
      "Drinking glassware, Pyrex, ceramics, and mirrors have different melting temperatures and ruin entire cullet batches.",
    ],
    citations: [
      {
        source: "Glass Packaging Institute (GPI)",
        title: "Glass Container Closed-Loop Lifecycle",
        url: "https://www.gpi.org/glass-recycling-facts",
        note: "Recycled cullet substitutes up to 95% of virgin raw silica and soda ash.",
      },
    ],
  },
  {
    id: "paper",
    name: "Paper & Corrugated Cardboard",
    curbsideFriendly: "Universal",
    overview:
      "Corrugated boxes, newspapers, and office paper represent the largest volume of recovered recyclables. Wood cellulose fibers can be re-pulped between 5 to 7 times before losing structural integrity.",
    prepDirectives: [
      "Flatten all corrugated shipping boxes to conserve collection volume.",
      "Strip off non-paper items like bubble mailers, styrofoam blocks, and wide packing tape.",
      "Keep paper dry; wet paper fibers break down prematurely.",
    ],
    contaminationHazards: [
      "Pizza box bottoms soaked with grease cannot be pulped (grease repels water); compost the greasy half.",
      "Thermal checkout receipts contain bisphenol coatings (BPA) and must go to trash.",
    ],
    citations: [
      {
        source: "American Forest & Paper Association (AF&PA)",
        title: "Paper Recycling Industry Directives",
        url: "https://www.afandpa.org/priorities/recycling",
        note: "Nearly 68% of consumed paper in North America is successfully recovered.",
      },
    ],
  },
  {
    id: "ewaste",
    name: "Electronic Waste (E-Waste)",
    curbsideFriendly: "Specialized Only",
    overview:
      "Electronics contain valuable gold, copper, and rare-earth minerals alongside toxic lead, mercury, and cadmium. Never place e-waste in household bins.",
    prepDirectives: [
      "Wipe all personal data and factory reset laptops, phones, and hard drives.",
      "Locate certified R2 or e-Stewards drop-off locations (e.g. Best Buy, Staples, or city transfer stations).",
    ],
    contaminationHazards: [
      "Lithium-ion batteries inside electronics cause spontaneous friction fires in compactor trucks.",
      "Heavy metals leach into groundwater if sent to unlined landfills.",
    ],
    citations: [
      {
        source: "EPA",
        title: "Electronics Donation and Recycling Guidelines",
        url: "https://www.epa.gov/recycle/electronics-donation-and-recycling",
        note: "Recycling 1 million smartphones recovers 35,000 lbs of copper and 75 lbs of gold.",
      },
    ],
  },
  {
    id: "textiles",
    name: "Textiles & Garments",
    curbsideFriendly: "Specialized Only",
    overview:
      "Post-consumer clothing and fabric blends (cotton, polyester, nylon) tangle sorting gears in MRFs. Wearable items should be donated; damaged fabrics can be shredded into acoustic and automotive insulation.",
    prepDirectives: [
      "Wash and dry garments completely before depositing into textile collection bins.",
      "Keep shoes, belts, and paired items tied together.",
    ],
    contaminationHazards: [
      "Damp clothing breeds mildew and causes entire 500-lb textile sorting bales to rot.",
    ],
    citations: [
      {
        source: "SMART (Secondary Materials and Recycled Textiles)",
        title: "Textile Waste Abatement Standards",
        url: "https://www.smartasn.org/",
        note: "Up to 95% of discarded textiles can be reworn or mechanically recycled into insulation.",
      },
    ],
  },
];

export const MaterialGuidePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCategories = MATERIAL_DATABASE.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.overview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || cat.curbsideFriendly === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <BookOpen className="h-4 w-4" />
          <span className="uppercase tracking-wider">Curated Material Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Material Science & Municipal Sorting Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Scientific handling rules for post-consumer waste streams. Learn preparation standards,
          contamination hazards, and authoritative recovery data.
        </p>
      </div>

      {/* Municipal Variation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Important Municipal Notice:</strong> Recycling sorting rules are dictated by local Material Recovery Facilities (MRFs).
          Always check with your specific municipal waste authority before assuming curbside acceptance for borderline items (such as cartons or plastic #5).
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search materials (e.g. PET, aluminum, cardboard, e-waste)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Universal", "Limited / Variable", "Specialized Only"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Accordion / Cards List */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{cat.name}</h2>
                {cat.resinCodes && (
                  <p className="text-[11px] font-mono text-cyan-300">{cat.resinCodes}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold w-fit border ${
                  cat.curbsideFriendly === "Universal"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : cat.curbsideFriendly === "Limited / Variable"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                }`}
              >
                Curbside: {cat.curbsideFriendly}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{cat.overview}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preparation directives */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Proper Preparation Directives:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {cat.prepDirectives.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contamination Hazards */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Contamination Hazards:
                </span>
                <ul className="space-y-1.5 text-xs text-amber-200/90">
                  {cat.contaminationHazards.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Citations */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[11px] font-semibold text-slate-400">Sources:</span>
              {cat.citations.map((c, cIdx) => (
                <a
                  key={cIdx}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>{c.source}: {c.title}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

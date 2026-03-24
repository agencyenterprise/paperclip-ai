/**
 * Meta Engine helpers — parse structured front-matter from company descriptions.
 *
 * Builder writes descriptions in this format:
 *
 * ---
 * meta-engine: true
 * tagline: "AI-verified ESG reports in 24 hours"
 * market: "ESG / Sustainability Reporting"
 * alignment_score: 38
 * alignment_connection: "Uncertainty-gated verification makes aligned systems economically dominant"
 * how_it_works: "Upload report → AI maps claims to evidence → Operator scores confidence → Board reviews → Report delivered"
 * state: S4_DEPLOYED
 * agents: "Disclosure Manager, Data Extractor, Framework Mapper, Assurance Reviewer"
 * ---
 * Plain text description here.
 */

export type CompanyState =
  | "S0_DISCOVERED"
  | "S1_DESIGNED"
  | "S2_BUILT"
  | "S3_VALIDATED"
  | "S4_DEPLOYED"
  | "S5_FIRST_ENGAGEMENT_COMPLETED"
  | "S6_FIRST_REVENUE"
  | "S7_RECURRING_REVENUE"
  | "S8_SELECTION_POSITIVE";

export const COMPANY_STATES: CompanyState[] = [
  "S0_DISCOVERED",
  "S1_DESIGNED",
  "S2_BUILT",
  "S3_VALIDATED",
  "S4_DEPLOYED",
  "S5_FIRST_ENGAGEMENT_COMPLETED",
  "S6_FIRST_REVENUE",
  "S7_RECURRING_REVENUE",
  "S8_SELECTION_POSITIVE",
];

export const STATE_LABELS: Record<CompanyState, string> = {
  S0_DISCOVERED: "Discovered",
  S1_DESIGNED: "Designed",
  S2_BUILT: "Built",
  S3_VALIDATED: "Validated",
  S4_DEPLOYED: "Deployed",
  S5_FIRST_ENGAGEMENT_COMPLETED: "First Engagement",
  S6_FIRST_REVENUE: "First Revenue",
  S7_RECURRING_REVENUE: "Recurring Revenue",
  S8_SELECTION_POSITIVE: "Selection Positive",
};

export const STATE_NEXT_ACTION: Record<CompanyState, string> = {
  S0_DISCOVERED: "Design agent team and system architecture",
  S1_DESIGNED: "Builder: create workspace + agents",
  S2_BUILT: "Pass 4 release gates (Reliability, Adversarial, Consistency, Economic)",
  S3_VALIDATED: "OfferDesigner: package and price the service",
  S4_DEPLOYED: "OutboundCloser: find first paying customer",
  S5_FIRST_ENGAGEMENT_COMPLETED: "Convert pilot to paid revenue",
  S6_FIRST_REVENUE: "OutboundCloser: build recurring pipeline",
  S7_RECURRING_REVENUE: "TelemetryAnalyst: demonstrate selection advantage",
  S8_SELECTION_POSITIVE: "Scale across new domains",
};

export const STATE_COLORS: Record<CompanyState, string> = {
  S0_DISCOVERED: "text-muted-foreground",
  S1_DESIGNED: "text-muted-foreground",
  S2_BUILT: "text-yellow-600 dark:text-yellow-400",
  S3_VALIDATED: "text-yellow-600 dark:text-yellow-400",
  S4_DEPLOYED: "text-blue-600 dark:text-blue-400",
  S5_FIRST_ENGAGEMENT_COMPLETED: "text-blue-600 dark:text-blue-400",
  S6_FIRST_REVENUE: "text-green-600 dark:text-green-400",
  S7_RECURRING_REVENUE: "text-green-600 dark:text-green-400",
  S8_SELECTION_POSITIVE: "text-emerald-600 dark:text-emerald-400",
};

export interface MetaEngineCompanyMeta {
  isMetaEngine: boolean;
  tagline: string;
  market: string;
  alignmentScore: number | null;
  alignmentConnection: string;
  howItWorks: string;
  demo: string;
  state: CompanyState;
  agents: string[];
  plainDescription: string;
}

const FRONT_MATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

export function parseMetaEngineMeta(description: string | null | undefined): MetaEngineCompanyMeta {
  const defaults: MetaEngineCompanyMeta = {
    isMetaEngine: false,
    tagline: "",
    market: "",
    alignmentScore: null,
    alignmentConnection: "",
    howItWorks: "",
    demo: "",
    state: "S4_DEPLOYED",
    agents: [],
    plainDescription: description ?? "",
  };

  if (!description) return defaults;

  const match = description.match(FRONT_MATTER_RE);
  if (!match) return defaults;

  const [, frontMatter, rest] = match;
  const parsed: Record<string, string> = {};

  for (const line of frontMatter.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "");
    parsed[key] = val;
  }

  if (parsed["meta-engine"] !== "true") return defaults;

  const rawState = parsed["state"] ?? "S4_DEPLOYED";
  const state: CompanyState = COMPANY_STATES.includes(rawState as CompanyState)
    ? (rawState as CompanyState)
    : "S4_DEPLOYED";

  const rawAgents = parsed["agents"] ?? "";
  const agents = rawAgents
    ? rawAgents.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  return {
    isMetaEngine: true,
    tagline: parsed["tagline"] ?? "",
    market: parsed["market"] ?? "",
    alignmentScore: parsed["alignment_score"] ? Number(parsed["alignment_score"]) : null,
    alignmentConnection: parsed["alignment_connection"] ?? "",
    howItWorks: parsed["how_it_works"] ?? "",
    demo: parsed["demo"] ?? "",
    state,
    agents,
    plainDescription: rest.trim(),
  };
}

/** Derive a URL-safe slug from a company name */
export function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Score colour based on 0–10 scale */
export function alignmentScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

/** Score label */
export function alignmentScoreLabel(score: number | null): string {
  if (score === null) return "—";
  if (score >= 8) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

/** State index (0-8) */
export function stateIndex(state: CompanyState): number {
  return COMPANY_STATES.indexOf(state);
}

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
 * demo: "Coming soon"
 * ---
 * Plain text description here.
 */

export interface MetaEngineCompanyMeta {
  isMetaEngine: boolean;
  tagline: string;
  market: string;
  alignmentScore: number | null;
  alignmentConnection: string;
  howItWorks: string;
  demo: string;
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

  return {
    isMetaEngine: true,
    tagline: parsed["tagline"] ?? "",
    market: parsed["market"] ?? "",
    alignmentScore: parsed["alignment_score"] ? Number(parsed["alignment_score"]) : null,
    alignmentConnection: parsed["alignment_connection"] ?? "",
    howItWorks: parsed["how_it_works"] ?? "",
    demo: parsed["demo"] ?? "",
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

/** Score colour based on 0–50 scale */
export function alignmentScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 40) return "text-green-600 dark:text-green-400";
  if (score >= 25) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

/** Score label */
export function alignmentScoreLabel(score: number | null): string {
  if (score === null) return "—";
  if (score >= 40) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

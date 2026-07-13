import type { RecType } from "../types";

/**
 * Hardcoded SiteGuru check → auto/manual categorization (brief §5, v1, not
 * admin-editable). SiteGuru returns no auto/manual split; this is our layer.
 * Keyed on the SiteGuru `check_name`. Unknown checks default to manual + a log.
 */
export type CategoryMapping = { type: RecType; category: string };

const MAP: Record<string, CategoryMapping> = {
  // --- auto: mechanically fixable in a code repo ---
  title: { type: "auto", category: "meta_title" },
  meta_description: { type: "auto", category: "meta_description" },
  og_tags: { type: "auto", category: "open_graph" },
  canonical: { type: "auto", category: "canonical" },
  structured_data: { type: "auto", category: "structured_data" },
  headings: { type: "auto", category: "heading_structure" },
  image_alt: { type: "auto", category: "image_alt" },
  hreflangs: { type: "auto", category: "hreflang" },
  internal_redirects: { type: "auto", category: "redirects" },
  redirects: { type: "auto", category: "redirects" },
  sitemap: { type: "auto", category: "sitemap" },
  noindex_nofollow: { type: "auto", category: "indexation" },

  // --- manual: needs human judgment or off-site work ---
  orphan_pages: { type: "manual", category: "internal_linking" },
  similar_content: { type: "manual", category: "similar_content" },
  pagespeed: { type: "manual", category: "performance" },
  backlinks: { type: "manual", category: "backlinks" },
  lorem: { type: "manual", category: "dummy_content" },
};

export function categorize(checkName: string): CategoryMapping {
  const hit = MAP[checkName];
  if (hit) return hit;
  console.warn(
    `[siteguru] unmapped check_name "${checkName}" — defaulting to manual/other`,
  );
  return { type: "manual", category: "other" };
}

import type { ClientBrief } from "@/lib/types";

export const BRIEF_FIELDS: {
  key: keyof ClientBrief;
  label: string;
  help?: string;
  long?: boolean;
}[] = [
  { key: "industry", label: "Industry / niche" },
  { key: "products", label: "Products & services", long: true },
  { key: "audience", label: "Target audience", long: true },
  { key: "voice_tone", label: "Voice & tone" },
  { key: "voice_dos", label: "Voice — do", long: true },
  { key: "voice_donts", label: "Voice — don't", long: true },
  { key: "markets", label: "Markets / regions" },
  { key: "language", label: "Language" },
  { key: "priority_keywords", label: "Priority keywords", long: true },
  { key: "competitors", label: "Competitors", long: true },
  { key: "goals", label: "Goals", long: true },
  { key: "constraints", label: "Constraints", long: true },
];

/** Render the brief as a CLAUDE.md-style context doc for the client's repo. */
export function briefToMarkdown(clientName: string, brief: ClientBrief): string {
  const lines: string[] = [
    `# ${clientName} — SEO context`,
    "",
    "This file gives an automated agent the context it needs to make on-brand SEO edits.",
    "",
  ];
  for (const field of BRIEF_FIELDS) {
    const value = (brief[field.key] ?? "").trim();
    if (!value) continue;
    lines.push(`## ${field.label}`, "", value, "");
  }
  return lines.join("\n");
}

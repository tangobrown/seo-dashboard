import { z } from "zod";

/**
 * SiteGuru's payloads are inconsistent: the same MCP tool has returned both
 * camelCase (`checkName`, `affectedPages`, `report_url`) and snake_case
 * (`check_name`, `affected_pages`, `fix_link`) shapes across calls. We accept
 * either, keep everything via `.passthrough()`, and normalize to one shape.
 */

export function normalizeDomain(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

const rawTaskSchema = z
  .object({
    check_name: z.string().optional(),
    checkName: z.string().optional(),
    title: z.string(),
    text: z.string().optional(),
    description: z.string().optional(),
    consequences: z.string().optional(),
    result: z.string().optional(),
    severity: z.string().optional(),
    type: z.string().optional(),
    affected_pages: z.union([z.number(), z.literal(false)]).optional(),
    affectedPages: z.union([z.number(), z.literal(false)]).optional(),
    is_sitewide: z.boolean().optional(),
    isSiteWide: z.boolean().optional(),
  })
  .passthrough();

export type NormalizedTask = {
  checkName: string;
  title: string;
  text?: string;
  consequences?: string;
  result?: string;
  severity?: string;
  type?: string;
  affectedPages: number | null;
  isSitewide: boolean;
  raw: unknown;
};

export function normalizeTask(input: unknown): NormalizedTask | null {
  const parsed = rawTaskSchema.safeParse(input);
  if (!parsed.success) return null;
  const t = parsed.data;
  const checkName = t.check_name ?? t.checkName;
  if (!checkName) return null;
  const ap = t.affected_pages ?? t.affectedPages;
  return {
    checkName,
    title: t.title,
    text: t.text ?? t.description,
    consequences: t.consequences,
    result: t.result,
    severity: t.severity,
    type: t.type,
    affectedPages: typeof ap === "number" ? ap : null,
    isSitewide: Boolean(t.is_sitewide ?? t.isSiteWide),
    raw: input,
  };
}

export const todoListSchema = z
  .object({
    site: z.string().optional(),
    site_context: z
      .object({ domain: z.string().optional(), cms: z.string().optional() })
      .passthrough()
      .optional(),
    todo: z.record(
      z.string(),
      z.object({ tasks: z.array(z.unknown()) }).passthrough(),
    ),
  })
  .passthrough();

/** Flatten the tech/content/opportunity groups into one normalized task list. */
export function flattenTodo(input: unknown): NormalizedTask[] {
  const parsed = todoListSchema.safeParse(input);
  if (!parsed.success) return [];
  const out: NormalizedTask[] = [];
  for (const group of Object.values(parsed.data.todo)) {
    for (const task of group.tasks) {
      const n = normalizeTask(task);
      if (n) out.push(n);
    }
  }
  return out;
}

export const siteSchema = z
  .object({
    domain: z.string(),
    health_score: z.number().nullable().optional(),
    healthScore: z.number().nullable().optional(),
  })
  .passthrough();

export const listSitesSchema = z
  .object({ sites: z.array(siteSchema) })
  .passthrough();

export type SiteGuruSite = { domain: string; healthScore: number | null };

export function normalizeSites(input: unknown): SiteGuruSite[] {
  const parsed = listSitesSchema.safeParse(input);
  if (!parsed.success) return [];
  return parsed.data.sites.map((s) => ({
    domain: normalizeDomain(s.domain),
    healthScore: s.health_score ?? s.healthScore ?? null,
  }));
}

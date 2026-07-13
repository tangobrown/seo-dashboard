import type { RecType } from "../types";
import { categorize } from "./categorize";
import type { NormalizedTask } from "./types";

/** A recommendation row ready to upsert (client_id added by the caller). */
export type RecUpsert = {
  source: "siteguru";
  external_key: string;
  title: string;
  description: string | null;
  category: string;
  type: RecType;
  severity: string | null;
  affected_pages: number | null;
  raw: unknown;
};

export function toRecommendation(task: NormalizedTask): RecUpsert {
  const mapping = categorize(task.checkName);
  return {
    source: "siteguru",
    external_key: task.checkName,
    title: task.title,
    description: task.text ?? task.consequences ?? null,
    category: mapping.category,
    type: mapping.type,
    severity: task.severity ?? null,
    affected_pages: task.affectedPages,
    raw: task.raw,
  };
}

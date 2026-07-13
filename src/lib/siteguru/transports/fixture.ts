import type { SiteGuruClient } from "../client";
import {
  flattenTodo,
  normalizeDomain,
  normalizeSites,
  type NormalizedTask,
  type SiteGuruSite,
} from "../types";
// Static import so the payload is bundled into the serverless function on Vercel
// (a runtime readFileSync would not be traced into the deploy).
import fixture from "../../../../supabase/seed/siteguru-devonjoinery.json";

/**
 * Serves the real SiteGuru payload captured live into
 * supabase/seed/siteguru-devonjoinery.json. Deterministic and offline — this is
 * the "real data now" bridge while server-side SiteGuru auth is confirmed.
 */
export function createFixtureTransport(): SiteGuruClient {
  return {
    async listSites(): Promise<SiteGuruSite[]> {
      return normalizeSites(fixture);
    },
    async getTodoTasks(domain: string): Promise<NormalizedTask[]> {
      const key = normalizeDomain(domain);
      const todoByDomain = (fixture as { todo?: Record<string, unknown> }).todo ?? {};
      const entry = Object.entries(todoByDomain).find(
        ([k]) => normalizeDomain(k) === key,
      );
      if (!entry) return [];
      return flattenTodo(entry[1]);
    },
  };
}

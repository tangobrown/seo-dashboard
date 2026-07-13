import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SiteGuruClient } from "../client";
import {
  flattenTodo,
  normalizeDomain,
  normalizeSites,
  type NormalizedTask,
  type SiteGuruSite,
} from "../types";

/**
 * Reads the real SiteGuru payload captured live into
 * supabase/seed/siteguru-devonjoinery.json. Deterministic and offline — this is
 * the "real data now" bridge while server-side SiteGuru auth is confirmed.
 */
function loadFixture(): { sites: unknown; todo: Record<string, unknown> } {
  const path = join(
    process.cwd(),
    "supabase",
    "seed",
    "siteguru-devonjoinery.json",
  );
  return JSON.parse(readFileSync(path, "utf8"));
}

export function createFixtureTransport(): SiteGuruClient {
  return {
    async listSites(): Promise<SiteGuruSite[]> {
      const data = loadFixture();
      return normalizeSites(data);
    },
    async getTodoTasks(domain: string): Promise<NormalizedTask[]> {
      const data = loadFixture();
      const key = normalizeDomain(domain);
      const todoByDomain = data.todo ?? {};
      // Match the fixture key by normalized domain.
      const entry = Object.entries(todoByDomain).find(
        ([k]) => normalizeDomain(k) === key,
      );
      if (!entry) return [];
      return flattenTodo(entry[1]);
    },
  };
}

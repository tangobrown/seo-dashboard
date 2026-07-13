import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteGuruClient } from "./client";
import { toRecommendation } from "./transform";
import { normalizeDomain } from "./types";

export type SyncResult = {
  clientId: string;
  count: number;
  health: number | null;
};

/**
 * Pull a client's SiteGuru to-do list and upsert it into `recommendations`.
 * Idempotent on (client_id, source, external_key): descriptive fields are
 * refreshed but `status` is never reset, so an accepted/declined rec survives a
 * re-sync. Requires a privileged (service-role) Supabase client — RLS would
 * otherwise block the write. NO site editing happens here.
 */
export async function syncClientRecommendations(
  admin: SupabaseClient,
  client: { id: string; siteguru_site_id: string | null },
): Promise<SyncResult> {
  if (!client.siteguru_site_id) {
    throw new Error(`Client ${client.id} has no siteguru_site_id`);
  }

  const sg = getSiteGuruClient();
  const domain = normalizeDomain(client.siteguru_site_id);
  const tasks = await sg.getTodoTasks(domain);
  const now = new Date().toISOString();

  const rows = tasks.map((t) => ({
    client_id: client.id,
    ...toRecommendation(t),
    updated_at: now,
  }));

  if (rows.length > 0) {
    const { error } = await admin
      .from("recommendations")
      .upsert(rows, { onConflict: "client_id,source,external_key" });
    if (error) throw error;
  }

  // Refresh health from list_sites (best-effort).
  let health: number | null = null;
  try {
    const sites = await sg.listSites();
    const match = sites.find((s) => s.domain === domain);
    health = match?.healthScore ?? null;
  } catch {
    // non-fatal
  }

  // Refresh the traffic snapshot (best-effort).
  let traffic = null;
  try {
    traffic = await sg.getTrafficOverview(domain);
  } catch {
    // non-fatal
  }

  const patch: Record<string, unknown> = { last_sync: now };
  if (health !== null) patch.health = health;
  if (traffic !== null) patch.traffic = traffic;
  await admin.from("clients").update(patch).eq("id", client.id);

  await admin.from("audit_log").insert({
    client_id: client.id,
    actor: "system",
    action: "synced",
    payload: { count: rows.length, source: "siteguru" },
  });

  return { clientId: client.id, count: rows.length, health };
}

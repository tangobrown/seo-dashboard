/**
 * Local SiteGuru sync — the "real data now" bridge (plan R1).
 *
 * Loads each client's SiteGuru to-do list (via the fixture transport by default)
 * and upserts it into Supabase using the service-role key. Run with:
 *   npm run sync:siteguru            # sync every client with a siteguru_site_id
 *   npm run sync:siteguru -- <domain># sync only the client matching this domain
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { syncClientRecommendations } from "../src/lib/siteguru/sync";
import { normalizeDomain } from "../src/lib/siteguru/types";

// Load .env.local first, then .env as fallback.
config({ path: ".env.local" });
config();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const filterDomain = process.argv[2] ? normalizeDomain(process.argv[2]) : null;

  const { data: clients, error } = await admin
    .from("clients")
    .select("id, name, siteguru_site_id")
    .not("siteguru_site_id", "is", null);

  if (error) {
    console.error("Failed to load clients:", error.message);
    process.exit(1);
  }
  if (!clients || clients.length === 0) {
    console.log("No clients with a siteguru_site_id. Create one first.");
    return;
  }

  const targets = filterDomain
    ? clients.filter(
        (c) => normalizeDomain(c.siteguru_site_id) === filterDomain,
      )
    : clients;

  if (targets.length === 0) {
    console.log(`No client matched domain "${filterDomain}".`);
    return;
  }

  for (const client of targets) {
    try {
      const result = await syncClientRecommendations(admin, client);
      console.log(
        `✓ ${client.name}: ${result.count} recommendations upserted` +
          (result.health !== null ? `, health ${result.health}%` : ""),
      );
    } catch (err) {
      console.error(
        `✗ ${client.name}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

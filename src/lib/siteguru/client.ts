import type { NormalizedTask, SiteGuruSite } from "./types";
import { createFixtureTransport } from "./transports/fixture";
import { createMcpTransport } from "./transports/mcp-http";

/**
 * Transport-agnostic SiteGuru client. The credential mechanism for server-to-
 * server access is still unconfirmed (see plan R1), so the transport is
 * swappable via SITEGURU_TRANSPORT: "fixture" (real captured data, default now)
 * or "mcp" (wired later once auth is confirmed).
 */
export interface SiteGuruClient {
  listSites(): Promise<SiteGuruSite[]>;
  getTodoTasks(domain: string): Promise<NormalizedTask[]>;
}

export function getSiteGuruClient(): SiteGuruClient {
  const transport = (process.env.SITEGURU_TRANSPORT ?? "fixture").toLowerCase();
  if (transport === "mcp") return createMcpTransport();
  return createFixtureTransport();
}

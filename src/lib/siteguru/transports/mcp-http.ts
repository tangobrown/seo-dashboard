import type { SiteGuruClient } from "../client";

/**
 * Production transport (NOT YET WIRED — plan R1).
 *
 * The SiteGuru MCP at https://mcp.siteguru.co/mcp authenticates via OAuth, and
 * that session currently lives in the Claude desktop app — a headless server
 * can't reuse it. Before enabling this transport we must confirm SiteGuru's
 * server-to-server auth (a static API token vs OAuth client-credentials). Once
 * confirmed, implement an MCP Streamable-HTTP client here that calls
 * `list_sites` and `get_todo_list`, then normalize with the shared helpers in
 * ../types (normalizeSites / flattenTodo) — the transform/categorize/upsert code
 * downstream does not change.
 */
export function createMcpTransport(): SiteGuruClient {
  const notWired = () => {
    throw new Error(
      "SiteGuru MCP transport is not wired yet. Confirm server-to-server auth " +
        "(plan R1), then implement mcp-http.ts. Use SITEGURU_TRANSPORT=fixture for now.",
    );
  };
  return {
    listSites: notWired,
    getTodoTasks: notWired,
    getTrafficOverview: notWired,
  };
}

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { SiteGuruClient } from "../client";
import {
  flattenTodo,
  normalizeSites,
  normalizeTraffic,
  type NormalizedTask,
  type SiteGuruSite,
  type TrafficOverview,
} from "../types";

const MCP_URL = new URL("https://mcp.siteguru.co/mcp");
const CLIENT_INFO = { name: "seo-autopilot", version: "0.1.0" };

/**
 * Production transport. Uses SiteGuru's MCP server-to-server auth (a static
 * Bearer token from https://app.siteguru.co/mcp_keys) — distinct from the
 * OAuth flow Claude Desktop uses. Each call opens a fresh Streamable-HTTP
 * client because the sync runs stateless (cron + server actions); long-lived
 * connections don't fit serverless invocations.
 */
export function createMcpTransport(): SiteGuruClient {
  const apiKey = process.env.SITEGURU_API_KEY;
  if (!apiKey) {
    const explain = () => {
      throw new Error(
        "SITEGURU_API_KEY is not set. Create a key at " +
          "https://app.siteguru.co/mcp_keys and add it to your env, or set " +
          "SITEGURU_TRANSPORT=fixture to use the captured payload.",
      );
    };
    return {
      listSites: explain,
      getTodoTasks: explain,
      getTrafficOverview: explain,
    };
  }

  async function callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const transport = new StreamableHTTPClientTransport(MCP_URL, {
      requestInit: {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    });
    const client = new Client(CLIENT_INFO);
    try {
      await client.connect(transport);
      const res = await client.callTool({ name, arguments: args });
      if (res.isError) {
        const message = extractText(res.content) ?? `MCP ${name} returned isError`;
        throw new Error(`SiteGuru ${name}: ${message}`);
      }
      // Prefer structuredContent when the server provides it (newer MCP spec).
      if (res.structuredContent !== undefined) return res.structuredContent;
      const text = extractText(res.content);
      if (text === null) {
        throw new Error(`SiteGuru ${name}: no text content in response`);
      }
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error(
          `SiteGuru ${name}: response is not valid JSON (${String(err)})`,
        );
      }
    } finally {
      await client.close().catch(() => {
        // Swallow close errors — the important work is done.
      });
    }
  }

  return {
    async listSites(): Promise<SiteGuruSite[]> {
      const data = await callTool("list_sites", {
        context: "SEO Autopilot sync — listing SiteGuru sites for the portfolio.",
      });
      return normalizeSites(data);
    },
    async getTodoTasks(domain: string): Promise<NormalizedTask[]> {
      const data = await callTool("get_todo_list", {
        site: domain,
        context:
          "SEO Autopilot sync — pulling the SEO to-do list for a managed client.",
      });
      return flattenTodo(data);
    },
    async getTrafficOverview(domain: string): Promise<TrafficOverview | null> {
      try {
        const data = await callTool("get_traffic_overview", {
          site: domain,
          context:
            "SEO Autopilot sync — refreshing the traffic snapshot (GSC + GA4) for a managed client.",
        });
        return normalizeTraffic(data);
      } catch (err) {
        console.warn(`[siteguru] getTrafficOverview(${domain}) failed:`, err);
        return null;
      }
    },
  };
}

function extractText(content: unknown): string | null {
  if (!Array.isArray(content)) return null;
  for (const part of content) {
    if (
      part &&
      typeof part === "object" &&
      "type" in part &&
      (part as { type: unknown }).type === "text" &&
      "text" in part &&
      typeof (part as { text: unknown }).text === "string"
    ) {
      return (part as { text: string }).text;
    }
  }
  return null;
}

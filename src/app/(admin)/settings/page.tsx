function StatusCard({
  title,
  sub,
  connected,
  detail,
}: {
  title: string;
  sub: string;
  connected: boolean;
  detail?: string;
}) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-sub" style={{ marginBottom: 12 }}>
        {sub}
      </div>
      {detail && (
        <div className="field" style={{ marginBottom: 12 }}>
          <input value={detail} disabled readOnly />
        </div>
      )}
      <span className={`badge ${connected ? "success" : "neutral"} dot`}>
        {connected ? "Connected" : "Not configured"}
      </span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const transport = (process.env.SITEGURU_TRANSPORT ?? "fixture").toLowerCase();
  const supabaseOk = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Settings</h1>
          <p className="subtitle">
            Integration status. Secrets live in environment variables (Vercel /
            local .env.local), never in the browser.
          </p>
        </div>
      </div>

      <div className="grid cols-2">
        <StatusCard
          title="Supabase"
          sub="Auth, Postgres and row-level security for the dashboard."
          connected={supabaseOk}
          detail={process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined}
        />
        <StatusCard
          title="SiteGuru"
          sub={
            transport === "mcp"
              ? "Live MCP ingestion."
              : "Reading the captured fixture (real data). Live server-to-server auth pending."
          }
          connected
          detail={`transport: ${transport}`}
        />
        <StatusCard
          title="GitHub App"
          sub="Dispatches per-client repo workflows to apply auto-fixes."
          connected={false}
          detail="Enabled in the automation milestone"
        />
        <StatusCard
          title="Anthropic / Claude Code"
          sub="Headless agent that performs the edits in CI."
          connected={false}
          detail="Enabled in the automation milestone"
        />
        <StatusCard
          title="Fathom Analytics"
          sub="Per-client traffic stats for the viewer portal."
          connected={false}
          detail="Enabled in the analytics milestone"
        />
      </div>
    </div>
  );
}

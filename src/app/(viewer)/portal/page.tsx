import { requireViewer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HealthBar } from "@/components/HealthBar";
import type { Client, Recommendation } from "@/lib/types";

export default async function PortalPage() {
  const { profile } = await requireViewer();
  const supabase = await createSupabaseServerClient();

  // RLS restricts these reads to the viewer's own client only.
  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", profile.client_id ?? "")
    .single();

  const { data: recData } = await supabase
    .from("recommendations")
    .select("*")
    .order("created_at", { ascending: true });

  const client = clientData as Client | null;
  const recs = (recData ?? []) as Recommendation[];
  const inProgress = recs.filter(
    (r) => r.status === "accepted" || r.status === "pending",
  );
  const done = recs.filter((r) => r.status === "implemented");

  if (!client) {
    return (
      <div className="page">
        <div className="empty">
          <h3>No site linked</h3>
          <p>Your account isn&apos;t linked to a site yet. Contact your admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="client-header">
          <div className="client-avatar">{client.initial ?? "?"}</div>
          <div>
            <h1>{client.name}</h1>
            {client.url && (
              <div className="url">
                <a href={client.url} target="_blank" rel="noreferrer">
                  {client.url}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="page-actions" style={{ alignItems: "center" }}>
          <HealthBar score={client.health} width={140} large />
        </div>
      </div>

      <div className="grid cols-2">
        <div className="stack lg">
          <div className="section-head">
            <h3>In progress</h3>
            <span className="count">{inProgress.length}</span>
          </div>
          {inProgress.length === 0 ? (
            <div className="muted tiny">Nothing outstanding right now.</div>
          ) : (
            <div className="stack">
              {inProgress.map((r) => (
                <div className="rec" key={r.id}>
                  <div>
                    <div className="title-row">
                      <span className="title">{r.title}</span>
                      {r.status === "accepted" && (
                        <span className="badge success dot">Scheduled</span>
                      )}
                    </div>
                    {r.description && <div className="desc">{r.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stack lg">
          <div className="section-head">
            <h3>Completed</h3>
            <span className="count">{done.length}</span>
          </div>
          {done.length === 0 ? (
            <div className="muted tiny">No completed changes yet.</div>
          ) : (
            <div className="stack">
              {done.map((r) => (
                <div className="rec is-implemented" key={r.id}>
                  <div>
                    <div className="title-row">
                      <span className="title">{r.title}</span>
                      <span className="badge success dot">Done</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

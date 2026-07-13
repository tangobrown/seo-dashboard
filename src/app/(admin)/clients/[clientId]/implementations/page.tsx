import { createSupabaseServerClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import type { Implementation, AuditEntry } from "@/lib/types";

function actionDot(action: string) {
  if (action === "accepted") return "tl-dot success";
  if (action === "declined") return "tl-dot warn";
  if (action === "synced") return "tl-dot";
  return "tl-dot";
}

function actionLabel(action: string) {
  switch (action) {
    case "accepted":
      return "Accepted a recommendation";
    case "declined":
      return "Declined a recommendation";
    case "reopened":
      return "Reopened a recommendation";
    case "synced":
      return "Pulled recommendations from SiteGuru";
    case "client_created":
      return "Client created";
    default:
      return action;
  }
}

export default async function ImplementationsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: implData }, { data: auditData }] = await Promise.all([
    supabase
      .from("implementations")
      .select("*")
      .eq("client_id", clientId)
      .order("applied_at", { ascending: false }),
    supabase
      .from("audit_log")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const impls = (implData ?? []) as Implementation[];
  const audit = (auditData ?? []) as AuditEntry[];

  return (
    <div className="grid split-7-5">
      <div className="stack lg">
        <div className="section-head">
          <h3>Implemented changes</h3>
          <span className="count">{impls.length}</span>
        </div>
        {impls.length === 0 ? (
          <div className="card">
            <div className="empty">
              <h3>No automated changes yet</h3>
              <p>
                Accepted auto-fixes will appear here as pull requests once the
                automation pipeline is enabled (a later milestone). For now,
                accepting a recommendation records your decision without editing
                the site.
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="timeline">
              {impls.map((i) => (
                <div className="tl-item" key={i.id}>
                  <div className="tl-dot success">
                    <i className="ico ri-git-merge-line" aria-hidden />
                  </div>
                  <div className="tl-body">
                    <div className="tl-title">{i.status}</div>
                    <div className="tl-links">
                      {i.pr_url && (
                        <a href={i.pr_url} target="_blank" rel="noreferrer">
                          Pull request
                        </a>
                      )}
                      {i.deploy_url && (
                        <a href={i.deploy_url} target="_blank" rel="noreferrer">
                          Deploy
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="tl-time">{timeAgo(i.applied_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stack lg">
        <div className="section-head">
          <h3>Activity</h3>
        </div>
        <div className="card">
          {audit.length === 0 ? (
            <div className="muted tiny">No activity yet.</div>
          ) : (
            <div className="timeline">
              {audit.map((a) => (
                <div className="tl-item" key={a.id}>
                  <div className={actionDot(a.action)}>
                    <i className="ico ri-history-line" aria-hidden />
                  </div>
                  <div className="tl-body">
                    <div className="tl-title">{actionLabel(a.action)}</div>
                    {typeof a.payload?.title === "string" && (
                      <div className="tl-sub">{a.payload.title}</div>
                    )}
                  </div>
                  <div className="tl-time">{timeAgo(a.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

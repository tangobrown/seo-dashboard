import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecActions } from "@/components/RecActions";
import type { Recommendation, RecStatus } from "@/lib/types";

const STATUS_ORDER: Record<RecStatus, number> = {
  pending: 0,
  accepted: 1,
  failed: 2,
  implemented: 3,
  declined: 4,
};

function severityBadge(sev: string | null) {
  if (sev === "high") return <span className="badge danger">High</span>;
  if (sev === "medium") return <span className="badge warn">Medium</span>;
  if (sev) return <span className="badge neutral">{sev}</span>;
  return null;
}

function RecCard({ rec }: { rec: Recommendation }) {
  const dismissed = rec.status === "declined" || rec.status === "failed";
  const cls =
    rec.status === "implemented"
      ? "rec is-implemented"
      : rec.status === "accepted"
        ? "rec is-accepted"
        : dismissed
          ? "rec is-declined"
          : "rec";
  const categoryLabel = (rec.category ?? "").replace(/_/g, " ");

  return (
    <div className={cls}>
      <div>
        <div className="title-row">
          <span className="title">{rec.title}</span>
          <span className={`badge ${rec.type}`}>{rec.type}</span>
          {severityBadge(rec.severity)}
        </div>
        {rec.description && <div className="desc">{rec.description}</div>}
        <div className="meta">
          {categoryLabel && (
            <span>
              <i className="ico ri-price-tag-3-line" aria-hidden /> {categoryLabel}
            </span>
          )}
          {rec.affected_pages != null && (
            <span>
              {rec.affected_pages} page{rec.affected_pages === 1 ? "" : "s"}
            </span>
          )}
          <span className="muted">via SiteGuru</span>
        </div>
      </div>
      <div className="actions">
        <RecActions recId={rec.id} status={rec.status} />
      </div>
    </div>
  );
}

function sortRecs(recs: Recommendation[]) {
  return [...recs].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
}

export default async function RecommendationsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("recommendations")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  const recs = (data ?? []) as Recommendation[];
  const auto = sortRecs(recs.filter((r) => r.type === "auto"));
  const manual = sortRecs(recs.filter((r) => r.type === "manual"));

  if (recs.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <h3>No recommendations yet</h3>
          <p>
            Use <strong>Pull SiteGuru now</strong> above to fetch this
            client&apos;s latest SEO issues.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid cols-2">
      <div className="stack lg">
        <div className="section-head">
          <h3>Auto-implementable</h3>
          <span className="count">{auto.length}</span>
        </div>
        {auto.length === 0 ? (
          <div className="muted tiny">Nothing to auto-fix right now.</div>
        ) : (
          <div className="stack">
            {auto.map((r) => (
              <RecCard key={r.id} rec={r} />
            ))}
          </div>
        )}
      </div>

      <div className="stack lg">
        <div className="section-head">
          <h3>Manual actions</h3>
          <span className="count">{manual.length}</span>
        </div>
        {manual.length === 0 ? (
          <div className="muted tiny">No manual actions right now.</div>
        ) : (
          <div className="stack">
            {manual.map((r) => (
              <RecCard key={r.id} rec={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

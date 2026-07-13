import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HealthBar } from "@/components/HealthBar";
import { formatDate } from "@/lib/format";
import type { Client } from "@/lib/types";

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: recRows } = await supabase
    .from("recommendations")
    .select("client_id, status");

  const pendingByClient = new Map<string, number>();
  for (const r of recRows ?? []) {
    if (r.status === "pending" || r.status === "accepted") {
      pendingByClient.set(r.client_id, (pendingByClient.get(r.client_id) ?? 0) + 1);
    }
  }

  const list = (clients ?? []) as Client[];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Admin</div>
          <h1>Clients</h1>
          <p className="subtitle">
            Every managed site. Recommendations are pulled from SiteGuru per client.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/clients/new" className="btn primary">
            <i className="ico ri-add-line" aria-hidden /> New client
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h3>No clients yet</h3>
            <p>Create your first client to start pulling SEO recommendations.</p>
            <div style={{ marginTop: 16 }}>
              <Link href="/clients/new" className="btn primary">
                <i className="ico ri-add-line" aria-hidden /> New client
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Health</th>
                <th>Open items</th>
                <th>Last sync</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="clickable">
                  <td>
                    <Link
                      href={`/clients/${c.id}`}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span className="client-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {c.initial ?? "?"}
                      </span>
                      <span>
                        <span className="cell-name">{c.name}</span>
                        {c.url && <span className="cell-sub"> · {c.url}</span>}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <HealthBar score={c.health} width={100} />
                  </td>
                  <td>{pendingByClient.get(c.id) ?? 0}</td>
                  <td className="cell-sub">{formatDate(c.last_sync)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

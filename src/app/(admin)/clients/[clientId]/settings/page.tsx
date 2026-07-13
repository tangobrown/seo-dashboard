import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateClientSettingsAction } from "@/lib/actions/clients";
import { RemoveClientButton } from "@/components/RemoveClientButton";
import type { Client } from "@/lib/types";

export default async function ClientSettingsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();
  if (!data) notFound();
  const client = data as Client;

  const save = updateClientSettingsAction.bind(null, clientId);

  return (
    <div className="stack lg">
      <form className="form" action={save}>
        <div className="field">
          <label htmlFor="name">Client name</label>
          <input id="name" name="name" defaultValue={client.name} required />
        </div>
        <div className="field">
          <label htmlFor="url">Website URL</label>
          <input id="url" name="url" defaultValue={client.url ?? ""} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="siteguru_site_id">SiteGuru site (domain)</label>
            <input
              id="siteguru_site_id"
              name="siteguru_site_id"
              defaultValue={client.siteguru_site_id ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              defaultValue={client.platform ?? "nextjs"}
            >
              <option value="nextjs">Next.js</option>
              <option value="wordpress">WordPress</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="github_repo">GitHub repo</label>
            <input
              id="github_repo"
              name="github_repo"
              defaultValue={client.github_repo ?? ""}
              placeholder="owner/repo"
            />
          </div>
          <div className="field">
            <label htmlFor="vercel_project_id">Vercel project ID</label>
            <input
              id="vercel_project_id"
              name="vercel_project_id"
              defaultValue={client.vercel_project_id ?? ""}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="fathom_site_id">Fathom site ID</label>
          <input
            id="fathom_site_id"
            name="fathom_site_id"
            defaultValue={client.fathom_site_id ?? ""}
          />
        </div>
        <div>
          <button type="submit" className="btn primary">
            Save changes
          </button>
        </div>
      </form>

      <div className="card">
        <div className="card-title">Danger zone</div>
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Removing a client permanently deletes its recommendations, notes, and
          history.
        </div>
        <RemoveClientButton clientId={client.id} clientName={client.name} />
      </div>
    </div>
  );
}

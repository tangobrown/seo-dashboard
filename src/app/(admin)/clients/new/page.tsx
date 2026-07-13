import Link from "next/link";
import { createClientAction } from "@/lib/actions/clients";

export default function NewClientPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Link href="/clients">Clients</Link> · New
          </div>
          <h1>New client</h1>
          <p className="subtitle">
            Add a managed site. The SiteGuru site is the domain SiteGuru audits;
            it&apos;s how weekly recommendations are pulled for this client.
          </p>
        </div>
      </div>

      <form className="form" action={createClientAction}>
        <div className="field">
          <label htmlFor="name">Client name</label>
          <input id="name" name="name" required placeholder="Devon Joinery" />
        </div>
        <div className="field">
          <label htmlFor="url">Website URL</label>
          <input id="url" name="url" placeholder="https://www.devonjoinery.co.uk" />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="siteguru_site_id">SiteGuru site (domain)</label>
            <input
              id="siteguru_site_id"
              name="siteguru_site_id"
              placeholder="devonjoinery.co.uk"
            />
            <div className="help">The domain as SiteGuru knows it.</div>
          </div>
          <div className="field">
            <label htmlFor="platform">Platform</label>
            <select id="platform" name="platform" defaultValue="nextjs">
              <option value="nextjs">Next.js</option>
              <option value="wordpress">WordPress</option>
              <option value="other">Other</option>
            </select>
            <div className="help">Used by the auto-fix pipeline (later phase).</div>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="github_repo">GitHub repo</label>
            <input id="github_repo" name="github_repo" placeholder="owner/repo" />
          </div>
          <div className="field">
            <label htmlFor="vercel_project_id">Vercel project ID</label>
            <input id="vercel_project_id" name="vercel_project_id" placeholder="prj_…" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="fathom_site_id">Fathom site ID</label>
          <input id="fathom_site_id" name="fathom_site_id" placeholder="ABCDEF" />
        </div>

        <hr />

        <h3>Viewer login (optional)</h3>
        <p className="help">
          Create a read-only login for the client. You set the initial password;
          it goes straight to Supabase Auth and is never stored here.
        </p>
        <div className="field-row">
          <div className="field">
            <label htmlFor="viewer_email">Viewer email</label>
            <input id="viewer_email" name="viewer_email" type="email" placeholder="client@example.com" />
          </div>
          <div className="field">
            <label htmlFor="viewer_password">Initial password</label>
            <input id="viewer_password" name="viewer_password" type="password" autoComplete="new-password" />
          </div>
        </div>

        <div className="split">
          <button type="submit" className="btn primary lg">
            Create client
          </button>
          <Link href="/clients" className="btn ghost lg">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

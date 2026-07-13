import { requireViewer } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

export default async function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireViewer();
  return (
    <div className="main">
      <div className="topbar">
        <div className="crumbs">
          <span className="brand-name" style={{ fontWeight: 600, color: "var(--ink)" }}>
            SEO Autopilot
          </span>
        </div>
        <div className="right">
          <form action={signOut}>
            <button type="submit" className="btn ghost sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}

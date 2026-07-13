import { requireAdmin } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { ToasterProvider } from "@/components/Toaster";

const NAV: NavItem[] = [
  { href: "/clients", label: "Clients", icon: "ri-building-line" },
  { href: "/deploys", label: "Deploys", icon: "ri-git-pull-request-line" },
  { href: "/settings", label: "Settings", icon: "ri-settings-3-line" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();
  const userName = profile.full_name || user.email || "Admin";

  return (
    <ToasterProvider>
      <div className="shell">
        <Sidebar nav={NAV} userName={userName} roleLabel="Admin" />
        <main className="main">{children}</main>
      </div>
    </ToasterProvider>
  );
}

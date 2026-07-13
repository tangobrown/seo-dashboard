"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "recommendations", label: "Recommendations" },
  { slug: "implementations", label: "Implementations" },
  { slug: "notes", label: "Notes & tasks" },
  { slug: "brief", label: "Brief" },
  { slug: "settings", label: "Settings" },
];

export function TabNav({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const base = `/clients/${clientId}`;
  return (
    <div className="tabs">
      {TABS.map((t) => {
        const href = `${base}/${t.slug}`;
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={t.slug} href={href} className={active ? "active" : ""}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

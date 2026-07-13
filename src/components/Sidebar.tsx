"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { initials } from "@/lib/format";

export type NavItem = { href: string; label: string; icon: string };

export function Sidebar({
  nav,
  userName,
  roleLabel,
}: {
  nav: NavItem[];
  userName: string;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SA</div>
        <div className="brand-name">SEO Autopilot</div>
      </div>
      <nav>
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <i className={`ico ${item.icon}`} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="spacer" />
      <div className="me">
        <div className="avatar">{initials(userName)}</div>
        <div className="meta">
          <div className="name">{userName}</div>
          <div className="role">{roleLabel}</div>
        </div>
      </div>
      <form action={signOut}>
        <button type="submit" className="signout">
          Sign out
        </button>
      </form>
    </aside>
  );
}

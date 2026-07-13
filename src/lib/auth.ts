import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Resolve the current auth user and their profile (role + client_id). */
export async function getUserAndProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null, supabase };
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return { user, profile: (profile as Profile | null) ?? null, supabase };
}

/** Gate an admin-only surface. Redirects viewers to their portal, guests to login. */
export async function requireAdmin() {
  const { user, profile, supabase } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (!profile || profile.role !== "admin") redirect("/portal");
  return { user, profile, supabase };
}

/** Gate the viewer portal. Redirects admins to the admin app, guests to login. */
export async function requireViewer() {
  const { user, profile, supabase } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/clients");
  return { user, profile, supabase };
}

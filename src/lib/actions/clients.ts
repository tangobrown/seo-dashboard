"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncClientRecommendations } from "@/lib/siteguru/sync";
import { initials } from "@/lib/format";
import type { ClientBrief } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Create a client and (optionally) provision its viewer login. The viewer's
 * password is entered by the admin, handed straight to Supabase Auth via the
 * admin API, and never stored in our own tables (brief §9).
 */
export async function createClientAction(formData: FormData) {
  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const name = str(formData, "name");
  if (!name) throw new Error("Client name is required.");

  const viewerEmail = str(formData, "viewer_email");
  const viewerPassword = String(formData.get("viewer_password") ?? "");

  const { data: client, error } = await admin
    .from("clients")
    .insert({
      name,
      url: str(formData, "url") || null,
      initial: initials(name),
      siteguru_site_id: str(formData, "siteguru_site_id") || null,
      github_repo: str(formData, "github_repo") || null,
      vercel_project_id: str(formData, "vercel_project_id") || null,
      fathom_site_id: str(formData, "fathom_site_id") || null,
      platform: str(formData, "platform") || null,
      viewer_email: viewerEmail || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !client) {
    throw new Error(`Could not create client: ${error?.message ?? "unknown error"}`);
  }

  if (viewerEmail && viewerPassword) {
    const { data: created, error: authErr } = await admin.auth.admin.createUser({
      email: viewerEmail,
      password: viewerPassword,
      email_confirm: true,
      app_metadata: { role: "viewer", client_id: client.id },
    });
    if (authErr || !created.user) {
      throw new Error(
        `Client created, but the viewer login could not be set up: ${authErr?.message ?? "unknown error"}`,
      );
    }
    await admin.from("profiles").insert({
      user_id: created.user.id,
      role: "viewer",
      client_id: client.id,
      full_name: `${name} (viewer)`,
    });
  }

  await admin.from("audit_log").insert({
    client_id: client.id,
    actor: "admin",
    action: "client_created",
    payload: { name },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientSettingsAction(
  clientId: string,
  formData: FormData,
) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("clients")
    .update({
      name: str(formData, "name") || undefined,
      url: str(formData, "url") || null,
      siteguru_site_id: str(formData, "siteguru_site_id") || null,
      github_repo: str(formData, "github_repo") || null,
      vercel_project_id: str(formData, "vercel_project_id") || null,
      fathom_site_id: str(formData, "fathom_site_id") || null,
      platform: str(formData, "platform") || null,
    })
    .eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}/settings`);
  revalidatePath("/clients");
}

export async function updateClientBriefAction(
  clientId: string,
  brief: ClientBrief,
) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("clients")
    .update({ brief })
    .eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}/brief`);
}

export async function removeClientAction(clientId: string) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  // Cascade removes recommendations/notes/tasks/etc.; viewer profiles.client_id
  // is set null by the FK. (Deleting the orphaned viewer auth user is a Phase-5
  // cleanup item.)
  const { error } = await admin.from("clients").delete().eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  redirect("/clients");
}

/** "Pull SiteGuru now" — real ingestion via the service-role client. */
export async function syncClientAction(clientId: string): Promise<number> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: client, error } = await admin
    .from("clients")
    .select("id, siteguru_site_id")
    .eq("id", clientId)
    .single();
  if (error || !client) throw new Error("Client not found.");
  const result = await syncClientRecommendations(admin, client);
  revalidatePath(`/clients/${clientId}/recommendations`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  return result.count;
}

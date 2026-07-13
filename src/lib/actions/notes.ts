"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function addNoteAction(clientId: string, formData: FormData) {
  const { user } = await requireAdmin();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("notes")
    .insert({ client_id: clientId, author_id: user.id, body });
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}/notes`);
}

export async function addTaskAction(clientId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("tasks")
    .insert({ client_id: clientId, title, status: "open" });
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}/notes`);
}

export async function toggleTaskAction(taskId: string) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: task, error } = await admin
    .from("tasks")
    .select("id, client_id, status")
    .eq("id", taskId)
    .single();
  if (error || !task) throw new Error("Task not found.");
  const done = task.status === "done";
  const { error: updErr } = await admin
    .from("tasks")
    .update({
      status: done ? "open" : "done",
      completed_at: done ? null : new Date().toISOString(),
    })
    .eq("id", taskId);
  if (updErr) throw new Error(updErr.message);
  revalidatePath(`/clients/${task.client_id}/notes`);
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { RecStatus } from "@/lib/types";

async function setStatus(recId: string, status: RecStatus, action: string) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const { data: rec, error } = await admin
    .from("recommendations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", recId)
    .select("id, client_id, title, type")
    .single();

  if (error || !rec) {
    throw new Error(`Could not update recommendation: ${error?.message ?? "not found"}`);
  }

  await admin.from("audit_log").insert({
    client_id: rec.client_id,
    actor: "admin",
    action,
    payload: { recommendation: rec.id, title: rec.title, type: rec.type },
  });

  // ── PHASE 2 SEAM ────────────────────────────────────────────────────────
  // When status === "accepted" and rec.type === "auto", this is where a later
  // milestone will dispatch the client repo's GitHub Actions workflow
  // (workflow_dispatch) to make the edit and open an auto-PR. Milestone 1 stops
  // here: no implementations row, no external call.
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath(`/clients/${rec.client_id}/recommendations`);
  revalidatePath(`/clients/${rec.client_id}`);
  revalidatePath("/clients");
}

export async function acceptRecommendation(recId: string) {
  await setStatus(recId, "accepted", "accepted");
}

export async function declineRecommendation(recId: string) {
  await setStatus(recId, "declined", "declined");
}

export async function reopenRecommendation(recId: string) {
  await setStatus(recId, "pending", "reopened");
}

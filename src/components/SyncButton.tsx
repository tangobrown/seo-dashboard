"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncClientAction } from "@/lib/actions/clients";
import { useToast } from "@/components/Toaster";

export function SyncButton({ clientId }: { clientId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function onClick() {
    startTransition(async () => {
      try {
        const count = await syncClientAction(clientId);
        toast(`Sync complete — ${count} recommendation${count === 1 ? "" : "s"}`);
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Sync failed");
      }
    });
  }

  return (
    <button className="btn ghost sm" onClick={onClick} disabled={pending}>
      <i className="ico ri-refresh-line" aria-hidden />
      {pending ? "Pulling…" : "Pull SiteGuru now"}
    </button>
  );
}

"use client";

import { useTransition } from "react";
import { removeClientAction } from "@/lib/actions/clients";

export function RemoveClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !window.confirm(
        `Remove "${clientName}"? This deletes its recommendations, notes and history. This cannot be undone.`,
      )
    )
      return;
    startTransition(() => removeClientAction(clientId));
  }

  return (
    <button className="btn danger" onClick={onClick} disabled={pending}>
      {pending ? "Removing…" : "Remove client"}
    </button>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptRecommendation,
  declineRecommendation,
  reopenRecommendation,
} from "@/lib/actions/recommendations";
import { useToast } from "@/components/Toaster";
import type { RecStatus } from "@/lib/types";

export function RecActions({
  recId,
  status,
}: {
  recId: string;
  status: RecStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function run(fn: (id: string) => Promise<void>, message: string) {
    startTransition(async () => {
      try {
        await fn(recId);
        toast(message);
        router.refresh();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (status === "implemented") {
    return <span className="badge success dot">Done</span>;
  }

  if (status === "accepted") {
    return (
      <div className="actions">
        <span className="badge success dot">Accepted</span>
        <button
          className="btn ghost sm"
          disabled={pending}
          onClick={() => run(reopenRecommendation, "Moved back to pending")}
        >
          Reopen
        </button>
      </div>
    );
  }

  if (status === "declined" || status === "failed") {
    return (
      <div className="actions">
        <span className="badge neutral">
          {status === "failed" ? "Failed" : "Dismissed"}
        </span>
        <button
          className="btn ghost sm"
          disabled={pending}
          onClick={() => run(reopenRecommendation, "Moved back to pending")}
        >
          Reopen
        </button>
      </div>
    );
  }

  // pending
  return (
    <div className="actions">
      <button
        className="btn primary sm"
        disabled={pending}
        onClick={() => run(acceptRecommendation, "Accepted")}
      >
        Accept
      </button>
      <button
        className="btn ghost sm"
        disabled={pending}
        onClick={() => run(declineRecommendation, "Declined")}
      >
        Decline
      </button>
    </div>
  );
}

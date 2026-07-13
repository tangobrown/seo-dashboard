"use client";

import { useState, useTransition } from "react";
import { updateClientBriefAction } from "@/lib/actions/clients";
import { useToast } from "@/components/Toaster";
import { BRIEF_FIELDS, briefToMarkdown } from "@/lib/brief";
import type { ClientBrief } from "@/lib/types";

export function BriefEditor({
  clientId,
  clientName,
  initial,
}: {
  clientId: string;
  clientName: string;
  initial: ClientBrief;
}) {
  const [brief, setBrief] = useState<ClientBrief>(initial);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function set(key: keyof ClientBrief, value: string) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      try {
        await updateClientBriefAction(clientId, brief);
        toast("Brief saved");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(briefToMarkdown(clientName, brief));
      toast("CLAUDE.md copied to clipboard");
    } catch {
      toast("Could not copy");
    }
  }

  return (
    <div className="stack lg">
      <div className="row between">
        <p className="muted tiny" style={{ maxWidth: 520 }}>
          Context the automated agent uses to make on-brand edits. Export it as a
          CLAUDE.md for the client&apos;s repo.
        </p>
        <div className="split">
          <button className="btn ghost sm" onClick={copyMarkdown}>
            <i className="ico ri-file-copy-line" aria-hidden /> Copy CLAUDE.md
          </button>
          <button className="btn primary sm" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save brief"}
          </button>
        </div>
      </div>

      <div className="form" style={{ maxWidth: "none" }}>
        {BRIEF_FIELDS.map((field) => (
          <div className="field" key={field.key}>
            <label>{field.label}</label>
            {field.long ? (
              <textarea
                value={brief[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            ) : (
              <input
                value={brief[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

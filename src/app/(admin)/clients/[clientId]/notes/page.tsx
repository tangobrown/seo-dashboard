import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  addNoteAction,
  addTaskAction,
  toggleTaskAction,
} from "@/lib/actions/notes";
import { timeAgo } from "@/lib/format";
import type { Note, ClientTask } from "@/lib/types";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: noteData }, { data: taskData }] = await Promise.all([
    supabase
      .from("notes")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
  ]);

  const notes = (noteData ?? []) as Note[];
  const tasks = (taskData ?? []) as ClientTask[];

  const addNote = addNoteAction.bind(null, clientId);
  const addTask = addTaskAction.bind(null, clientId);

  return (
    <div className="grid cols-2">
      {/* Notes */}
      <div className="stack lg">
        <div className="section-head">
          <h3>Notes</h3>
          <span className="count">{notes.length}</span>
        </div>
        <form action={addNote} className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <textarea
              name="body"
              placeholder="Add a note about this client…"
              required
            />
          </div>
          <div>
            <button type="submit" className="btn primary sm">
              Add note
            </button>
          </div>
        </form>
        <div className="stack">
          {notes.length === 0 ? (
            <div className="muted tiny">No notes yet.</div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="note">
                <div className="meta">
                  <span>Admin</span>
                  <span>{timeAgo(n.created_at)}</span>
                </div>
                <div className="body">{n.body}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="stack lg">
        <div className="section-head">
          <h3>Manual tasks</h3>
          <span className="count">{tasks.length}</span>
        </div>
        <form action={addTask} className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <input name="title" placeholder="Log a manual task…" required />
          </div>
          <div>
            <button type="submit" className="btn primary sm">
              Add task
            </button>
          </div>
        </form>
        <div className="card tight">
          {tasks.length === 0 ? (
            <div className="muted tiny">No tasks yet.</div>
          ) : (
            tasks.map((t) => {
              const toggle = toggleTaskAction.bind(null, t.id);
              const done = t.status === "done";
              return (
                <div key={t.id} className={`task${done ? " done" : ""}`}>
                  <form action={toggle}>
                    <button
                      type="submit"
                      className={`check${done ? " done" : ""}`}
                      aria-label={done ? "Mark as open" : "Mark as done"}
                    >
                      {done && <i className="ico ri-check-line" aria-hidden />}
                    </button>
                  </form>
                  <span className="ttl">{t.title}</span>
                  <span className="when">
                    {done && t.completed_at ? timeAgo(t.completed_at) : ""}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

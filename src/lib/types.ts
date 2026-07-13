/** Domain types mirroring the Postgres schema (supabase/migrations/0001_init.sql). */

export type UserRole = "admin" | "viewer";
export type RecType = "auto" | "manual";
export type RecStatus = "pending" | "accepted" | "declined" | "implemented" | "failed";
export type ImplStatus = "queued" | "running" | "merged" | "failed" | "manual";
export type TaskStatus = "open" | "done";

export type Client = {
  id: string;
  name: string;
  url: string | null;
  initial: string | null;
  siteguru_site_id: string | null;
  github_repo: string | null;
  vercel_project_id: string | null;
  fathom_site_id: string | null;
  platform: string | null;
  viewer_email: string | null;
  health: number | null;
  brief: ClientBrief;
  last_sync: string | null;
  created_by: string | null;
  created_at: string;
};

export type ClientBrief = {
  industry?: string;
  products?: string;
  audience?: string;
  voice_tone?: string;
  voice_dos?: string;
  voice_donts?: string;
  markets?: string;
  language?: string;
  priority_keywords?: string;
  competitors?: string;
  goals?: string;
  constraints?: string;
};

export type Profile = {
  user_id: string;
  role: UserRole;
  client_id: string | null;
  full_name: string | null;
  created_at: string;
};

export type Recommendation = {
  id: string;
  client_id: string;
  source: string;
  external_key: string;
  title: string;
  description: string | null;
  category: string | null;
  type: RecType;
  status: RecStatus;
  severity: string | null;
  affected_pages: number | null;
  raw: unknown;
  created_at: string;
  updated_at: string;
};

export type Implementation = {
  id: string;
  recommendation_id: string | null;
  client_id: string;
  status: ImplStatus;
  commit_sha: string | null;
  pr_url: string | null;
  deploy_url: string | null;
  applied_at: string;
};

export type Note = {
  id: string;
  client_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

export type ClientTask = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
};

export type AuditEntry = {
  id: string;
  client_id: string | null;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
};

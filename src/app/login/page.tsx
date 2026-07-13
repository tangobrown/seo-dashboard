"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Hard navigation so the server picks up the fresh auth cookie immediately.
    window.location.assign("/");
  }

  return (
    <div className="login-wrap">
      <div className="login-pitch">
        <div className="brand">
          <div className="brand-mark">SA</div>
          <div className="brand-name">SEO Autopilot</div>
        </div>
        <div>
          <div className="headline">
            SEO that fixes itself. <em>You stay in control.</em>
          </div>
          <div className="points">
            <div className="point">
              <div className="dot">1</div>
              <span>Pulls fresh recommendations from SiteGuru every week.</span>
            </div>
            <div className="point">
              <div className="dot">2</div>
              <span>Splits them into safe auto-fixes and manual actions.</span>
            </div>
            <div className="point">
              <div className="dot">3</div>
              <span>You approve; changes ship as reviewable pull requests.</span>
            </div>
          </div>
        </div>
        <div className="foot">Bespoke SEO management for growing sites.</div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={onSubmit}>
          <h1>Sign in</h1>
          <p className="sub">Welcome back. Enter your details to continue.</p>
          <div className="form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="badge danger" role="alert">
                {error}
              </div>
            )}
            <button className="btn primary lg" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

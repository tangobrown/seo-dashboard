/* SEO Autopilot — frontend prototype.
   Hash router + view functions. All data via window.DB (mock). */

(function () {
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let state = window.DB.load();

  /* ---------- Utilities ---------- */
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function h(strings, ...vals) {
    let out = '';
    strings.forEach((str, i) => {
      out += str;
      if (i < vals.length) {
        const v = vals[i];
        if (Array.isArray(v)) out += v.join('');
        else if (v && typeof v === 'object' && v.__raw) out += v.html;
        else out += esc(v);
      }
    });
    return out;
  }
  const raw = (html) => ({ __raw: true, html });

  const fmtNum = (n) => new Intl.NumberFormat('en-GB').format(Math.round(n));
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtRel = (iso) => {
    const d = new Date(iso);
    const today = new Date('2026-06-08T10:00:00Z');
    const diff = Math.round((today - d) / 86400000);
    if (diff <= 0) return 'today';
    if (diff === 1) return 'yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.round(diff / 7)} wk ago`;
    return `${Math.round(diff / 30)} mo ago`;
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  function commit() { window.DB.save(state); }

  /* ---------- Icons (Remix Icon — https://remixicon.com) ---------- */
  const ICONS = {
    dashboard: '<i class="ri-dashboard-line ico"></i>',
    clients: '<i class="ri-team-line ico"></i>',
    recs: '<i class="ri-lightbulb-flash-line ico"></i>',
    deploys: '<i class="ri-rocket-2-line ico"></i>',
    analytics: '<i class="ri-line-chart-line ico"></i>',
    settings: '<i class="ri-settings-3-line ico"></i>',
    plus: '<i class="ri-add-line ico"></i>',
    check: '<i class="ri-check-line ico"></i>',
    x: '<i class="ri-close-line ico"></i>',
    arrow: '<i class="ri-arrow-right-line ico"></i>',
    search: '<i class="ri-search-line ico"></i>',
    sparkle: '<i class="ri-sparkling-2-line ico"></i>',
    external: '<i class="ri-external-link-line ico"></i>',
    revert: '<i class="ri-arrow-go-back-line ico"></i>',
    system: '<i class="ri-cpu-line ico"></i>',
    admin: '<i class="ri-user-3-line ico"></i>',
  };

  /* ---------- Layout shell ---------- */
  function shell(activeKey, body, opts = {}) {
    const navItems = [
      { key: 'dashboard', label: 'Overview', icon: ICONS.dashboard, href: '#/admin' },
      { key: 'clients', label: 'Clients', icon: ICONS.clients, href: '#/admin/clients' },
      { key: 'recs', label: 'Recommendations', icon: ICONS.recs, href: '#/admin/recommendations' },
      { key: 'deploys', label: 'Deploys', icon: ICONS.deploys, href: '#/admin/deploys' },
    ];
    const settingsItems = [{ key: 'settings', label: 'Settings', icon: ICONS.settings, href: '#/admin/settings' }];
    const initials = 'YO';
    const whoName = 'You';
    const whoRole = 'Admin';

    return h`
      <div class="shell">
        <aside class="sidebar">
          <a href="#/" class="brand">
            <div class="brand-mark">S</div>
            <div class="brand-name">SEO Autopilot</div>
          </a>
          <nav>
            ${raw(navItems.map(n => `
              <a class="nav-item ${n.key === activeKey ? 'active' : ''}" href="${n.href}">
                ${n.icon}<span>${n.label}</span>
              </a>`).join(''))}
            ${raw(settingsItems.length ? '<div class="nav-section">Account</div>' : '')}
            ${raw(settingsItems.map(n => `
              <a class="nav-item ${n.key === activeKey ? 'active' : ''}" href="${n.href}">
                ${n.icon}<span>${n.label}</span>
              </a>`).join(''))}
          </nav>
          <div class="spacer"></div>
          <div class="me">
            <div class="avatar">${initials}</div>
            <div class="meta">
              <div class="name">${whoName}</div>
              <div class="role">${whoRole}</div>
            </div>
          </div>
          <button class="signout" data-action="signout">Sign out</button>
        </aside>
        <main class="main">
          <div class="topbar">
            <div class="crumbs">${raw(opts.crumbs || '')}</div>
            <div class="right">
              ${raw(opts.topbarRight || '')}
            </div>
          </div>
          <div class="page">
            ${raw(body)}
          </div>
        </main>
      </div>
    `;
  }

  /* ---------- LOGIN ---------- */
  function viewLogin() {
    return h`
      <div class="login-wrap">
        <section class="login-pitch">
          <div class="brand">
            <div class="brand-mark">S</div>
            <div class="brand-name">SEO Autopilot</div>
          </div>
          <div>
            <div class="headline">SEO maintenance,<br/><em>on autopilot.</em></div>
            <div class="points">
              <div class="point"><div class="dot">1</div><span>Pulls fresh recommendations from SiteGuru every week.</span></div>
              <div class="point"><div class="dot">2</div><span>Auto-PRs, preview-gated, one-click revertable.</span></div>
              <div class="point"><div class="dot">3</div><span>Send monthly client updates with stats baked in.</span></div>
            </div>
          </div>
          <div class="foot">A control plane for the SEO work you'd rather not do by hand.</div>
        </section>
        <section class="login-form-wrap">
          <form class="login-form" data-form="login">
            <h1>Sign in</h1>
            <p class="sub">Welcome back.</p>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" value="you@example.com" />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" value="••••••••" />
            </div>
            <button type="submit" class="btn primary lg" style="margin-top:8px;">Continue ${raw(ICONS.arrow)}</button>
            <p class="tiny muted" style="margin-top:16px;">Prototype — no real auth. Data lives in your browser.</p>
          </form>
        </section>
      </div>
    `;
  }

  function bindLogin(root) {
    root.querySelector('[data-form="login"]').addEventListener('submit', (e) => {
      e.preventDefault();
      state.session.role = 'admin';
      state.session.userId = 'u_admin';
      state.session.clientId = null;
      commit();
      location.hash = '#/admin';
    });
  }

  /* ---------- ADMIN: Overview ---------- */
  function viewAdminOverview() {
    const recs = state.recommendations;
    const pending = recs.filter(r => r.status === 'pending');
    const auto = pending.filter(r => r.type === 'auto');
    const manual = pending.filter(r => r.type === 'manual');
    const implementedThisWeek = state.implementations.filter(i => {
      const d = new Date(i.applied_at);
      return (new Date('2026-06-08') - d) / 86400000 < 7;
    });

    const kpis = [
      { label: 'Clients', value: state.clients.length, delta: 'Steady portfolio' },
      { label: 'Pending recs', value: pending.length, delta: `${auto.length} auto · ${manual.length} manual` },
      { label: 'Auto-implemented · 7d', value: implementedThisWeek.length, delta: 'All checks passed', cls: 'up' },
      { label: 'Manual outstanding', value: manual.length, delta: 'Across all clients' },
    ];

    const recentImpl = [...state.implementations].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)).slice(0, 6);

    const clientCards = state.clients.map(c => {
      const cPending = recs.filter(r => r.client_id === c.id && r.status === 'pending');
      const cAuto = cPending.filter(r => r.type === 'auto').length;
      const cManual = cPending.filter(r => r.type === 'manual').length;
      return `
        <a href="#/admin/clients/${c.id}" class="card" style="display:block; text-decoration:none;">
          <div class="row between">
            <div class="row">
              <div class="client-avatar" style="width:36px;height:36px;font-size:14px;border-radius:6px;">${c.initial}</div>
              <div>
                <div class="card-title">${esc(c.name)}</div>
                <div class="card-sub">${esc(c.url)}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:600;color:var(--ink);font-size:18px;">${c.health}</div>
              <div class="tiny muted">Health</div>
            </div>
          </div>
          <hr style="margin:16px 0;">
          <div class="row" style="gap:8px; flex-wrap:wrap;">
            <span class="badge auto dot">${cAuto} auto pending</span>
            <span class="badge manual dot">${cManual} manual</span>
            <span class="badge neutral">Last sync ${fmtRel(c.last_sync)}</span>
          </div>
        </a>
      `;
    }).join('');

    return shell('dashboard', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Overview</div>
          <h1>Good morning.</h1>
          <p class="subtitle">Here's the state of the portfolio. ${pending.length} recommendations waiting on you across ${state.clients.length} client${state.clients.length === 1 ? '' : 's'}.</p>
        </div>
        <div class="page-actions">
          <button class="btn ghost" data-action="resync">Pull SiteGuru now</button>
          <a href="#/admin/clients/new" class="btn primary">${raw(ICONS.plus)} New client</a>
        </div>
      </div>

      <div class="hero" style="margin-bottom:24px;">
        <div>
          <h2>${auto.length} change${auto.length === 1 ? '' : 's'} ready to ship</h2>
          <p>Accept them and Claude Code will write the edit, open a PR, run preview checks, and merge on green. You don't have to touch the code.</p>
        </div>
        <div class="actions">
          <a href="#/admin/recommendations" class="btn dark">Review queue ${raw(ICONS.arrow)}</a>
        </div>
      </div>

      <div class="grid kpis" style="margin-bottom:24px;">
        ${raw(kpis.map(k => `
          <div class="kpi">
            <div class="label">${k.label}</div>
            <div class="value">${k.value}</div>
            <div class="delta ${k.cls || ''}">${k.delta}</div>
          </div>`).join(''))}
      </div>

      <div class="grid split-7-5">
        <div class="card">
          <div class="section-head">
            <h3>Clients</h3>
            <a href="#/admin/clients" class="tiny muted">View all →</a>
          </div>
          <div class="grid cols-2" style="gap:12px;">
            ${raw(clientCards)}
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <h3>Recent deploys</h3>
            <span class="count">last 7 days</span>
          </div>
          ${raw(recentImpl.length ? recentImpl.map(i => {
            const r = recs.find(x => x.id === i.recommendation_id);
            const c = state.clients.find(x => x.id === i.client_id);
            return `
              <div class="tl-item">
                <div class="tl-dot success">${ICONS.check}</div>
                <div class="tl-body">
                  <div class="tl-title">${esc(r ? r.title : 'Recommendation')}</div>
                  <div class="tl-sub">${esc(c ? c.name : '')} · ${esc(i.commit_sha.slice(0, 7))}</div>
                  <div class="tl-links">
                    <a href="${esc(i.pr_url)}" target="_blank" rel="noreferrer">PR ${ICONS.external}</a>
                    <a href="${esc(i.deploy_url)}" target="_blank" rel="noreferrer">Deploy ${ICONS.external}</a>
                  </div>
                </div>
                <div class="tl-time">${fmtRel(i.applied_at)}</div>
              </div>
            `;
          }).join('') : '<div class="empty"><h3>No deploys yet</h3><p>Accepted auto-recs will show up here.</p></div>')}
        </div>
      </div>
    `, {
      crumbs: h`<a href="#/admin">Dashboard</a>`,
    });
  }

  /* ---------- ADMIN: Clients table ---------- */
  function viewAdminClients() {
    const rows = state.clients.map(c => {
      const cRecs = state.recommendations.filter(r => r.client_id === c.id);
      const cPending = cRecs.filter(r => r.status === 'pending').length;
      const cImpl = state.implementations.filter(i => i.client_id === c.id).length;
      return `
        <tr data-href="#/admin/clients/${c.id}">
          <td>
            <div class="row">
              <div class="client-avatar" style="width:30px;height:30px;font-size:12px;border-radius:5px;">${c.initial}</div>
              <div>
                <div class="cell-name">${esc(c.name)}</div>
                <div class="cell-sub">${esc(c.url)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge neutral">${c.health} health</span></td>
          <td>${cPending} pending</td>
          <td>${cImpl} merged</td>
          <td>${fmtRel(c.last_sync)}</td>
          <td class="cell-right">${ICONS.arrow}</td>
        </tr>
      `;
    }).join('');

    return shell('clients', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Clients</div>
          <h1>All clients</h1>
          <p class="subtitle">Every site you manage. Click through to review its recommendations and deploys.</p>
        </div>
        <div class="page-actions">
          <a href="#/admin/clients/new" class="btn primary">${raw(ICONS.plus)} New client</a>
        </div>
      </div>

      <div class="row between" style="margin-bottom:16px;">
        <div class="search">${raw(ICONS.search)}<input placeholder="Search clients…" data-filter="clients" /></div>
        <div class="muted tiny">${state.clients.length} clients</div>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Health</th>
              <th>Pending</th>
              <th>Implemented</th>
              <th>Last sync</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${raw(rows)}</tbody>
        </table>
      </div>
    `, { crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span>Clients` });
  }

  /* ---------- ADMIN: New client ---------- */
  function viewNewClient() {
    return shell('clients', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Clients</div>
          <h1>Add a new client</h1>
          <p class="subtitle">All you need are the four IDs that connect the dashboard to their site, plus the contact email for the monthly update.</p>
        </div>
      </div>

      <form class="form" data-form="new-client">
        <div class="field">
          <label>Client name</label>
          <input name="name" required placeholder="e.g. Northwind Bakery" />
        </div>
        <div class="field">
          <label>Site URL</label>
          <input name="url" required placeholder="northwindbakery.com" />
        </div>
        <div class="field-row">
          <div class="field">
            <label>SiteGuru site ID</label>
            <input name="siteguru_site_id" placeholder="sg_…" />
            <div class="help">From SiteGuru's site settings.</div>
          </div>
          <div class="field">
            <label>Fathom site ID</label>
            <input name="fathom_site_id" placeholder="NWBKRY" />
            <div class="help">7-char Fathom code.</div>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>GitHub repo</label>
            <input name="github_repo" placeholder="tango/northwind-site" />
            <div class="help">Used for workflow_dispatch.</div>
          </div>
          <div class="field">
            <label>Vercel project ID</label>
            <input name="vercel_project_id" placeholder="prj_…" />
          </div>
        </div>
        <hr/>
        <h3 style="font-size:16px;">Client contact</h3>
        <p class="muted tiny" style="margin-top:-8px;">Where the monthly update email gets sent.</p>
        <div class="field">
          <label>Contact email</label>
          <input name="viewer_email" type="email" placeholder="owner@northwindbakery.com" />
        </div>
        <div class="row" style="margin-top:8px; gap:8px;">
          <button type="submit" class="btn primary">Create client</button>
          <a href="#/admin/clients" class="btn ghost">Cancel</a>
        </div>
      </form>
    `, { crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span><a href="#/admin/clients">Clients</a><span class="sep">/</span>New` });
  }

  function bindNewClient(root) {
    root.querySelector('[data-form="new-client"]').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = (fd.get('name') || '').toString().trim();
      if (!name) return;
      const id = 'c_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) + '_' + Math.random().toString(36).slice(2, 6);
      const initial = name[0]?.toUpperCase() || 'C';
      state.clients.push({
        id,
        name,
        url: (fd.get('url') || '').toString().trim(),
        initial,
        siteguru_site_id: (fd.get('siteguru_site_id') || '').toString().trim(),
        github_repo: (fd.get('github_repo') || '').toString().trim(),
        vercel_project_id: (fd.get('vercel_project_id') || '').toString().trim(),
        fathom_site_id: (fd.get('fathom_site_id') || '').toString().trim(),
        viewer_email: (fd.get('viewer_email') || '').toString().trim(),
        health: 70,
        last_sync: new Date().toISOString(),
      });
      commit();
      toast(`Created ${name}`);
      location.hash = `#/admin/clients/${id}`;
    });
  }

  /* ---------- ADMIN: All recommendations queue ---------- */
  function viewAdminRecs() {
    const recs = state.recommendations.filter(r => r.status === 'pending');
    const auto = recs.filter(r => r.type === 'auto');
    const manual = recs.filter(r => r.type === 'manual');
    return shell('recs', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Recommendations</div>
          <h1>Review queue</h1>
          <p class="subtitle">${recs.length} pending across ${new Set(recs.map(r=>r.client_id)).size} client${new Set(recs.map(r=>r.client_id)).size === 1 ? '' : 's'}. Accept the auto changes — the manual ones need your judgement.</p>
        </div>
      </div>

      <div class="grid cols-2">
        <div>
          <div class="section-head">
            <h3>Auto-implementable</h3>
            <span class="count">${auto.length}</span>
          </div>
          <div class="stack">${raw(auto.map(r => recCard(r, true)).join('') || emptyHtml('All caught up', 'No auto recommendations waiting.'))}</div>
        </div>
        <div>
          <div class="section-head">
            <h3>Manual</h3>
            <span class="count">${manual.length}</span>
          </div>
          <div class="stack">${raw(manual.map(r => recCard(r, true)).join('') || emptyHtml('Nothing to action', 'No manual recommendations pending.'))}</div>
        </div>
      </div>
    `, { crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span>Recommendations` });
  }

  function emptyHtml(title, sub) {
    return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(sub)}</p></div>`;
  }

  function recCard(r, showClient) {
    const c = state.clients.find(x => x.id === r.client_id);
    const isPending = r.status === 'pending';
    const isAccepted = r.status === 'accepted';
    const isImpl = r.status === 'implemented';
    const isDecl = r.status === 'declined';
    const isFailed = r.status === 'failed';
    const badge = r.type === 'auto' ? '<span class="badge auto dot">Auto</span>' : '<span class="badge manual dot">Manual</span>';
    let statusBadge = '';
    if (isAccepted) statusBadge = '<span class="badge info dot">Queued · running</span>';
    if (isImpl) statusBadge = '<span class="badge success dot">Implemented</span>';
    if (isDecl) statusBadge = '<span class="badge neutral">Declined</span>';
    if (isFailed) statusBadge = '<span class="badge danger dot">Failed checks</span>';

    let actions = '';
    if (isPending && r.type === 'auto') {
      actions = `
        <button class="btn primary sm" data-action="accept" data-id="${r.id}">${ICONS.check} Accept</button>
        <button class="btn ghost sm" data-action="decline" data-id="${r.id}">Decline</button>
      `;
    } else if (isPending && r.type === 'manual') {
      actions = `
        <button class="btn ghost sm" data-action="logged" data-id="${r.id}">Mark as logged</button>
        <button class="btn ghost sm" data-action="decline" data-id="${r.id}">Dismiss</button>
      `;
    } else if (isAccepted) {
      actions = `<span class="muted tiny">PR in flight…</span>`;
    } else if (isImpl) {
      actions = `<button class="btn ghost sm" data-action="revert" data-id="${r.id}">${ICONS.revert} Revert</button>`;
    }

    const clientChip = showClient && c ? `<a href="#/admin/clients/${c.id}" class="badge neutral">${esc(c.name)}</a>` : '';

    return `
      <div class="rec ${isImpl ? 'is-implemented' : ''} ${isDecl ? 'is-declined' : ''}">
        <div>
          <div class="title-row">
            ${badge}${statusBadge}${clientChip}
          </div>
          <div class="title">${esc(r.title)}</div>
          <div class="desc">${esc(r.description)}</div>
          <div class="meta">
            <span>Source: SiteGuru</span>
            <span>Category: ${esc(r.category)}</span>
            <span>${fmtRel(r.created_at)}</span>
          </div>
        </div>
        <div class="actions">${actions}</div>
      </div>
    `;
  }

  function bindRecActions(root) {
    root.querySelectorAll('[data-action="accept"]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.id;
      const r = state.recommendations.find(x => x.id === id);
      if (!r) return;
      r.status = 'accepted';
      state.audit.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, actor: 'admin', action: 'accepted', payload: { recommendation: r.id, title: r.title }, created_at: new Date().toISOString() });
      state.audit.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, actor: 'system', action: 'workflow_dispatched', payload: { recommendation: r.id }, created_at: new Date().toISOString() });
      commit();
      toast('Accepted — dispatching workflow to GitHub…');
      // Simulate async PR + merge after a beat
      setTimeout(() => simulateMerge(r.id), 1800);
      render();
    }));
    root.querySelectorAll('[data-action="decline"]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = state.recommendations.find(x => x.id === b.dataset.id);
      if (!r) return;
      r.status = 'declined';
      state.audit.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, actor: 'admin', action: 'declined', payload: { recommendation: r.id, title: r.title }, created_at: new Date().toISOString() });
      commit();
      toast('Declined');
      render();
    }));
    root.querySelectorAll('[data-action="logged"]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = state.recommendations.find(x => x.id === b.dataset.id);
      if (!r) return;
      state.tasks.unshift({ id: 't_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, title: r.title, status: 'open', completed_at: null });
      r.status = 'declined';
      commit();
      toast('Added to manual tasks');
      render();
    }));
    root.querySelectorAll('[data-action="revert"]').forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = state.recommendations.find(x => x.id === b.dataset.id);
      if (!r) return;
      r.status = 'pending';
      state.implementations = state.implementations.filter(i => i.recommendation_id !== r.id);
      state.audit.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, actor: 'admin', action: 'reverted', payload: { recommendation: r.id }, created_at: new Date().toISOString() });
      commit();
      toast('Revert PR opened');
      render();
    }));
  }

  function simulateMerge(recId) {
    const r = state.recommendations.find(x => x.id === recId);
    if (!r || r.status !== 'accepted') return;
    r.status = 'implemented';
    const sha = Math.random().toString(16).slice(2, 9);
    const prNum = 100 + Math.floor(Math.random() * 400);
    const c = state.clients.find(x => x.id === r.client_id);
    state.implementations.unshift({
      id: 'i_' + Math.random().toString(36).slice(2, 8),
      recommendation_id: r.id,
      client_id: r.client_id,
      status: 'merged',
      commit_sha: sha,
      pr_url: `https://github.com/${c?.github_repo || 'tango/site'}/pull/${prNum}`,
      deploy_url: `https://${(c?.url || 'site').replace(/\./g,'-')}-git-seo-${r.id}.vercel.app`,
      applied_at: new Date().toISOString(),
    });
    state.audit.unshift({ id: 'a_' + Math.random().toString(36).slice(2, 8), client_id: r.client_id, actor: 'system', action: 'pr_merged', payload: { recommendation: r.id }, created_at: new Date().toISOString() });
    commit();
    toast('PR merged · deploy live');
    render();
  }

  /* ---------- ADMIN: Deploys (audit) ---------- */
  function viewDeploys() {
    const all = [...state.implementations].sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    return shell('deploys', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Deploys</div>
          <h1>Implementation history</h1>
          <p class="subtitle">Every change the dashboard has shipped, across the whole portfolio. One row = one merged PR = one production deploy.</p>
        </div>
      </div>
      <div class="card">
        <div class="timeline">
          ${raw(all.length ? all.map(i => {
            const r = state.recommendations.find(x => x.id === i.recommendation_id);
            const c = state.clients.find(x => x.id === i.client_id);
            return `
              <div class="tl-item">
                <div class="tl-dot success">${ICONS.check}</div>
                <div class="tl-body">
                  <div class="tl-title">${esc(r?.title || 'Implementation')}</div>
                  <div class="tl-sub">${esc(c?.name || '')} · commit ${esc(i.commit_sha.slice(0,7))} · ${esc(i.status)}</div>
                  <div class="tl-links">
                    <a href="${esc(i.pr_url)}" target="_blank" rel="noreferrer">View PR ${ICONS.external}</a>
                    <a href="${esc(i.deploy_url)}" target="_blank" rel="noreferrer">View deploy ${ICONS.external}</a>
                  </div>
                </div>
                <div class="tl-time">${fmtDate(i.applied_at)}</div>
              </div>
            `;
          }).join('') : emptyHtml('No deploys yet', 'Accept an auto-recommendation to ship your first change.'))}
        </div>
      </div>
    `, { crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span>Deploys` });
  }

  /* ---------- ADMIN: Settings ---------- */
  function viewSettings() {
    return shell('settings', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Account</div>
          <h1>Settings</h1>
          <p class="subtitle">Wiring for the integrations the dashboard talks to. In production these live in Vercel secrets / Supabase, not the browser.</p>
        </div>
      </div>
      <div class="grid cols-2">
        <div class="card">
          <div class="card-title">SiteGuru MCP</div>
          <div class="card-sub" style="margin-bottom:12px;">Pulls a fresh batch of recommendations per client, weekly.</div>
          <div class="field"><label>MCP endpoint</label><input value="mcp://siteguru.com/mcp" disabled /></div>
          <div class="field" style="margin-top:12px;"><label>API token</label><input type="password" value="••••••••••••" disabled /></div>
          <span class="badge success dot" style="margin-top:12px;">Connected</span>
        </div>
        <div class="card">
          <div class="card-title">GitHub App</div>
          <div class="card-sub" style="margin-bottom:12px;">Dispatches the per-client repo workflow that runs Claude Code.</div>
          <div class="field"><label>Installation ID</label><input value="ghi_4837210" disabled /></div>
          <div class="field" style="margin-top:12px;"><label>Workflow file</label><input value=".github/workflows/seo-autopilot.yml" disabled /></div>
          <span class="badge success dot" style="margin-top:12px;">Connected</span>
        </div>
        <div class="card">
          <div class="card-title">Fathom Analytics</div>
          <div class="card-sub" style="margin-bottom:12px;">Server-side, cached for 5 min per client.</div>
          <div class="field"><label>API key</label><input type="password" value="••••••••••••" disabled /></div>
          <span class="badge success dot" style="margin-top:12px;">Connected</span>
        </div>
        <div class="card">
          <div class="card-title">Anthropic / Claude Code</div>
          <div class="card-sub" style="margin-bottom:12px;">Headless agent that performs the edit inside the client's repo CI.</div>
          <div class="field"><label>Model</label><input value="claude-sonnet-4-6" disabled /></div>
          <div class="field" style="margin-top:12px;"><label>Max turns per run</label><input value="6" disabled /></div>
          <span class="badge success dot" style="margin-top:12px;">Connected</span>
        </div>
      </div>
      <div class="card" style="margin-top:16px;">
        <div class="card-title">Prototype</div>
        <div class="card-sub" style="margin-bottom:12px;">Reset all local data to the seed state.</div>
        <button class="btn ghost" data-action="reset-data">Reset demo data</button>
      </div>
    `, { crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span>Settings` });
  }

  /* ---------- ADMIN: Client detail ---------- */
  function viewClient(id, subroute) {
    const c = state.clients.find(x => x.id === id);
    if (!c) return shell('clients', h`<div class="empty"><h3>Client not found</h3><a href="#/admin/clients" class="btn ghost" style="margin-top:12px;">Back to clients</a></div>`);

    const cRecs = state.recommendations.filter(r => r.client_id === c.id);
    const tab = subroute || 'recs';

    const tabs = ['recs', 'implementations', 'notes', 'update', 'analytics', 'settings'];
    const tabLabels = { recs: 'Recommendations', implementations: 'Implementations', notes: 'Notes & tasks', update: 'Client update', analytics: 'Analytics', settings: 'Settings' };

    let body = '';
    if (tab === 'recs') body = tabRecs(c, cRecs);
    else if (tab === 'implementations') body = tabImpls(c);
    else if (tab === 'notes') body = tabNotes(c);
    else if (tab === 'update') body = tabUpdate(c);
    else if (tab === 'analytics') body = tabAnalytics(c);
    else if (tab === 'settings') body = tabClientSettings(c);

    return shell('clients', h`
      <div class="client-header" style="margin-bottom:8px;">
        <div class="client-avatar">${c.initial}</div>
        <div style="flex:1;">
          <div class="eyebrow">Client</div>
          <h1>${esc(c.name)}</h1>
          <div class="url"><a href="https://${esc(c.url)}" target="_blank" rel="noreferrer">${esc(c.url)} ${raw(ICONS.external)}</a></div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:24px;font-weight:600;color:var(--ink);">${c.health}<span class="muted tiny" style="font-weight:400;"> /100</span></div>
          <div class="tiny muted">SEO health</div>
        </div>
      </div>

      <div class="tabs">
        ${raw(tabs.map(t => `<button data-tab="${t}" class="${t === tab ? 'active' : ''}">${tabLabels[t]}</button>`).join(''))}
      </div>

      ${raw(body)}
    `, {
      crumbs: h`<a href="#/admin">Dashboard</a><span class="sep">/</span><a href="#/admin/clients">Clients</a><span class="sep">/</span>${c.name}`,
      topbarRight: h`
        <button class="btn ghost sm" data-action="resync-client" data-id="${c.id}">Pull SiteGuru</button>
      `,
    });
  }

  function tabRecs(c, all) {
    const pending = all.filter(r => r.status === 'pending' || r.status === 'accepted');
    const auto = pending.filter(r => r.type === 'auto');
    const manual = pending.filter(r => r.type === 'manual');
    const handled = all.filter(r => r.status === 'implemented' || r.status === 'declined' || r.status === 'failed');

    return `
      <div class="grid cols-2">
        <div>
          <div class="section-head"><h3>Auto-implementable</h3><span class="count">${auto.length}</span></div>
          <div class="stack">${auto.map(r => recCard(r, false)).join('') || emptyHtml('Caught up', 'No auto recommendations waiting.')}</div>
        </div>
        <div>
          <div class="section-head"><h3>Manual</h3><span class="count">${manual.length}</span></div>
          <div class="stack">${manual.map(r => recCard(r, false)).join('') || emptyHtml('Nothing to action', 'No manual recommendations pending.')}</div>
        </div>
      </div>

      ${handled.length ? `
        <div style="margin-top:24px;">
          <div class="section-head"><h3>Previously handled</h3><span class="count">${handled.length}</span></div>
          <div class="stack">${handled.map(r => recCard(r, false)).join('')}</div>
        </div>
      ` : ''}
    `;
  }

  function tabImpls(c) {
    const impls = state.implementations.filter(i => i.client_id === c.id).sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    const audit = state.audit.filter(a => a.client_id === c.id);
    return `
      <div class="grid split-7-5">
        <div class="card">
          <div class="card-title">Deploys</div>
          <div class="card-sub" style="margin-bottom:16px;">Every merged PR triggered from this client's recommendations.</div>
          <div class="timeline">
            ${impls.length ? impls.map(i => {
              const r = state.recommendations.find(x => x.id === i.recommendation_id);
              return `
                <div class="tl-item">
                  <div class="tl-dot success">${ICONS.check}</div>
                  <div class="tl-body">
                    <div class="tl-title">${esc(r?.title || 'Implementation')}</div>
                    <div class="tl-sub">commit ${esc(i.commit_sha.slice(0,7))} · ${esc(i.status)}</div>
                    <div class="tl-links">
                      <a href="${esc(i.pr_url)}" target="_blank" rel="noreferrer">PR ${ICONS.external}</a>
                      <a href="${esc(i.deploy_url)}" target="_blank" rel="noreferrer">Deploy ${ICONS.external}</a>
                      ${r ? `<a href="#" data-action="revert" data-id="${r.id}">Revert</a>` : ''}
                    </div>
                  </div>
                  <div class="tl-time">${fmtDate(i.applied_at)}</div>
                </div>
              `;
            }).join('') : emptyHtml('No deploys yet', 'Accept an auto-recommendation to ship one.')}
          </div>
        </div>
        <div class="card">
          <div class="card-title">Audit log</div>
          <div class="card-sub" style="margin-bottom:16px;">Every accept, decline, dispatch, merge and revert.</div>
          ${audit.length ? audit.map(a => `
            <div class="tl-item">
              <div class="tl-dot ${a.action === 'pr_merged' ? 'success' : a.action === 'declined' ? 'warn' : ''}">${a.actor === 'system' ? ICONS.system : ICONS.admin}</div>
              <div class="tl-body">
                <div class="tl-title">${esc(a.action.replace(/_/g, ' '))}</div>
                <div class="tl-sub">${esc(a.actor)} · ${esc(a.payload?.title || a.payload?.recommendation || '')}</div>
              </div>
              <div class="tl-time">${fmtRel(a.created_at)}</div>
            </div>
          `).join('') : emptyHtml('Quiet so far', 'Actions on this client will show up here.')}
        </div>
      </div>
    `;
  }

  function tabNotes(c) {
    const notes = state.notes.filter(n => n.client_id === c.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const tasks = state.tasks.filter(t => t.client_id === c.id);
    const open = tasks.filter(t => t.status === 'open');
    const done = tasks.filter(t => t.status === 'done');
    return `
      <div class="grid split-7-5">
        <div class="card">
          <div class="row between" style="margin-bottom:12px;">
            <div><div class="card-title">Notes</div><div class="card-sub">Free-text context. Visible to the viewer.</div></div>
          </div>
          <form data-form="new-note" style="margin-bottom:16px;">
            <textarea name="body" placeholder="Add a note about this client…" style="width:100%; border:1px solid var(--border-strong); border-radius:4px; padding:10px 12px; min-height:80px; font-family:inherit; font-size:14px;"></textarea>
            <div class="row" style="margin-top:8px; justify-content:flex-end;">
              <button class="btn primary sm" type="submit">Post note</button>
            </div>
          </form>
          <div class="stack">
            ${notes.length ? notes.map(n => `
              <div class="note">
                <div class="meta"><span>${esc(n.author)}</span><span>${fmtDate(n.created_at)}</span></div>
                <div class="body">${esc(n.body)}</div>
              </div>
            `).join('') : emptyHtml('No notes yet', 'Add the first one above.')}
          </div>
        </div>
        <div class="card">
          <div class="row between" style="margin-bottom:12px;">
            <div><div class="card-title">Manual tasks</div><div class="card-sub">Track manual SEO work you've done.</div></div>
          </div>
          <form data-form="new-task" style="margin-bottom:8px;">
            <div class="row">
              <input name="title" placeholder="e.g. Rewrote catering page copy" style="flex:1; border:1px solid var(--border-strong); border-radius:4px; padding:8px 10px; font-size:14px;"/>
              <button class="btn primary sm" type="submit">${ICONS.plus} Add</button>
            </div>
          </form>
          <div class="section-head" style="margin-top:16px;"><h3 style="font-size:14px;">Open</h3><span class="count">${open.length}</span></div>
          ${open.length ? open.map(t => `
            <div class="task">
              <div class="check" data-action="toggle-task" data-id="${t.id}"></div>
              <div class="ttl">${esc(t.title)}</div>
              <div class="when">${t.completed_at ? fmtRel(t.completed_at) : ''}</div>
            </div>
          `).join('') : '<div class="muted tiny" style="padding:8px 0;">Nothing open.</div>'}
          ${done.length ? `
            <div class="section-head" style="margin-top:16px;"><h3 style="font-size:14px;">Done</h3><span class="count">${done.length}</span></div>
            ${done.map(t => `
              <div class="task done">
                <div class="check done" data-action="toggle-task" data-id="${t.id}">${ICONS.check}</div>
                <div class="ttl">${esc(t.title)}</div>
                <div class="when">${t.completed_at ? fmtRel(t.completed_at) : ''}</div>
              </div>
            `).join('')}
          ` : ''}
        </div>
      </div>
    `;
  }

  function tabAnalytics(c) {
    const s = window.DB.stats(c.id);
    const totalPv = s.days.reduce((a, d) => a + d.pageviews, 0);
    const totalUv = s.days.reduce((a, d) => a + d.uniques, 0);
    const last7 = s.days.slice(-7).reduce((a, d) => a + d.pageviews, 0);
    const prev7 = s.days.slice(-14, -7).reduce((a, d) => a + d.pageviews, 0);
    const change = prev7 ? ((last7 - prev7) / prev7) * 100 : 0;
    const changeStr = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';

    return `
      <div class="grid kpis" style="margin-bottom:16px;">
        <div class="kpi"><div class="label">Pageviews · 30d</div><div class="value">${fmtNum(totalPv)}</div><div class="delta">via Fathom</div></div>
        <div class="kpi"><div class="label">Unique visitors · 30d</div><div class="value">${fmtNum(totalUv)}</div><div class="delta">${Math.round(totalUv / Math.max(totalPv, 1) * 100)}% of pageviews</div></div>
        <div class="kpi"><div class="label">Last 7 vs prev 7</div><div class="value">${changeStr}</div><div class="delta ${change >= 0 ? 'up' : 'down'}">${fmtNum(last7)} vs ${fmtNum(prev7)} pv</div></div>
        <div class="kpi"><div class="label">Live now</div><div class="value">${s.current_visitors}</div><div class="delta">current visitors</div></div>
      </div>
      <div class="grid split-7-5">
        <div class="chart">
          <div class="head">
            <div>
              <div class="card-title">Daily pageviews</div>
              <div class="card-sub">Last 30 days · Fathom Analytics</div>
            </div>
            <div class="legend"><span><span class="legend-dot" style="background:var(--ink)"></span>Pageviews</span><span><span class="legend-dot" style="background:var(--muted-2)"></span>Uniques</span></div>
          </div>
          ${renderChart(s.days)}
        </div>
        <div class="card">
          <div class="card-title">Top pages</div>
          <div class="card-sub" style="margin-bottom:16px;">Last 30 days.</div>
          ${s.topPages.map(p => {
            const max = s.topPages[0].pv;
            const w = (p.pv / max) * 100;
            return `
              <div style="margin-bottom:14px;">
                <div class="row between" style="margin-bottom:4px;">
                  <span style="font-weight:500;">${esc(p.path)}</span>
                  <span class="muted tiny">${fmtNum(p.pv)}</span>
                </div>
                <div style="height:6px; background:var(--surface-alt); border-radius:3px; overflow:hidden;">
                  <div style="height:100%; width:${w}%; background:var(--ink); border-radius:3px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderChart(days) {
    const w = 600, hH = 200, pad = 28;
    const maxPv = Math.max(...days.map(d => d.pageviews));
    const stepX = (w - pad * 2) / (days.length - 1);
    const yScale = (v) => hH - pad - (v / maxPv) * (hH - pad * 1.6);
    const pvPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${yScale(d.pageviews)}`).join(' ');
    const uvPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${yScale(d.uniques)}`).join(' ');
    const areaPath = pvPath + ` L ${pad + (days.length - 1) * stepX} ${hH - pad} L ${pad} ${hH - pad} Z`;
    const ticks = [0, Math.round(maxPv / 2), maxPv];
    return `
      <svg viewBox="0 0 ${w} ${hH}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradPv" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#37352f" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#37352f" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${ticks.map(t => `<line x1="${pad}" x2="${w - pad}" y1="${yScale(t)}" y2="${yScale(t)}" stroke="#ecebea" stroke-width="1"/>`).join('')}
        ${ticks.map(t => `<text x="6" y="${yScale(t) + 4}" font-size="10" fill="#9b9a97">${fmtNum(t)}</text>`).join('')}
        <path d="${areaPath}" fill="url(#gradPv)"/>
        <path d="${uvPath}" fill="none" stroke="#9b9a97" stroke-width="2" stroke-linejoin="round"/>
        <path d="${pvPath}" fill="none" stroke="#37352f" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function tabClientSettings(c) {
    return `
      <div class="card">
        <div class="card-title">Integration IDs</div>
        <div class="card-sub" style="margin-bottom:16px;">The references the dashboard uses to talk to this client's stack.</div>
        <div class="grid cols-2">
          <div class="field"><label>SiteGuru site ID</label><input value="${esc(c.siteguru_site_id)}" /></div>
          <div class="field"><label>Fathom site ID</label><input value="${esc(c.fathom_site_id)}" /></div>
          <div class="field"><label>GitHub repo</label><input value="${esc(c.github_repo)}" /></div>
          <div class="field"><label>Vercel project ID</label><input value="${esc(c.vercel_project_id)}" /></div>
        </div>
        <div class="row" style="margin-top:16px; justify-content:flex-end;">
          <button class="btn primary">Save changes</button>
        </div>
      </div>
      <div class="card" style="margin-top:16px;">
        <div class="card-title">Client contact</div>
        <div class="card-sub" style="margin-bottom:16px;">Where the monthly update email is sent.</div>
        <div class="field"><label>Contact email</label><input value="${esc(c.viewer_email || '')}" /></div>
      </div>
      <div class="card" style="margin-top:16px; border-color:#f3b4b0;">
        <div class="card-title" style="color:var(--danger);">Danger zone</div>
        <div class="card-sub" style="margin-bottom:16px;">Removes this client from the dashboard. Their site, repo and Vercel project are untouched.</div>
        <button class="btn danger" data-action="remove-client" data-id="${c.id}">Remove ${esc(c.name)}</button>
      </div>
    `;
  }

  /* ---------- ADMIN: Client update (email drafter) ---------- */
  function generateDraft(client) {
    const s = window.DB.stats(client.id);
    const last30Pv = s.days.reduce((a, d) => a + d.pageviews, 0);
    const last30Uv = s.days.reduce((a, d) => a + d.uniques, 0);
    const prev30Pv = s.prev30.reduce((a, d) => a + d.pageviews, 0);
    const change = prev30Pv ? ((last30Pv - prev30Pv) / prev30Pv) * 100 : 0;
    const changeStr = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
    const dirWord = change >= 0 ? 'up' : 'down';

    const today = new Date('2026-06-08T10:00:00Z');
    const since = new Date(today.getTime() - 30 * 86400000);
    const monthLabel = today.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

    const impls = state.implementations
      .filter(i => i.client_id === client.id && new Date(i.applied_at) >= since)
      .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

    const doneTasks = state.tasks
      .filter(t => t.client_id === client.id && t.status === 'done' && t.completed_at && new Date(t.completed_at) >= since)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

    const pendingManual = state.recommendations
      .filter(r => r.client_id === client.id && r.type === 'manual' && r.status === 'pending');

    const shortDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const implLines = impls.map(i => {
      const r = state.recommendations.find(x => x.id === i.recommendation_id);
      return `• ${r ? r.title : 'SEO improvement'} (${shortDate(i.applied_at)})`;
    });
    const taskLines = doneTasks.map(t => `• ${t.title} (${shortDate(t.completed_at)})`);
    const manualLines = pendingManual.map(r => `• ${r.title}`);
    const topPages = s.topPages.slice(0, 3).map(p => `• ${p.path} — ${fmtNum(p.pv)} views`);

    const subject = `Your ${monthLabel} SEO update — ${client.name}`;

    const lines = [];
    lines.push(`Hi ${client.name} team,`);
    lines.push('');
    lines.push(`Here's your monthly SEO update.`);
    lines.push('');
    lines.push(`Traffic — last 30 days`);
    lines.push(`• ${fmtNum(last30Pv)} pageviews (${changeStr} ${dirWord} on the previous 30 days)`);
    lines.push(`• ${fmtNum(last30Uv)} unique visitors`);
    lines.push('');
    lines.push(`Top pages`);
    topPages.forEach(l => lines.push(l));
    lines.push('');
    if (implLines.length) {
      lines.push(`Changes we shipped (${implLines.length})`);
      implLines.forEach(l => lines.push(l));
      lines.push('');
    }
    if (taskLines.length) {
      lines.push(`Manual work completed (${taskLines.length})`);
      taskLines.forEach(l => lines.push(l));
      lines.push('');
    }
    if (manualLines.length) {
      lines.push(`For your consideration`);
      lines.push(`A few things we'd like to talk through with you:`);
      manualLines.forEach(l => lines.push(l));
      lines.push('');
    }
    lines.push(`Happy to jump on a call if anything here needs unpacking.`);
    lines.push('');
    lines.push(`Thanks,`);
    lines.push(`The SEO Autopilot team`);

    return { subject, body: lines.join('\n') };
  }

  function tabUpdate(c) {
    if (!state.drafts) state.drafts = {};
    let draft = state.drafts[c.id];
    if (!draft) {
      draft = generateDraft(c);
      state.drafts[c.id] = draft;
      commit();
    }
    const sent = (state.sent_emails || []).filter(e => e.client_id === c.id).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
    const recipient = c.viewer_email || '(no contact email — add one in Settings)';
    const noEmail = !c.viewer_email;

    return `
      <div class="card">
        <div class="card-title">Compose monthly update</div>
        <div class="card-sub" style="margin-bottom:20px;">Auto-drafted from this client's stats and the work we've shipped. Tweak as needed, then send.</div>

        <div class="email-row">
          <div class="email-label">To</div>
          <div class="email-value">${esc(recipient)}</div>
        </div>
        <div class="email-row">
          <div class="email-label">Subject</div>
          <input class="email-input" data-field="subject" value="${esc(draft.subject)}" />
        </div>
        <textarea class="email-body" data-field="body" spellcheck="true">${esc(draft.body)}</textarea>

        <div class="email-actions">
          <div class="row" style="gap:8px;">
            <button class="btn ghost sm" data-action="regen-draft" data-id="${c.id}">Regenerate from data</button>
            <button class="btn ghost sm" data-action="copy-draft">Copy</button>
          </div>
          <button class="btn primary" data-action="send-draft" data-id="${c.id}" ${noEmail ? 'disabled' : ''}>Send update ${ICONS.arrow}</button>
        </div>
        <div class="email-hint">Mocked in this prototype — no email leaves your browser.</div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-title">Sent history</div>
        <div class="card-sub" style="margin-bottom:16px;">Previous monthly updates sent to ${esc(c.name)}.</div>
        ${sent.length ? `<div class="timeline">${sent.map(e => `
          <div class="tl-item">
            <div class="tl-dot success">${ICONS.check}</div>
            <div class="tl-body">
              <div class="tl-title">${esc(e.subject)}</div>
              <div class="tl-sub">To ${esc(e.to || 'no recipient')}</div>
            </div>
            <div class="tl-time">${fmtDate(e.sent_at)}</div>
          </div>
        `).join('')}</div>` : '<div class="muted tiny">No updates sent yet.</div>'}
      </div>
    `;
  }

  function bindUpdate(root) {
    const subjectInput = root.querySelector('[data-field="subject"]');
    const bodyTextarea = root.querySelector('[data-field="body"]');
    const parts = parseHash();
    const cid = parts[2];
    if (!cid) return;

    const persist = () => {
      if (!state.drafts) state.drafts = {};
      if (!state.drafts[cid]) state.drafts[cid] = { subject: '', body: '' };
      if (subjectInput) state.drafts[cid].subject = subjectInput.value;
      if (bodyTextarea) state.drafts[cid].body = bodyTextarea.value;
      commit();
    };

    if (subjectInput) subjectInput.addEventListener('input', persist);
    if (bodyTextarea) bodyTextarea.addEventListener('input', persist);

    root.querySelectorAll('[data-action="regen-draft"]').forEach(b => b.addEventListener('click', () => {
      const c = state.clients.find(x => x.id === b.dataset.id);
      if (!c) return;
      const editedSubject = subjectInput && subjectInput.value.trim();
      const editedBody = bodyTextarea && bodyTextarea.value.trim();
      if (editedSubject || editedBody) {
        if (!confirm('Replace your current draft with a fresh one from the latest data?')) return;
      }
      state.drafts[c.id] = generateDraft(c);
      commit();
      toast('Draft regenerated');
      render();
    }));

    root.querySelectorAll('[data-action="copy-draft"]').forEach(b => b.addEventListener('click', () => {
      if (!subjectInput || !bodyTextarea) return;
      const text = `Subject: ${subjectInput.value}\n\n${bodyTextarea.value}`;
      const done = () => toast('Copied to clipboard');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => toast('Copy failed'));
      } else {
        bodyTextarea.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); }
      }
    }));

    root.querySelectorAll('[data-action="send-draft"]').forEach(b => b.addEventListener('click', () => {
      const c = state.clients.find(x => x.id === b.dataset.id);
      if (!c) return;
      if (!c.viewer_email) { toast('Add a contact email in Settings first'); return; }
      if (!state.sent_emails) state.sent_emails = [];
      state.sent_emails.unshift({
        id: 'e_' + Math.random().toString(36).slice(2, 8),
        client_id: c.id,
        to: c.viewer_email,
        subject: subjectInput ? subjectInput.value : '',
        body: bodyTextarea ? bodyTextarea.value : '',
        sent_at: new Date().toISOString(),
      });
      state.audit.unshift({
        id: 'a_' + Math.random().toString(36).slice(2, 8),
        client_id: c.id, actor: 'admin', action: 'email_sent',
        payload: { subject: subjectInput ? subjectInput.value : '' },
        created_at: new Date().toISOString(),
      });
      if (state.drafts) delete state.drafts[c.id];
      commit();
      toast(`Update sent to ${c.viewer_email}`);
      render();
    }));
  }

  /* ---------- VIEWER: Portal (deferred — kept for future) ----------
  function viewPortal() {
    const cid = state.session.clientId;
    const c = state.clients.find(x => x.id === cid);
    if (!c) { location.hash = '#/login'; return ''; }
    const impls = state.implementations.filter(i => i.client_id === c.id).sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
    const manual = state.recommendations.filter(r => r.client_id === c.id && r.type === 'manual' && r.status === 'pending');
    const notes = state.notes.filter(n => n.client_id === c.id);
    const tasksDone = state.tasks.filter(t => t.client_id === c.id && t.status === 'done');

    const s = window.DB.stats(c.id);
    const totalPv = s.days.reduce((a, d) => a + d.pageviews, 0);
    const totalUv = s.days.reduce((a, d) => a + d.uniques, 0);

    return shell('dashboard', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Your site</div>
          <h1>${c.name}</h1>
          <p class="subtitle">${c.url} · Here's everything that's been happening with your SEO this month.</p>
        </div>
      </div>

      <div class="hero" style="margin-bottom:24px;">
        <div>
          <h2>${impls.length} change${impls.length === 1 ? '' : 's'} shipped to your site</h2>
          <p>Each one was reviewed, automatically tested in a preview environment, and merged only when all checks passed.</p>
        </div>
        <div class="actions">
          <a href="#/portal/analytics" class="btn dark">View traffic ${raw(ICONS.arrow)}</a>
        </div>
      </div>

      <div class="grid kpis" style="margin-bottom:24px;">
        <div class="kpi"><div class="label">Changes this month</div><div class="value">${impls.length}</div><div class="delta up">All checks passed</div></div>
        <div class="kpi"><div class="label">Pageviews · 30d</div><div class="value">${fmtNum(totalPv)}</div><div class="delta">via Fathom</div></div>
        <div class="kpi"><div class="label">Visitors · 30d</div><div class="value">${fmtNum(totalUv)}</div><div class="delta">${Math.round(totalUv/Math.max(totalPv,1)*100)}% of pageviews</div></div>
        <div class="kpi"><div class="label">For you to action</div><div class="value">${manual.length}</div><div class="delta">manual recommendations</div></div>
      </div>

      <div class="grid split-7-5">
        <div class="card">
          <div class="card-title">What we've changed for you</div>
          <div class="card-sub" style="margin-bottom:16px;">A timeline of every SEO improvement made to your site.</div>
          <div class="timeline">
            ${raw(impls.length ? impls.map(i => {
              const r = state.recommendations.find(x => x.id === i.recommendation_id);
              return `
                <div class="tl-item">
                  <div class="tl-dot success">${ICONS.check}</div>
                  <div class="tl-body">
                    <div class="tl-title">${esc(r?.title || 'SEO improvement')}</div>
                    <div class="tl-sub">${esc(r?.description || '')}</div>
                  </div>
                  <div class="tl-time">${fmtDate(i.applied_at)}</div>
                </div>
              `;
            }).join('') : emptyHtml('No changes yet', 'Soon — your first batch is in review.'))}
          </div>

          ${tasksDone.length ? `
            <hr/>
            <div class="card-title">Manual work we've done</div>
            <div class="card-sub" style="margin-bottom:12px;">SEO work that needed a human touch.</div>
            ${tasksDone.map(t => `
              <div class="task done">
                <div class="check done">${ICONS.check}</div>
                <div class="ttl">${esc(t.title)}</div>
                <div class="when">${t.completed_at ? fmtRel(t.completed_at) : ''}</div>
              </div>
            `).join('')}
          ` : ''}
        </div>

        <div>
          <div class="card">
            <div class="card-title">Recommended for you</div>
            <div class="card-sub" style="margin-bottom:16px;">These need a human — let's chat through them.</div>
            <div class="stack">
              ${raw(manual.length ? manual.map(r => `
                <div class="rec">
                  <div>
                    <div class="title-row"><span class="badge manual dot">Manual</span></div>
                    <div class="title">${esc(r.title)}</div>
                    <div class="desc">${esc(r.description)}</div>
                  </div>
                </div>
              `).join('') : emptyHtml('Nothing pending', 'We\'ll surface manual work here when there is some.'))}
            </div>
          </div>

          <div class="card" style="margin-top:16px;">
            <div class="card-title">Notes from your SEO team</div>
            <div class="card-sub" style="margin-bottom:16px;">Context and updates from us.</div>
            <div class="stack">
              ${raw(notes.length ? notes.map(n => `
                <div class="note">
                  <div class="meta"><span>SEO team</span><span>${fmtDate(n.created_at)}</span></div>
                  <div class="body">${esc(n.body)}</div>
                </div>
              `).join('') : emptyHtml('No notes', 'Notes from us will appear here.'))}
            </div>
          </div>
        </div>
      </div>
    `, { crumbs: h`<a href="#/portal">Your dashboard</a>` });
  }

  function viewPortalAnalytics() {
    const cid = state.session.clientId;
    const c = state.clients.find(x => x.id === cid);
    if (!c) { location.hash = '#/login'; return ''; }
    return shell('analytics', h`
      <div class="page-header">
        <div>
          <div class="eyebrow">Analytics</div>
          <h1>Your traffic</h1>
          <p class="subtitle">Pulled from Fathom Analytics. Last 30 days.</p>
        </div>
      </div>
      ${raw(tabAnalytics(c))}
    `, { crumbs: h`<a href="#/portal">Your dashboard</a><span class="sep">/</span>Analytics` });
  }
  ---------- end deferred viewer code ---------- */

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    return raw.split('/').filter(Boolean); // e.g. ['admin','clients','c_x']
  }

  function render() {
    const parts = parseHash();
    if (!state.session.role && parts[0] !== 'login') { location.hash = '#/login'; return; }

    let html = '';
    if (parts[0] === 'login' || parts.length === 0) {
      if (parts.length === 0 && state.session.role === 'admin') {
        location.hash = '#/admin';
        return;
      }
      html = viewLogin();
    } else if (parts[0] === 'admin') {
      if (state.session.role !== 'admin') { location.hash = '#/login'; return; }
      if (parts.length === 1) html = viewAdminOverview();
      else if (parts[1] === 'clients' && parts.length === 2) html = viewAdminClients();
      else if (parts[1] === 'clients' && parts[2] === 'new') html = viewNewClient();
      else if (parts[1] === 'clients' && parts[2]) html = viewClient(parts[2], parts[3]);
      else if (parts[1] === 'recommendations') html = viewAdminRecs();
      else if (parts[1] === 'deploys') html = viewDeploys();
      else if (parts[1] === 'settings') html = viewSettings();
      else html = viewAdminOverview();
    } else if (parts[0] === 'portal') {
      location.hash = '#/admin';
      return;
    } else {
      html = viewAdminOverview();
    }

    app.innerHTML = html;
    bindGlobal(app);
    if (parts[0] === 'login') bindLogin(app);
    if (parts[1] === 'clients' && parts[2] === 'new') bindNewClient(app);
    bindRecActions(app);
    bindTabs(app);
    bindClientPage(app);
    bindNotesTasks(app);
    bindUpdate(app);
    bindTableRows(app);
    bindSearch(app);
  }

  function bindGlobal(root) {
    root.querySelectorAll('[data-action="signout"]').forEach(b => b.addEventListener('click', () => {
      state.session = { userId: null, role: null, clientId: null };
      commit();
      location.hash = '#/login';
    }));
    root.querySelectorAll('[data-action="resync"], [data-action="resync-client"]').forEach(b => b.addEventListener('click', () => {
      toast('Pulling latest recommendations from SiteGuru…');
      setTimeout(() => toast('Sync complete — no new recommendations'), 1400);
    }));
    root.querySelectorAll('[data-action="reset-data"]').forEach(b => b.addEventListener('click', () => {
      state = window.DB.reset();
      state.session = { userId: 'u_admin', role: 'admin', clientId: null };
      commit();
      toast('Demo data reset');
      render();
    }));
    root.querySelectorAll('[data-action="remove-client"]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (!confirm('Remove this client from the dashboard?')) return;
      state.clients = state.clients.filter(c => c.id !== id);
      state.recommendations = state.recommendations.filter(r => r.client_id !== id);
      state.implementations = state.implementations.filter(i => i.client_id !== id);
      state.notes = state.notes.filter(n => n.client_id !== id);
      state.tasks = state.tasks.filter(t => t.client_id !== id);
      state.audit = state.audit.filter(a => a.client_id !== id);
      commit();
      toast('Client removed');
      location.hash = '#/admin/clients';
    }));
  }

  function bindTabs(root) {
    root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
      const parts = parseHash();
      if (parts[0] !== 'admin' || parts[1] !== 'clients' || !parts[2]) return;
      location.hash = `#/admin/clients/${parts[2]}/${b.dataset.tab}`;
    }));
  }

  function bindClientPage(root) {
    // (re-binds revert links inside impl tab — handled by bindRecActions, but those are <a>, intercept default)
    root.querySelectorAll('a[data-action="revert"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); }));
  }

  function bindNotesTasks(root) {
    const noteForm = root.querySelector('[data-form="new-note"]');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const parts = parseHash();
        const cid = parts[2];
        const body = noteForm.querySelector('textarea').value.trim();
        if (!body) return;
        state.notes.unshift({ id: 'n_' + Math.random().toString(36).slice(2, 8), client_id: cid, author: 'admin', body, created_at: new Date().toISOString() });
        commit();
        toast('Note added');
        render();
      });
    }
    const taskForm = root.querySelector('[data-form="new-task"]');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const parts = parseHash();
        const cid = parts[2];
        const title = taskForm.querySelector('input').value.trim();
        if (!title) return;
        state.tasks.unshift({ id: 't_' + Math.random().toString(36).slice(2, 8), client_id: cid, title, status: 'open', completed_at: null });
        commit();
        toast('Task added');
        render();
      });
    }
    root.querySelectorAll('[data-action="toggle-task"]').forEach(el => el.addEventListener('click', () => {
      const t = state.tasks.find(x => x.id === el.dataset.id);
      if (!t) return;
      if (t.status === 'open') { t.status = 'done'; t.completed_at = new Date().toISOString(); }
      else { t.status = 'open'; t.completed_at = null; }
      commit();
      render();
    }));
  }

  function bindTableRows(root) {
    root.querySelectorAll('tr[data-href]').forEach(tr => tr.addEventListener('click', () => {
      location.hash = tr.dataset.href;
    }));
  }

  function bindSearch(root) {
    const input = root.querySelector('[data-filter="clients"]');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      root.querySelectorAll('tr[data-href]').forEach(tr => {
        const txt = tr.textContent.toLowerCase();
        tr.style.display = !q || txt.includes(q) ? '' : 'none';
      });
    });
  }

  /* ---------- Boot ---------- */
  window.addEventListener('hashchange', render);
  render();
})();

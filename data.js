/* Mock data layer for the SEO Autopilot prototype.
   Keeps the same shape the brief's data model implies so it can be
   swapped for a real Supabase client later. Persists to localStorage. */

(function () {
  const STORAGE_KEY = 'seo_autopilot_state_v1';

  const seed = () => {
    const today = new Date('2026-06-08T10:00:00Z');
    const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString();

    return {
      session: { userId: null, role: null, clientId: null },
      drafts: {},
      sent_emails: [],
      clients: [
        {
          id: 'c_northwind',
          name: 'Northwind Bakery',
          url: 'northwindbakery.com',
          initial: 'N',
          siteguru_site_id: 'sg_8231',
          github_repo: 'tango/northwind-site',
          vercel_project_id: 'prj_nw1',
          fathom_site_id: 'NWBKRY',
          health: 78,
          last_sync: daysAgo(1),
          viewer_email: 'owner@northwindbakery.com',
          brief: {
            industry: 'Independent bakery',
            products: 'Fresh sourdough, seasonal pastries, custom celebration cakes. Counter service plus a small café.',
            audience: 'Home cooks and food enthusiasts in north-east London, 28-55, who care about provenance and craft over price.',
            voice_tone: 'Warm, hands-on, knowledgeable without being precious. Like chatting to a baker over the counter.',
            voice_dos: 'Use specific ingredient names\nMention the bakers by name where relevant\nLean on sensory language (crusty, slow-fermented, golden)',
            voice_donts: "Don't use food jargon without unpacking it\nNo exclamation marks\nAvoid corporate-y \"products\" / \"customers\" — say \"breads\" / \"regulars\"",
            markets: 'UK — focus on north-east London',
            language: 'British English',
            priority_keywords: 'sourdough bread hackney\nartisan bakery london\nseasonal pastries n16\ncelebration cakes hackney\nbest croissant east london',
            competitors: 'eltbakery.co.uk — established local rival\nbreadahead.com — bigger London chain\njcbakery.com — newer entrant nearby',
            goals: 'Drive footfall to the Stoke Newington shop. Build search visibility for celebration cake orders (highest-margin product line).',
            constraints: 'Owner runs a "summer sourdough" campaign every July — coordinate any landing-page work with that calendar.',
          },
        },
        {
          id: 'c_skyline',
          name: 'Skyline Travel',
          url: 'skylinetravel.co',
          initial: 'S',
          siteguru_site_id: 'sg_4419',
          github_repo: 'tango/skyline-travel',
          vercel_project_id: 'prj_sk2',
          fathom_site_id: 'SKYLNT',
          health: 64,
          last_sync: daysAgo(2),
          viewer_email: 'maria@skylinetravel.co',
          brief: {
            industry: 'Small-group adventure travel operator',
            products: 'Curated 8-14 day trips to Iceland, Japan, and Patagonia. Max 12 travellers per group. All-inclusive pricing.',
            audience: 'Independent travellers, 35-60, who would normally travel solo but want the logistics handled. Higher disposable income; values experience over luxury.',
            voice_tone: 'Confident, well-travelled, dry sense of humour. Anti-marketing — never use words like "unforgettable" or "journey of a lifetime".',
            voice_dos: 'Be specific about places, food, distances\nQuote past travellers verbatim where possible\nAdmit trade-offs (it rains, hikes are hard)',
            voice_donts: 'No superlatives without proof\nNever say "bucket list"\nAvoid stock travel photography language',
            markets: 'UK + Republic of Ireland primary; Western Europe secondary',
            language: 'British English',
            priority_keywords: 'small group iceland tours\nadventure travel japan small group\npatagonia trekking tours uk\nsmall group adventure travel\nguided iceland ring road',
            competitors: 'exodustravels.com — direct competitor, much bigger\nintrepidtravel.com — broader, also competing on small-group angle\nmuchbetteradventures.com — adventure-only, similar scale to us',
            goals: 'Rank top-3 for "small group iceland tours" in next 6 months. Grow Japan trip enquiries (lowest current conversion).',
            constraints: 'Maria asked to deprioritise blog SEO this quarter — focus on /destinations and /tours hub pages.',
          },
        },
        {
          id: 'c_atlas',
          name: 'Atlas Apparel',
          url: 'atlas-apparel.com',
          initial: 'A',
          siteguru_site_id: 'sg_7702',
          github_repo: 'tango/atlas-apparel',
          vercel_project_id: 'prj_at3',
          fathom_site_id: 'ATLSAP',
          health: 86,
          last_sync: daysAgo(1),
          viewer_email: 'sam@atlas-apparel.com',
          brief: emptyBrief(),
        },
        {
          id: 'c_verdant',
          name: 'Verdant Yoga',
          url: 'verdantyoga.studio',
          initial: 'V',
          siteguru_site_id: 'sg_3155',
          github_repo: 'tango/verdant-yoga',
          vercel_project_id: 'prj_vy4',
          fathom_site_id: 'VRDYGA',
          health: 71,
          last_sync: daysAgo(3),
          viewer_email: 'lila@verdantyoga.studio',
          brief: emptyBrief(),
        },
      ],
      recommendations: [
        // Northwind — pending batch
        rec('r1', 'c_northwind', 'auto', 'Meta description missing on /menu', 'The seasonal menu page has no <meta name="description">. Add a 150-160 char summary highlighting fresh sourdough and pastries.', 'meta_description', 'pending', daysAgo(1)),
        rec('r2', 'c_northwind', 'auto', 'Open Graph image missing on /about', 'No og:image tag detected. Will inject a 1200x630 OG image reference into the page metadata export.', 'open_graph', 'pending', daysAgo(1)),
        rec('r3', 'c_northwind', 'auto', '3 product images missing alt text', 'Three <img> tags on /products have empty alt attributes. Generate descriptive alt text from filenames + product titles.', 'image_alt', 'pending', daysAgo(1)),
        rec('r4', 'c_northwind', 'auto', 'Canonical tag missing on /blog/sourdough-101', 'Add <link rel="canonical"> pointing to the absolute URL to prevent duplicate-content penalties.', 'canonical', 'pending', daysAgo(1)),
        rec('r5', 'c_northwind', 'auto', 'JSON-LD LocalBusiness schema missing', 'Inject LocalBusiness structured data (name, address, opening hours, telephone) on the homepage.', 'structured_data', 'pending', daysAgo(1)),
        rec('r6', 'c_northwind', 'manual', 'Thin content on /catering page', '320 words. Recommend expanding to 600+ with case studies and FAQ. Human writer needed.', 'content_thin', 'pending', daysAgo(1)),
        rec('r7', 'c_northwind', 'manual', 'Backlink opportunity: local food bloggers', 'Identify 5–10 regional food bloggers and pitch a guest post. Outreach work.', 'backlinks', 'pending', daysAgo(1)),
        rec('r8', 'c_northwind', 'manual', 'Improve LCP on /products (4.1s)', 'Largest Contentful Paint above target. Hero image is 1.4MB unoptimised. Needs build-side image optimisation.', 'performance', 'pending', daysAgo(1)),

        // Skyline — mixed states
        rec('r9', 'c_skyline', 'auto', 'Title tag too long on /destinations/tokyo', 'Title is 78 characters; Google truncates around 60. Shorten while keeping target keyword.', 'meta_title', 'pending', daysAgo(2)),
        rec('r10', 'c_skyline', 'auto', 'H1 missing on /tours/iceland', 'No H1 element detected. Promote the page subtitle to H1 with the primary keyword.', 'heading_structure', 'pending', daysAgo(2)),
        rec('r11', 'c_skyline', 'auto', 'robots.txt blocks /sitemap.xml', 'Current robots.txt disallows /sitemap.xml. Remove the disallow line.', 'robots_txt', 'accepted', daysAgo(2)),
        rec('r12', 'c_skyline', 'auto', 'Internal link missing: /destinations → /tours', 'Add a contextual internal link from the destinations index to the tours hub.', 'internal_links', 'implemented', daysAgo(3)),
        rec('r13', 'c_skyline', 'manual', 'Rewrite homepage hero copy', 'Hero copy is generic. Recommend benefit-led rewrite focused on "small-group adventure travel".', 'content_rewrite', 'pending', daysAgo(2)),
        rec('r14', 'c_skyline', 'manual', 'Broken external links (3)', 'Three outbound links to partner sites 404. Needs human to find replacements.', 'broken_links', 'pending', daysAgo(2)),
        rec('r15', 'c_skyline', 'manual', 'Mobile UX: tap target spacing on booking form', 'Submit and cancel buttons are 6px apart on mobile. Design decision required.', 'ux_design', 'pending', daysAgo(2)),

        // Atlas — mostly implemented
        rec('r16', 'c_atlas', 'auto', 'OG description missing on collection pages', '12 product collection pages lack og:description. Generate from product summary.', 'open_graph', 'implemented', daysAgo(5)),
        rec('r17', 'c_atlas', 'auto', 'Duplicate H1 on /shop and /shop/all', 'Two pages share the same H1 "Shop Atlas". Differentiate the second.', 'heading_structure', 'implemented', daysAgo(4)),
        rec('r18', 'c_atlas', 'auto', 'sitemap.xml outdated', 'Sitemap last generated 47 days ago. Trigger a fresh generation in next build.', 'sitemap', 'pending', daysAgo(1)),
        rec('r19', 'c_atlas', 'auto', 'Alt text missing on lookbook images (8)', 'Lookbook gallery images have no alt attributes.', 'image_alt', 'pending', daysAgo(1)),
        rec('r20', 'c_atlas', 'auto', 'Redirect /old-collection → /collections/2025', 'Old URL still returns 200. Add 301 redirect in next.config.js redirects array.', 'redirects', 'declined', daysAgo(1)),
        rec('r21', 'c_atlas', 'manual', 'Product descriptions under 50 words', '24 products have very short descriptions. Recommend AI-assisted expansion + human review.', 'content_thin', 'pending', daysAgo(1)),
        rec('r22', 'c_atlas', 'manual', 'Acquire backlinks from fashion press', 'Pitch a "founder story" angle to 3 fashion magazines.', 'backlinks', 'pending', daysAgo(1)),

        // Verdant
        rec('r23', 'c_verdant', 'auto', 'Meta description missing on /classes', 'Add a class-page summary highlighting beginner-friendly options.', 'meta_description', 'pending', daysAgo(3)),
        rec('r24', 'c_verdant', 'auto', 'Canonical mismatch on /teachers/[name]', 'Canonical tags point to the index instead of self. Fix per-page.', 'canonical', 'pending', daysAgo(3)),
        rec('r25', 'c_verdant', 'auto', 'JSON-LD Event schema missing on workshop pages', 'Add Event structured data so workshops appear as rich results.', 'structured_data', 'pending', daysAgo(3)),
        rec('r26', 'c_verdant', 'auto', 'Heading structure: H3 before H2 on /retreats', 'Out-of-order heading levels. Demote/promote to fix hierarchy.', 'heading_structure', 'pending', daysAgo(3)),
        rec('r27', 'c_verdant', 'manual', 'Add blog content cadence', 'Currently no blog. Recommend 1 article/week on yoga + wellness.', 'content_rewrite', 'pending', daysAgo(3)),
        rec('r28', 'c_verdant', 'manual', 'Improve Core Web Vitals on mobile', 'CLS at 0.18 on /home (target <0.1). Needs layout changes.', 'performance', 'pending', daysAgo(3)),
      ],
      implementations: [
        impl('i1', 'r12', 'c_skyline', 'merged', 'a3f9c21', 'https://github.com/tango/skyline-travel/pull/142', 'https://skyline-travel-git-seo-r12.vercel.app', daysAgo(3)),
        impl('i2', 'r16', 'c_atlas', 'merged', 'b7d2e88', 'https://github.com/tango/atlas-apparel/pull/89', 'https://atlas-apparel-git-seo-r16.vercel.app', daysAgo(5)),
        impl('i3', 'r17', 'c_atlas', 'merged', 'f1a09bb', 'https://github.com/tango/atlas-apparel/pull/91', 'https://atlas-apparel-git-seo-r17.vercel.app', daysAgo(4)),
      ],
      notes: [
        note('n1', 'c_northwind', 'admin', 'Customer mentioned they are running a summer sourdough campaign in July — keep an eye on /summer-sourdough landing page when it ships.', daysAgo(4)),
        note('n2', 'c_skyline', 'admin', 'Maria asked us to deprioritise blog SEO work this month; focus on /destinations pages.', daysAgo(6)),
        note('n3', 'c_atlas', 'admin', 'Atlas team is rebranding in September. Hold off on heavy structured-data work until the new URL structure lands.', daysAgo(8)),
      ],
      tasks: [
        task('t1', 'c_northwind', 'Manual: rewrite /catering copy with case studies', 'open', null),
        task('t2', 'c_northwind', 'Pitch 3 regional food bloggers', 'open', null),
        task('t3', 'c_skyline', 'Source replacement partner links', 'open', null),
        task('t4', 'c_skyline', 'Reviewed /destinations performance baseline', 'done', daysAgo(7)),
        task('t5', 'c_atlas', 'Briefed copywriter on 24 thin product descriptions', 'done', daysAgo(2)),
        task('t6', 'c_verdant', 'Plan editorial calendar with Lila', 'open', null),
      ],
      audit: [
        audit('a1', 'c_skyline', 'admin', 'accepted', { recommendation: 'r11', title: 'robots.txt blocks /sitemap.xml' }, daysAgo(2)),
        audit('a2', 'c_skyline', 'system', 'workflow_dispatched', { repo: 'tango/skyline-travel', recommendation: 'r11' }, daysAgo(2)),
        audit('a3', 'c_skyline', 'admin', 'accepted', { recommendation: 'r12', title: 'Internal link missing: /destinations → /tours' }, daysAgo(3)),
        audit('a4', 'c_skyline', 'system', 'pr_merged', { pr: 'https://github.com/tango/skyline-travel/pull/142' }, daysAgo(3)),
        audit('a5', 'c_atlas', 'admin', 'declined', { recommendation: 'r20', title: 'Redirect /old-collection → /collections/2025' }, daysAgo(1)),
      ],
    };
  };

  function emptyBrief() {
    return {
      industry: '', products: '', audience: '',
      voice_tone: '', voice_dos: '', voice_donts: '',
      markets: '', language: '',
      priority_keywords: '', competitors: '',
      goals: '', constraints: '',
    };
  }

  function rec(id, client_id, type, title, description, category, status, created_at) {
    return { id, client_id, type, title, description, category, status, source: 'siteguru', created_at };
  }
  function impl(id, recommendation_id, client_id, status, commit_sha, pr_url, deploy_url, applied_at) {
    return { id, recommendation_id, client_id, status, commit_sha, pr_url, deploy_url, applied_at };
  }
  function note(id, client_id, author, body, created_at) {
    return { id, client_id, author, body, created_at };
  }
  function task(id, client_id, title, status, completed_at) {
    return { id, client_id, title, status, completed_at };
  }
  function audit(id, client_id, actor, action, payload, created_at) {
    return { id, client_id, actor, action, payload, created_at };
  }

  /* Synthetic Fathom-style daily stats per client.
     Generates 60 days so we can compute "last 30 vs prior 30". */
  function makeStats(clientId) {
    const today = new Date('2026-06-08T00:00:00Z');
    const baseByClient = {
      c_northwind: 280, c_skyline: 520, c_atlas: 1180, c_verdant: 340,
    };
    const base = baseByClient[clientId] || 300;
    const rng = mulberry32(hashCode(clientId));
    const allDays = [];
    let trend = 0;
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      trend += (rng() - 0.4) * 6;
      const noise = (rng() - 0.5) * base * 0.35;
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      const wkndDip = isWeekend ? -base * 0.18 : 0;
      const pv = Math.max(40, Math.round(base + trend + noise + wkndDip));
      const uv = Math.round(pv * (0.55 + rng() * 0.12));
      allDays.push({ date: d.toISOString().slice(0, 10), pageviews: pv, uniques: uv });
    }
    const days = allDays.slice(-30);
    const prev30 = allDays.slice(0, 30);
    const topPages = [
      { path: '/', pv: Math.round(base * 12 + rng() * 200) },
      { path: '/products', pv: Math.round(base * 7 + rng() * 150) },
      { path: '/about', pv: Math.round(base * 4 + rng() * 80) },
      { path: '/blog/sourdough-101', pv: Math.round(base * 3 + rng() * 60) },
      { path: '/contact', pv: Math.round(base * 2 + rng() * 40) },
    ].sort((a, b) => b.pv - a.pv);
    return { days, prev30, topPages, current_visitors: Math.round(2 + rng() * 18) };
  }
  function hashCode(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (!s.drafts) s.drafts = {};
        if (!s.sent_emails) s.sent_emails = [];
        if (s.clients) s.clients.forEach(c => { if (!c.brief) c.brief = emptyBrief(); });
        return s;
      }
    } catch (e) { /* ignore */ }
    const s = seed();
    save(s);
    return s;
  }
  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* Public API */
  window.DB = {
    load, save,
    reset() { localStorage.removeItem(STORAGE_KEY); return load(); },
    stats: makeStats,
  };
})();

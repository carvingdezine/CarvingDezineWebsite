// Cloudflare Worker entry point (used because this project has a wrangler.jsonc
// with an "assets" config, which makes it a Worker project rather than a
// classic Pages project — so /functions/api isn't auto-detected here).
//
// This single file both:
//   1. Handles /api/projects (GET + POST) using Neon Postgres
//   2. Falls through to serving your normal HTML/CSS/image files for everything else
//
// Env vars needed (Cloudflare dashboard → Settings → Environment variables):
//   DATABASE_URL  - your Neon connection string
//   ADMIN_KEY     - a secret you choose; must match the Admin Key pasted into
//                   Studio Admin → Settings on the live site.

import { neon } from '@neondatabase/serverless';

function noStoreJson(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function readAll(sql) {
  const rows = await sql`select id, data, updated_at from projects order by updated_at desc`;
  const projects = rows.map((r) => Object.assign({}, r.data, { id: r.id }));
  const lastUpdated = rows.length ? rows[0].updated_at : null;
  return { projects, lastUpdated };
}

async function handleGet(env) {
  try {
    const sql = neon(env.DATABASE_URL);
    const result = await readAll(sql);
    return noStoreJson(result);
  } catch (err) {
    return noStoreJson({ error: 'Failed to read projects: ' + err.message }, 500);
  }
}

async function handlePost(request, env) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const key = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
      return noStoreJson({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json().catch(() => ({}));
    const projects = Array.isArray(body.projects) ? body.projects : null;
    if (!projects) {
      return noStoreJson({ error: 'Expected { projects: [...] } in the request body' }, 400);
    }

    const sql = neon(env.DATABASE_URL);

    await sql`delete from projects`;
    for (const p of projects) {
      if (!p || !p.id) continue;
      const rest = Object.assign({}, p);
      delete rest.id;
      await sql`
        insert into projects (id, data, updated_at)
        values (${p.id}, ${JSON.stringify(rest)}::jsonb, now())
      `;
    }

    const result = await readAll(sql);
    return noStoreJson(Object.assign({ ok: true }, result));
  } catch (err) {
    return noStoreJson({ error: 'Failed to save projects: ' + err.message }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/projects') {
      if (request.method === 'GET') return handleGet(env);
      if (request.method === 'POST') return handlePost(request, env);
      return noStoreJson({ error: 'Method not allowed' }, 405);
    }

    // Everything else: serve the static site files as normal
    return env.ASSETS.fetch(request);
  },
};

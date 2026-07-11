// Cloudflare Pages Function
// Route: /api/projects
// Reads/writes the "projects" table in Neon Postgres.
//
// Env vars needed (set in Cloudflare Pages → Settings → Environment variables):
//   DATABASE_URL  - your Neon connection string (the one ending in ?sslmode=require)
//   ADMIN_KEY     - a secret you make up yourself; must match the "Admin Key" pasted
//                   into the Studio Admin → Settings panel on the live site.

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

export async function onRequestGet(context) {
  try {
    const sql = neon(context.env.DATABASE_URL);
    const result = await readAll(sql);
    return noStoreJson(result);
  } catch (err) {
    return noStoreJson({ error: 'Failed to read projects: ' + err.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const authHeader = context.request.headers.get('Authorization') || '';
    const key = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!context.env.ADMIN_KEY || key !== context.env.ADMIN_KEY) {
      return noStoreJson({ error: 'Unauthorized' }, 401);
    }

    const body = await context.request.json().catch(() => ({}));
    const projects = Array.isArray(body.projects) ? body.projects : null;
    if (!projects) {
      return noStoreJson({ error: 'Expected { projects: [...] } in the request body' }, 400);
    }

    const sql = neon(context.env.DATABASE_URL);

    // Full replace, same semantics as the old "overwrite projects.json" behavior:
    // the admin panel always sends the complete list.
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


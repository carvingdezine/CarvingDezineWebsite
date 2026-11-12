// /functions/api/earnings.js
// ADMIN-ONLY. Stores your project list and payment history (imported from Projects.xlsx) in Neon.
// Same auth as the other functions:  Authorization: Bearer <ADMIN_KEY>
// Same settings as the other functions: DATABASE_URL and ADMIN_KEY (Cloudflare Pages > Settings > Variables).
//
//   GET   /api/earnings   -> { projects, payments, meta }
//   POST  { projects, payments, meta }  -> replaces everything with the new import
//
// The three tables are created automatically on the first import, so there is no SQL step.
// Client emails, transaction IDs and links are never stored: the import page does not send them.

import { neon } from '@neondatabase/serverless'; // same import as your other functions

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return !!env.ADMIN_KEY && !!key && safeEqual(key, env.ADMIN_KEY);
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS earn_projects (
    num INTEGER PRIMARY KEY, status TEXT, name TEXT, scope TEXT, client TEXT, country TEXT, source TEXT,
    start_label TEXT, start_year INTEGER, end_label TEXT, mode TEXT, pay_status TEXT, currency TEXT,
    received NUMERIC, cost NUMERIC, recv_raw TEXT, cost_raw TEXT, tds_raw TEXT, pend_raw TEXT,
    counted BOOLEAN NOT NULL DEFAULT false, flag TEXT
  )`;
  await sql`CREATE TABLE IF NOT EXISTS earn_payments (
    id SERIAL PRIMARY KEY, year INTEGER NOT NULL, project TEXT, client TEXT,
    amount_inr NUMERIC NOT NULL, date_label TEXT, matched BOOLEAN NOT NULL DEFAULT false
  )`;
  await sql`CREATE TABLE IF NOT EXISTS earn_meta (key TEXT PRIMARY KEY, value JSONB NOT NULL)`;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  const sql = neon(env.DATABASE_URL);

  try {
    if (request.method === 'GET') {
      let projects = [], payments = [], meta = null;
      try {
        projects = await sql`SELECT num, status, name, scope, client, country, source, start_label, start_year, end_label,
                                    mode, pay_status, currency, received::float8 AS received, cost::float8 AS cost,
                                    recv_raw, cost_raw, tds_raw, pend_raw, counted, flag
                             FROM earn_projects ORDER BY num DESC`;
        payments = await sql`SELECT id, year, project, client, amount_inr::float8 AS amount_inr, date_label, matched
                             FROM earn_payments ORDER BY year DESC, id`;
        const m = await sql`SELECT value FROM earn_meta WHERE key = 'import'`;
        meta = m.length ? m[0].value : null;
      } catch (e) { /* tables do not exist until the first import */ }
      return json({ projects, payments, meta });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body || !Array.isArray(body.projects) || !Array.isArray(body.payments)) {
        return json({ error: 'Expected { projects: [...], payments: [...] }' }, 400);
      }
      if (body.projects.length > 5000 || body.payments.length > 5000) return json({ error: 'Too many rows' }, 400);

      await ensureTables(sql);
      const P = JSON.stringify(body.projects);
      const Y = JSON.stringify(body.payments);
      const M = JSON.stringify(Object.assign({}, body.meta || {}, { importedAt: new Date().toISOString() }));

      // one all-or-nothing transaction; each insert is a single statement, so it stays well inside Cloudflare's limits
      await sql.transaction([
        sql`DELETE FROM earn_projects`,
        sql`DELETE FROM earn_payments`,
        sql`INSERT INTO earn_projects (num, status, name, scope, client, country, source, start_label, start_year, end_label,
                                       mode, pay_status, currency, received, cost, recv_raw, cost_raw, tds_raw, pend_raw, counted, flag)
            SELECT num, status, name, scope, client, country, source, start_label, start_year, end_label,
                   mode, pay_status, currency, received, cost, recv_raw, cost_raw, tds_raw, pend_raw, COALESCE(counted, false), flag
            FROM json_to_recordset(${P}::json) AS x(
              num integer, status text, name text, scope text, client text, country text, source text,
              start_label text, start_year integer, end_label text, mode text, pay_status text, currency text,
              received numeric, cost numeric, recv_raw text, cost_raw text, tds_raw text, pend_raw text, counted boolean, flag text)`,
        sql`INSERT INTO earn_payments (year, project, client, amount_inr, date_label, matched)
            SELECT year, project, client, amount_inr, date_label, COALESCE(matched, false)
            FROM json_to_recordset(${Y}::json) AS x(
              year integer, project text, client text, amount_inr numeric, date_label text, matched boolean)`,
        sql`INSERT INTO earn_meta (key, value) VALUES ('import', ${M}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      ]);
      return json({ ok: true, projects: body.projects.length, payments: body.payments.length });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    // details stay in Cloudflare's logs, not in the browser
    console.error('earnings error', err && err.message);
    return json({ error: 'Could not reach the database. Check DATABASE_URL and ADMIN_KEY in Cloudflare.' }, 500);
  }
}

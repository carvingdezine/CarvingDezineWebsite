// /functions/api/clients.js
// ADMIN-ONLY: create, list and delete client portal accounts, regenerate a PIN,
// and (new) rotate the private link. Same auth as /api/projects:
//   Authorization: Bearer <ADMIN_KEY>
//
// Changes from the first version (behaviour is otherwise identical):
//  - PINs and tokens come from crypto.getRandomValues, not Math.random
//  - the admin key is compared in constant time
//  - errors are logged on the server, never sent to the browser
//  - PATCH { id, rotate: 'token' } also issues a brand new link (use it if a link leaks)

import { neon } from '@neondatabase/serverless'; // same import as your other functions

function randomToken() {
  // 24 random bytes, URL-safe: the unguessable part of the client's private link
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomPin() {
  // 6-digit PIN from a cryptographic source, shared with the client by a SEPARATE channel
  const n = crypto.getRandomValues(new Uint32Array(1))[0];
  return String(100000 + (n % 900000));
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

export async function onRequest(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  const sql = neon(env.DATABASE_URL);

  try {
    if (request.method === 'GET') {
      const clients = await sql`
        SELECT id, name, email, access_token, pin, notes, created_at, last_viewed_at
        FROM clients ORDER BY created_at DESC
      `;
      return json({ clients });
    }

    const body = await readBody(request);
    if (!body) return json({ error: 'Send a JSON body' }, 400);

    if (request.method === 'POST') {
      const name = String(body.name || '').trim().slice(0, 120);
      if (!name) return json({ error: 'name is required' }, 400);
      const rows = await sql`
        INSERT INTO clients (name, email, access_token, pin, notes)
        VALUES (${name}, ${body.email ? String(body.email).trim().slice(0, 200) : null}, ${randomToken()}, ${randomPin()}, ${body.notes ? String(body.notes).slice(0, 2000) : null})
        RETURNING id, name, email, access_token, pin, notes, created_at, last_viewed_at
      `;
      return json({ client: rows[0] });
    }

    if (request.method === 'PATCH') {
      if (!body.id) return json({ error: 'id is required' }, 400);
      const pin = randomPin();
      const rows = body.rotate === 'token'
        ? await sql`UPDATE clients SET pin = ${pin}, access_token = ${randomToken()}, failed_attempts = 0, locked_until = NULL WHERE id = ${Number(body.id)}
                    RETURNING id, name, email, access_token, pin, notes, created_at, last_viewed_at`
        : await sql`UPDATE clients SET pin = ${pin}, failed_attempts = 0, locked_until = NULL WHERE id = ${Number(body.id)}
                    RETURNING id, name, email, access_token, pin, notes, created_at, last_viewed_at`;
      if (!rows[0]) return json({ error: 'Client not found' }, 404);
      return json({ client: rows[0] });
    }

    if (request.method === 'DELETE') {
      if (!body.id) return json({ error: 'id is required' }, 400);
      await sql`DELETE FROM clients WHERE id = ${Number(body.id)}`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('clients error:', err);
    return json({ error: 'Server error' }, 500);
  }
}

async function readBody(request) {
  try { return await request.json(); } catch (e) { return null; }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

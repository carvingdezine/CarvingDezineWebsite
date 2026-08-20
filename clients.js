// /functions/api/clients.js
// Admin-only: create, list, delete client portal accounts, and
// regenerate a client's PIN. Matches the auth convention already used
// by /api/projects: Authorization: Bearer <ADMIN_KEY>
//
// ASSUMPTION (please confirm against your real /api/projects file):
// - Postgres connection via @neondatabase/serverless, env var DATABASE_URL
// - Admin key checked against env var ADMIN_KEY
// If your existing file uses a different DB client or env var name,
// swap the two marked sections below to match — everything else stays the same.

import { neon } from '@neondatabase/serverless'; // ASSUMPTION: confirm this matches your setup

function randomToken() {
  // 32 bytes, URL-safe — used as the unguessable part of the client's magic link
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomPin() {
  // 6-digit numeric PIN, shared with the client via a separate channel than the link
  return String(Math.floor(100000 + Math.random() * 900000));
}

function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return key && key === env.ADMIN_KEY; // ASSUMPTION: confirm env var name
}

export async function onRequest(context) {
  const { request, env } = context;
  const sql = neon(env.DATABASE_URL); // ASSUMPTION: confirm env var name

  if (!checkAdmin(request, env)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    if (request.method === 'GET') {
      const clients = await sql`
        SELECT id, name, email, access_token, pin, notes, created_at
        FROM clients ORDER BY created_at DESC
      `;
      return json({ clients });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      if (!body.name) return json({ error: 'name is required' }, 400);
      const token = randomToken();
      const pin = randomPin();
      const rows = await sql`
        INSERT INTO clients (name, email, access_token, pin, notes)
        VALUES (${body.name}, ${body.email || null}, ${token}, ${pin}, ${body.notes || null})
        RETURNING id, name, email, access_token, pin, notes, created_at
      `;
      return json({ client: rows[0] });
    }

    if (request.method === 'PATCH') {
      // Regenerate a client's PIN (e.g. if it needs to be resent securely)
      const { id } = await request.json();
      if (!id) return json({ error: 'id is required' }, 400);
      const pin = randomPin();
      const rows = await sql`
        UPDATE clients SET pin = ${pin} WHERE id = ${id}
        RETURNING id, name, email, access_token, pin, notes, created_at
      `;
      if (!rows[0]) return json({ error: 'Client not found' }, 404);
      return json({ client: rows[0] });
    }

    if (request.method === 'DELETE') {
      const { id } = await request.json();
      if (!id) return json({ error: 'id is required' }, 400);
      await sql`DELETE FROM clients WHERE id = ${id}`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

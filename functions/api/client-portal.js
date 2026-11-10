// /functions/api/client-portal.js
// PUBLIC endpoint (no admin key). A client needs BOTH the long private token from
// their link AND their 6-digit PIN. Neither alone shows anything.
//
// Changes from the first version:
//  - POST { token, pin } is the normal way in, so the PIN is not in the address bar or server logs.
//    GET ?token=&pin= still works so your existing client.html keeps working until you replace it.
//  - After 5 wrong PINs the link locks for 15 minutes (a 6-digit PIN alone can be guessed otherwise).
//  - constant-time PIN comparison, generic server errors, responses are never cached.
//  - records when the client last opened the portal (shown in your workspace).
// Needs sql/002_portal_hardening.sql to have been run once.

import { neon } from '@neondatabase/serverless'; // same import as your other functions

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function onRequest(context) {
  const { request, env } = context;

  let token = '', pin = '';
  if (request.method === 'GET') {
    const url = new URL(request.url);
    token = url.searchParams.get('token') || '';
    pin = (url.searchParams.get('pin') || '').trim();
  } else if (request.method === 'POST') {
    let body = null;
    try { body = await request.json(); } catch (e) { return json({ error: 'Send a JSON body' }, 400); }
    token = String((body && body.token) || '');
    pin = String((body && body.pin) || '').trim();
  } else {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!token) return json({ error: 'Missing token' }, 400);

  const sql = neon(env.DATABASE_URL);

  try {
    const rows = await sql`
      SELECT id, name, pin, failed_attempts, locked_until FROM clients WHERE access_token = ${token}
    `;
    const client = rows[0];
    if (!client) return json({ error: 'Invalid or expired link' }, 404);

    if (client.locked_until && new Date(client.locked_until) > new Date()) {
      const mins = Math.max(1, Math.ceil((new Date(client.locked_until) - new Date()) / 60000));
      return json({ error: 'Too many attempts. Please try again in ' + mins + ' minute' + (mins > 1 ? 's' : '') + '.', locked: true }, 429);
    }

    if (!pin) return json({ error: 'PIN required', needsPin: true }, 401);

    if (!safeEqual(pin, client.pin)) {
      const attempts = (client.failed_attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await sql`UPDATE clients SET failed_attempts = 0, locked_until = now() + interval '15 minutes' WHERE id = ${client.id}`;
        return json({ error: 'Too many attempts. Please try again in ' + LOCK_MINUTES + ' minutes.', locked: true }, 429);
      }
      await sql`UPDATE clients SET failed_attempts = ${attempts} WHERE id = ${client.id}`;
      return json({ error: 'Incorrect PIN. ' + (MAX_ATTEMPTS - attempts) + ' attempt' + (MAX_ATTEMPTS - attempts > 1 ? 's' : '') + ' left.', needsPin: true }, 401);
    }

    await sql`UPDATE clients SET failed_attempts = 0, locked_until = NULL, last_viewed_at = now() WHERE id = ${client.id}`;
    const files = await sql`
      SELECT id, file_name, file_type, drive_url, status, uploaded_at
      FROM client_files WHERE client_id = ${client.id} ORDER BY uploaded_at DESC
    `;
    return json({ client: { name: client.name }, files });
  } catch (err) {
    console.error('client-portal error:', err);
    return json({ error: 'Server error' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

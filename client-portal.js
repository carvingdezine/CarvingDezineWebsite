// /functions/api/client-portal.js
// PUBLIC endpoint — no admin key. Access requires BOTH the long random
// token (from the client's link) AND their 6-digit PIN (shared with them
// via a separate channel). Neither alone is enough to see files.
// Returns the client's name and their file list. Never exposes any
// other client's data — token+pin can only ever match one client's rows.

import { neon } from '@neondatabase/serverless'; // ASSUMPTION: confirm against your real file

export async function onRequest(context) {
  const { request, env } = context;
  const sql = neon(env.DATABASE_URL);

  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const pin = (url.searchParams.get('pin') || '').trim();
  if (!token) return json({ error: 'Missing token' }, 400);

  try {
    const clientRows = await sql`
      SELECT id, name, pin FROM clients WHERE access_token = ${token}
    `;
    const client = clientRows[0];
    if (!client) return json({ error: 'Invalid or expired link' }, 404);

    if (!pin) return json({ error: 'PIN required', needsPin: true }, 401);
    if (pin !== client.pin) return json({ error: 'Incorrect PIN', needsPin: true }, 401);

    const files = await sql`
      SELECT id, file_name, file_type, drive_url, status, uploaded_at
      FROM client_files WHERE client_id = ${client.id} ORDER BY uploaded_at DESC
    `;

    return json({ client: { name: client.name }, files });
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

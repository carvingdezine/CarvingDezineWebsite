// /functions/api/client-files.js
// ADMIN-ONLY: list, add, rename and delete the files shown in a client's portal.
// Same auth as /api/clients and /api/projects:  Authorization: Bearer <ADMIN_KEY>
//
//   GET    /api/client-files               -> { files }            (all files)
//   GET    /api/client-files?client_id=3   -> { files }            (one client's files)
//   POST   { client_id, file_name, file_type, drive_url }  -> { file }
//   PATCH  { id, file_name?, file_type? }                  -> { file }
//   DELETE { id }                                          -> { ok: true }
//
// A portal "file" is a name plus a Google Drive share link ("Anyone with the link").
// Files are not stored here, only the link, so there is nothing to host or pay for.

import { neon } from '@neondatabase/serverless'; // same import as your other functions

const TYPES = ['invoice', 'sow', 'deliverable', 'file'];

// constant-time string compare, so the admin key cannot be guessed by timing
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

// only https links are accepted, so a "javascript:" link can never reach the client page
function cleanUrl(u) {
  try {
    const x = new URL(String(u || '').trim());
    return x.protocol === 'https:' ? x.toString() : null;
  } catch (e) { return null; }
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!checkAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);
  const sql = neon(env.DATABASE_URL);

  try {
    if (request.method === 'GET') {
      const cid = new URL(request.url).searchParams.get('client_id');
      const files = cid
        ? await sql`SELECT id, client_id, file_name, file_type, drive_url, status, uploaded_at, viewed_at
                    FROM client_files WHERE client_id = ${Number(cid)} ORDER BY uploaded_at DESC`
        : await sql`SELECT id, client_id, file_name, file_type, drive_url, status, uploaded_at, viewed_at
                    FROM client_files ORDER BY uploaded_at DESC`;
      return json({ files });
    }

    const body = await readBody(request);
    if (!body) return json({ error: 'Send a JSON body' }, 400);

    if (request.method === 'POST') {
      const name = String(body.file_name || '').trim().slice(0, 200);
      const type = TYPES.includes(body.file_type) ? body.file_type : 'file';
      const url = cleanUrl(body.drive_url);
      if (!body.client_id) return json({ error: 'client_id is required' }, 400);
      if (!name) return json({ error: 'file_name is required' }, 400);
      if (!url) return json({ error: 'drive_url must be a valid https link' }, 400);
      const owner = await sql`SELECT id FROM clients WHERE id = ${Number(body.client_id)}`;
      if (!owner[0]) return json({ error: 'Client not found' }, 404);
      const rows = await sql`
        INSERT INTO client_files (client_id, file_name, file_type, drive_url)
        VALUES (${Number(body.client_id)}, ${name}, ${type}, ${url})
        RETURNING id, client_id, file_name, file_type, drive_url, status, uploaded_at, viewed_at`;
      return json({ file: rows[0] });
    }

    if (request.method === 'PATCH') {
      if (!body.id) return json({ error: 'id is required' }, 400);
      const name = body.file_name != null ? String(body.file_name).trim().slice(0, 200) : null;
      const type = body.file_type != null ? (TYPES.includes(body.file_type) ? body.file_type : 'file') : null;
      const rows = await sql`
        UPDATE client_files SET file_name = COALESCE(${name}, file_name), file_type = COALESCE(${type}, file_type)
        WHERE id = ${Number(body.id)}
        RETURNING id, client_id, file_name, file_type, drive_url, status, uploaded_at, viewed_at`;
      if (!rows[0]) return json({ error: 'File not found' }, 404);
      return json({ file: rows[0] });
    }

    if (request.method === 'DELETE') {
      if (!body.id) return json({ error: 'id is required' }, 400);
      await sql`DELETE FROM client_files WHERE id = ${Number(body.id)}`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('client-files error:', err);
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

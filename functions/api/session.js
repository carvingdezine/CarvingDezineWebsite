// functions/api/session.js   ->   GET /api/session
// Answers 200 only when the sign-in cookie is valid. The workspace asks this on every load and sends you to
// the sign-in page when the answer is no, so a copy of the page that somehow reached a stranger stays empty.
import { validSession } from '../_session.js';

export async function onRequestGet(context) {
  const ok = await validSession(context.request, context.env);
  return new Response(JSON.stringify({ signedIn: ok }), {
    status: ok ? 200 : 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

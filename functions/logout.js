// functions/logout.js   ->   https://yoursite/logout
// Ends the session and removes the saved key from this browser.
import { clearCookieHeader } from './_session.js';

const PAGE = `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing out</title>
<body style="background:#000;color:#bbb;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0">Signing out...
<script>try{localStorage.removeItem('cd_admin_key')}catch(e){}location.replace('/login')</script></body>`;

export async function onRequest() {
  return new Response(PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Set-Cookie': clearCookieHeader() } });
}

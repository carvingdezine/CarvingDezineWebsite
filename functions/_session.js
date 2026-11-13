// functions/_session.js  (shared helper, not a page: the leading underscore keeps it out of the URL list)
// One password protects everything private: the workspace, the portfolio manager and the APIs.
// The password is your ADMIN_KEY in Cloudflare. It is checked here on the SERVER, never in the browser.
// After a correct password the server hands the browser a signed, HttpOnly cookie ("cd_session").
// The cookie cannot be read by page scripts, cannot be forged without ADMIN_KEY, and expires by itself.

const enc = new TextEncoder();
export const COOKIE = 'cd_session';
export const SHORT = 8 * 60 * 60;        // 8 hours
export const LONG = 7 * 24 * 60 * 60;    // 7 days ("keep me signed in")

export function safeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

async function sign(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode('cd-session|' + secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function makeSession(env, seconds) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  return exp + '.' + await sign(env.ADMIN_KEY, String(exp));
}

function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

export async function validSession(request, env) {
  if (!env.ADMIN_KEY) return false;                       // not configured: nobody gets in
  const v = readCookie(request, COOKIE);
  const dot = v.indexOf('.');
  if (dot < 1) return false;
  const exp = v.slice(0, dot), sig = v.slice(dot + 1);
  if (!/^\d{9,12}$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await sign(env.ADMIN_KEY, exp));
}

// persistent=false -> a "session cookie": the browser deletes it when it is closed (the server also expires it after SHORT)
export function cookieHeader(value, seconds, persistent) {
  return `${COOKIE}=${value}; Path=/;${persistent ? ` Max-Age=${seconds};` : ''} HttpOnly; Secure; SameSite=Strict`;
}
export function clearCookieHeader() {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

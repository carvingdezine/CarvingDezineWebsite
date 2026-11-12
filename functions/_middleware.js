// functions/_middleware.js
// Runs in front of EVERY request to your site. It does three jobs:
//   1. Locks the private pages (/admin, /admin-portfolio) behind the login.
//   2. Hides files that must never be public (SQL scripts, notes, package files, source copies).
//   3. Adds browser security headers to every response.
import { validSession } from './_session.js';

const PRIVATE_PAGE = /^\/(admin|admin-portfolio)(\.html)?\/?$/i;

// anything matching these answers "404 Not found", as if the file did not exist
const HIDDEN = new RegExp(
  '^/(\\.git|\\.github|\\.env|\\.wrangler|node_modules|functions|sql)(/|$)' +
  '|\\.(sql|md|map|bak|old|orig|log|env|ya?ml|toml|ini)$' +
  '|^/(package(-lock)?\\.json|projects\\.json|clients\\.js|client-portal\\.js|sitemap\\.xml\\.js|readme\\.txt)$', 'i');

const BASE = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
};

function harden(res, isPrivate) {
  const out = new Response(res.body, res);
  for (const k in BASE) out.headers.set(k, BASE[k]);
  if (isPrivate) {
    out.headers.set('Cache-Control', 'no-store');
    out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return out;
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch (e) { return harden(new Response('Bad request', { status: 400 }), false); }
  path = path.replace(/\/{2,}/g, '/');

  if (HIDDEN.test(path)) return harden(new Response('Not found', { status: 404 }), false);

  if (PRIVATE_PAGE.test(path)) {
    if (!(await validSession(request, env))) {
      const back = encodeURIComponent((path + url.search).slice(0, 200));
      const loc = '/login?next=' + back;
      return harden(new Response(null, { status: 302, headers: { Location: loc, 'Cache-Control': 'no-store' } }), true);
    }
    return harden(await next(), true);
  }
  return harden(await next(), false);
}

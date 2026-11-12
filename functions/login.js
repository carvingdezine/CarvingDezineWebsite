// functions/login.js   ->   https://yoursite/login
// GET  : shows the password page.
// POST : { password, remember, next } -> checks it on the server against ADMIN_KEY.
import { safeEqual, makeSession, cookieHeader, SHORT, LONG } from './_session.js';

const HEAD = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const json = (b, s, extra) => new Response(JSON.stringify(b), { status: s || 200, headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extra || {}) });

function safeNext(n) {
  n = String(n || '');
  return /^\/(?!\/)[A-Za-z0-9_\-./#?=&%]{0,200}$/.test(n) && !/^\/login/i.test(n) ? n : '/admin.html';
}

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/><title>Sign in | Carving Dezine</title>
<style>
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{background:#000;color:#f5f5f5;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;display:grid;place-items:center;padding:24px}
main{width:100%;max-width:380px}
.mk{width:36px;height:4px;background:#E8001D;margin-bottom:28px}
h1{font-size:28px;letter-spacing:-.03em;margin:0 0 8px}p{color:#bbb;font-size:15px;line-height:1.6;margin:0 0 24px}
label{display:block;font-size:14px;font-weight:500;margin-bottom:8px}
input[type=password]{width:100%;height:46px;border-radius:12px;border:1px solid #555;background:#0a0a0a;color:#fff;padding:0 14px;font-size:16px}
input[type=password]:focus{outline:0;border-color:#E8001D;box-shadow:0 0 0 3px rgba(232,0,29,.45)}
.rm{display:flex;gap:8px;align-items:center;margin:14px 0 20px;color:#bbb;font-size:14px}
button{width:100%;height:46px;border:0;border-radius:12px;background:#E8001D;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
button:hover{background:#B20016}button:disabled{opacity:.6;cursor:wait}
.err{color:#ff6b7d;font-size:14px;min-height:20px;margin-top:14px}
</style></head><body><main>
<div class="mk"></div><h1>Private area</h1><p>Enter your password to open the Carving Dezine workspace.</p>
<form id="f" autocomplete="on"><label for="p">Password</label>
<input id="p" name="password" type="password" autocomplete="current-password" required autofocus/>
<label class="rm"><input id="r" type="checkbox"/> Keep me signed in on this device for 30 days</label>
<button id="b" type="submit">Sign in</button><div class="err" id="e" role="alert"></div></form></main>
<script>
(function(){
  var f=document.getElementById('f'),e=document.getElementById('e'),b=document.getElementById('b');
  var next=new URLSearchParams(location.search).get('next')||'';
  f.addEventListener('submit',function(ev){ev.preventDefault();e.textContent='';b.disabled=true;b.textContent='Checking...';
    var pw=document.getElementById('p').value;
    fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
      body:JSON.stringify({password:pw,remember:document.getElementById('r').checked,next:next})})
    .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
    .then(function(x){
      if(!x.ok){throw new Error(x.j.error||'Could not sign in')}
      try{localStorage.setItem('cd_admin_key',pw)}catch(_){}   /* the workspace uses the same password to talk to your database */
      location.replace(x.j.next||'/admin.html');
    }).catch(function(err){e.textContent=err.message;b.disabled=false;b.textContent='Sign in';document.getElementById('p').select()});
  });
})();
</script></body></html>`;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET' || request.method === 'HEAD') return new Response(PAGE, { headers: HEAD });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (!env.ADMIN_KEY) return json({ error: 'Sign-in is not set up: ADMIN_KEY is missing in Cloudflare.' }, 500);

  let body = null;
  try { body = await request.json(); } catch (e) { /* fall through */ }
  const pw = body && typeof body.password === 'string' ? body.password.slice(0, 500) : '';

  if (!pw || !safeEqual(pw, env.ADMIN_KEY)) {
    await wait(900);                       // slows down guessing
    return json({ error: 'Incorrect password.' }, 401);
  }
  const seconds = body.remember ? LONG : SHORT;
  const value = await makeSession(env, seconds);
  return json({ ok: true, next: safeNext(body.next) }, 200, { 'Set-Cookie': cookieHeader(value, seconds) });
}

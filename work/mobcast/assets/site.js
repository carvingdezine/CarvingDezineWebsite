/* Mobcast shared layer: nav menus, "coming soon" links, scroll effects. */
(function(){
var D=document,W=window,RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var cur=(location.pathname.split('/').pop()||'index.html').toLowerCase();
var PRODUCTS=[['AI','AI Studio','Content built from your documents','ai-studio.html'],['SC','Sales Copilot','AI coaching for every rep','sales-copilot.html'],['FL','Frontline LXP','Learning on every phone','frontline-lxp.html'],['FC','Flow ComplAI','Compliance that runs itself',null]];
var SOLUTIONS=[['IN','Insurance','Train, coach and certify agents','insurance.html'],['ON','Onboarding','Floor-ready in half the time','onboarding.html'],['SE','Security','Enterprise-grade trust','security.html']];
function soon(a,label){a.setAttribute('href','#');a.setAttribute('data-soon',label||a.textContent.trim());a.setAttribute('aria-disabled','true');a.setAttribute('title',(label||'This page')+' is coming soon')}
/* 1. nav dropdowns */
function mk(label,items){var w=D.createElement('div');w.className='ndd';var has=false;
 var b='<button type="button" aria-haspopup="true" aria-expanded="false">'+label+'</button><div class="ndd-m">';
 items.forEach(function(it){var here=it[3]&&it[3].toLowerCase()===cur;if(here)has=true;
  b+='<a '+(it[3]?'href="'+it[3]+'"':'href="#" data-soon="'+it[1]+'" aria-disabled="true" title="'+it[1]+' is coming soon"')+(here?' aria-current="page"':'')+'><i>'+it[0]+'</i>'+it[1]+'<small>'+it[2]+'</small></a>'});
 w.innerHTML=b+'</div>';if(has)w.className+=' has-cur';
 var btn=w.firstChild;btn.addEventListener('click',function(e){e.stopPropagation();var o=w.classList.toggle('open');btn.setAttribute('aria-expanded',o)});return w}
var nl=D.querySelector('.nlinks');
if(nl&&!nl.querySelector('.ndd')){var first=nl.querySelector('a');var p=mk('Products',PRODUCTS),s=mk('Solutions',SOLUTIONS);
 if(first&&first.nextSibling){nl.insertBefore(p,first.nextSibling);nl.insertBefore(s,p.nextSibling)}else{nl.appendChild(p);nl.appendChild(s)}
 D.addEventListener('click',function(){[].forEach.call(D.querySelectorAll('.ndd.open'),function(x){x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false')})});
 D.addEventListener('keydown',function(e){if(e.key==='Escape')[].forEach.call(D.querySelectorAll('.ndd.open'),function(x){x.classList.remove('open')})})}
/* mobile panel */
var mp=D.getElementById('mnav-panel')||D.getElementById('mobile-nav-panel');
if(mp&&!mp.querySelector('.mn-h')){var cta=mp.querySelector('button.ncta'),f=D.createDocumentFragment();
 function grp(t,items){var h=D.createElement('span');h.className='mn-h';h.textContent=t;f.appendChild(h);items.forEach(function(it){var a=D.createElement('a');a.className='mn-s';a.textContent=it[1];if(it[3]){a.href=it[3];if(it[3].toLowerCase()===cur)a.setAttribute('aria-current','page')}else soon(a,it[1]);f.appendChild(a)})}
 grp('Products',PRODUCTS);grp('Solutions',SOLUTIONS);cta?mp.insertBefore(f,cta):mp.appendChild(f)}
/* 2. coming-soon links */
[].forEach.call(D.querySelectorAll('a[href="#"],a[data-soon]'),function(a){if(a.closest('.snav'))return;if(!a.hasAttribute('data-soon')){var t=(a.textContent||'').trim();if(!t||a.classList.contains('nlogo')||a.getAttribute('role')==='button')return;soon(a,t)}
 a.classList.add('is-soon');a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation()})});
/* sub-nav scroll-spy */
(function(){var L=[].slice.call(D.querySelectorAll('.snav-l a[href^="#"]'));if(!L.length||!('IntersectionObserver' in W))return;var m={};L.forEach(function(a){var t=D.querySelector(a.getAttribute('href'));if(t)m[t.id]=a});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){L.forEach(function(a){a.classList.remove('on')});if(m[e.target.id])m[e.target.id].classList.add('on')}})},{rootMargin:'-45% 0px -50% 0px'});
 Object.keys(m).forEach(function(id){io.observe(D.getElementById(id))})})();
/* 3. scroll effects (skipped when reduced motion is on) */
if(RM||!W.requestAnimationFrame)return;
var isHome=!!D.getElementById('hero-sticky');
var scrubSel='.aib,.up,.ixp,.lap,.sch-dev,.edt,.cmp,.hw,.lpd,.fb-score,.fb-tl,.pf-card,.cst-t,.cst-s,.ucs,.bsl,.aud-r,.lgg,.aup,.fmt-more,.rp-stage,.fin-f,.rc,.rel,.ph-dev,.ar-doc,.pv,.map,.cform';
var sc=[].slice.call(D.querySelectorAll(scrubSel)).filter(function(e){return !e.closest('#hero-sticky')&&!e.closest('.hero')});sc.forEach(function(e){e.classList.add('fx-scrub')});
var pimgs=[].slice.call(D.querySelectorAll('.phs img,.ph>img,.ph-i,.q-slide img.pic'));pimgs.forEach(function(e){e.classList.add('fx-pimg');e.setAttribute('data-s','.07')});
var hs=isHome?[]:[].slice.call(D.querySelectorAll('.hero .hs-right'));hs.forEach(function(e){e.classList.add('fx-par');e.setAttribute('data-s','-.07')});

/* floating UI chips on mockups (content, not background) */
var CHIPS=[['.lxh-dev',[['Streak: 3 days','left:-60px;bottom:22%',.06,'l']]],
 ['.lxo-dev',[['Unlocks after day 1','right:-60px;top:18%',-.06,'d']]],
 ['.lxc-qr',[['Time-stamped','right:-10px;top:-14px',-.06,'d']]],
 ['.lxz-r',[['SCORM ready','left:-16px;bottom:-16px',.06,'l']]],
 ['.sch',[['Brief ready','left:-6%;top:10%',-.07,'d'],['Objection handled','right:-4%;top:44%',.06,'l']]],
 ['.aib',[['SCORM exported','right:16px;bottom:-20px',.07,'l'],['Hindi voiceover added','right:-18px;top:-18px',-.06,'d']]],
 ['.ixp',[['Reordered','right:-14px;top:-14px',-.06,'l'],['5 modules proposed','left:-18px;bottom:60px',.07,'d']]],
 ['.fp-dev',[['Competitor compared','left:-70px;bottom:18%',.06,'l']]],
 ['.lap',[['Sample data','right:-12px;top:-14px',-.06,'d']]],
 ['.bsl',[['Brand applied','left:-16px;top:-14px',-.06,'d']]],
 ['.edt',[['Free re-prompt','right:24px;top:-16px',-.05,'d']]],
 ['.ph-dev',[['Added to audit record','left:-70px;bottom:16%',.06,'l']]],
 ['.fb-ring',[['Sample score','right:-34px;top:4px',-.05,'d']]]];
CHIPS.forEach(function(c){var host=D.querySelector(c[0]);if(!host||host.closest('#hero-sticky'))return;if(getComputedStyle(host).position==='static')host.style.position='relative';
 c[1].forEach(function(x){var i=D.createElement('span');i.className='fx-chip '+(x[3]==='d'?'is-dark':'');i.style.cssText=x[1];i.setAttribute('data-depth',x[2]);i.setAttribute('aria-hidden','true');i.innerHTML='<i></i>'+x[0];host.appendChild(i)})});
/* staggered columns in card grids */
[].forEach.call(D.querySelectorAll('.apb,.pr3,.tr4,.bn3,.pb3,.srcs,.fmt,.prm,.rp-side,.upc,.pho3,.pf-s,.rel,.hh3'),function(g){[].forEach.call(g.children,function(k,i){if(!k.hasAttribute('data-depth')&&!k.classList.contains('rv-x'))k.setAttribute('data-depth',(i%2?.035:-.025))})});
var depthEls=[].slice.call(D.querySelectorAll('[data-depth]'));
var orbs=[];
/* card spotlight */
[].forEach.call(D.querySelectorAll('.pr-c,.tr-c,.ft,.ap,.uc,.pbc,.srcs li,.pl3c,.pm,.tm3c,.rel-c,.bn-c,.rp-c'),function(c){if(getComputedStyle(c).position==='static')c.style.position='relative';c.classList.add('fx-spot');var s=D.createElement('i');s.className='fx-sp';c.insertBefore(s,c.firstChild);
 c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
var tick=false;function upd(){tick=false;var vh=W.innerHeight;
 sc.forEach(function(e){if(!e.isConnected)return;var r=e.getBoundingClientRect();var p=1-Math.min(1,Math.max(0,(r.top-vh*.38)/(vh*.55)));e.style.setProperty('--sp',p.toFixed(3))});
 depthEls.forEach(function(e){if(!e.isConnected)return;var host=e.closest('section')||e.parentElement,r=host.getBoundingClientRect();e.style.setProperty('--dy',((r.top+r.height/2-vh/2)*(+e.getAttribute('data-depth'))).toFixed(1))});
 pimgs.concat(hs).forEach(function(e){if(!e.isConnected)return;var host=e.closest('section')||e.parentElement,r=host.getBoundingClientRect();e.style.setProperty('--py',((r.top+r.height/2-vh/2)*(+e.getAttribute('data-s')||0)).toFixed(1))})}
function req(){if(!tick){tick=true;requestAnimationFrame(upd)}}
W.addEventListener('scroll',req,{passive:true});W.addEventListener('resize',req);upd();
})();

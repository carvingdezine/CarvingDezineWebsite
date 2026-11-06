/* CARVING DEZINE shared script: node background, header, mobile menu, sound */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;

  /* ---------- header ---------- */
  var hd=$('#cd-hd');
  function onScroll(){
    if(hd)hd.classList.toggle('solid',window.scrollY>24);
    /* the network is full strength over the hero, softer behind long text */
    var hero=document.getElementById('hero');
    var limit=hero?hero.offsetHeight*.7:0;
    root.classList.toggle('cd-dim',window.scrollY>limit);
  }
  onScroll();addEventListener('scroll',onScroll,{passive:true});

  /* ---------- mobile menu ---------- */
  var burger=$('#cd-burger'),menu=$('#cd-menu');
  function setMenu(open){
    document.body.classList.toggle('cd-menu-open',open);
    if(burger)burger.setAttribute('aria-expanded',open);
    if(menu)menu.setAttribute('aria-hidden',!open);
    document.body.style.overflow=open?'hidden':'';
  }
  if(burger)burger.addEventListener('click',function(){setMenu(!document.body.classList.contains('cd-menu-open'))});
  $$('#cd-menu a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  /* ---------- active nav link ---------- */
  var page=document.body.getAttribute('data-page');
  if(page){$$('.cd-nav a').forEach(function(a){a.classList.toggle('active',a.getAttribute('data-k')===page)})}
  else if('IntersectionObserver' in window){
    var links=$$('.cd-nav a');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('active',l.getAttribute('data-k')===e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    ['work','services','audit','about','contact'].forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)});
  }

  /* ---------- ambient music: same track + same on/off preference everywhere ---------- */
  var PREF='cd_sound_pref',snd=$('#cd-snd'),own=null,ownStarted=false;
  function wanted(){try{return localStorage.getItem(PREF)!=='off'}catch(e){return true}}
  function trackUrl(){return (document.body.getAttribute('data-root')||'')+'audio/ambient-piano.mp3'}
  function play(){
    if(window._ambientPad&&window._ambientPad.start){window._ambientPad.start();return}
    if(ownStarted||!wanted())return;ownStarted=true;
    own=new Audio(trackUrl());own.loop=true;own.volume=.15;
    var p=own.play();if(p&&p.catch)p.catch(function(){ownStarted=false});
  }
  function stop(){
    if(window._ambientPad&&window._ambientPad.stop)window._ambientPad.stop();
    if(own){own.pause();own=null}ownStarted=false;
  }
  function sndUI(){
    if(!snd)return;var w=wanted();snd.classList.toggle('on',w);
    var a=$('#cd-s-on'),b=$('#cd-s-off');if(a)a.style.display=w?'':'none';if(b)b.style.display=w?'none':'';
    snd.title=w?'Sound on - click to mute':'Sound off - click to enable';snd.setAttribute('aria-pressed',w);
  }
  if(snd)snd.addEventListener('click',function(){
    var next=!wanted();try{localStorage.setItem(PREF,next?'on':'off')}catch(e){}
    next?play():stop();sndUI();
  });
  ['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,function(){if(wanted())play()})});
  sndUI();

  /* ---------- NODE NETWORK: your original hero animation, now the page background ----------
     Same physics, colours and cursor behaviour as before: nodes drift, repel the cursor close up,
     are drawn towards it further out, and link to it with a constellation line. */
  (function(){
    var c=document.getElementById('bg-nodes');
    if(!c)return;
    var ctx=c.getContext('2d'),pts=[],running=false;
    var LINK=180,REPEL=100,ATTRACT=240,FORCE=2.6;
    var _redRGB='232,0,29';                     /* brand red #E8001D */
    var mouse={x:-9999,y:-9999,tx:-9999,ty:-9999,inside:false};
    /* scene morph: pages can ask the network to pull itself into the logo (see window.CDNodes) */
    var morph={p:0,cx:0,cy:0,size:0},targetList=[],targetsStarted=false;
    function assignTargets(){for(var i=0;i<pts.length;i++)pts[i].t=targetList[i]||null}
    function buildTargets(){
      if(targetsStarted)return;targetsStarted=true;
      var logo=document.querySelector('.cd-logo img');if(!logo)return;
      var img=new Image();
      img.onload=function(){
        var S=200,cv=document.createElement('canvas');cv.width=cv.height=S;
        var cx=cv.getContext('2d');cx.drawImage(img,0,0,S,S);
        var d=cx.getImageData(0,0,S,S).data,cand=[],x,y,i,j;
        for(y=0;y<S;y+=2)for(x=0;x<S;x+=2){i=(y*S+x)*4;if(d[i+3]>200&&d[i]>200)cand.push({x:x/S-.5,y:y/S-.5})}
        for(i=cand.length-1;i>0;i--){j=(Math.random()*(i+1))|0;var t=cand[i];cand[i]=cand[j];cand[j]=t}
        var acc=[],dm=.036;
        for(i=0;i<cand.length&&acc.length<pts.length;i++){
          var ok=true;
          for(j=0;j<acc.length;j++){var dx=cand[i].x-acc[j].x,dy=cand[i].y-acc[j].y;if(dx*dx+dy*dy<dm*dm){ok=false;break}}
          if(ok)acc.push(cand[i]);
        }
        for(i=acc.length-1;i>0;i--){j=(Math.random()*(i+1))|0;var u=acc[i];acc[i]=acc[j];acc[j]=u}
        targetList=acc;assignTargets();
      };
      img.src=logo.src;
    }
    window.CDNodes={set:function(o){morph.p=o.p;morph.cx=o.cx;morph.cy=o.cy;morph.size=o.size;if(o.p>0)buildTargets()}};

    function resize(){
      var w=window.innerWidth,h=window.innerHeight;
      c.width=w;c.height=h;init();
      if(reduce)draw(true);
    }
    function init(){
      pts=[];
      var n=Math.min(220,Math.max(120,Math.floor((c.width*c.height)/9000)));
      for(var i=0;i<n;i++){
        pts.push({
          x:Math.random()*c.width,y:Math.random()*c.height,
          vx:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.8,
          r:Math.random()*2+.6,
          phase:Math.random()*Math.PI*2,
          speed:Math.random()*.012+.01,
          bright:Math.random()>.72
        });
      }
      assignTargets();
    }
    var frame=0;
    function draw(once){
      frame++;
      mouse.x+=(mouse.tx-mouse.x)*.18;
      mouse.y+=(mouse.ty-mouse.y)*.18;
      ctx.clearRect(0,0,c.width,c.height);
      var linkBoost=mouse.inside?0:(Math.sin(frame*.012)*.07+.07);
      var m=morph.p,link=LINK*(1-m)+52*m;
      var i,j,p;
      for(i=0;i<pts.length;i++){
        p=pts[i];
        p.phase+=p.speed;
        p._pv=Math.sin(p.phase)*.28+.72;
        if(mouse.inside){
          var mdx=p.x-mouse.x,mdy=p.y-mouse.y;
          var md=Math.sqrt(mdx*mdx+mdy*mdy);
          p._distC=md;
          if(md<REPEL&&md>0){
            var rs=FORCE*(1-md/REPEL);
            p.vx+=(mdx/md)*rs;p.vy+=(mdy/md)*rs;
          }else if(md<ATTRACT){
            var as=0.12*(1-(md-REPEL)/(ATTRACT-REPEL));
            p.vx-=(mdx/md)*as;p.vy-=(mdy/md)*as;
          }
        }else{p._distC=9999;}
        if(m>0&&p.t){
          var tx=morph.cx+p.t.x*morph.size,ty=morph.cy+p.t.y*morph.size,kk=.05*m*m+.004*m;
          p.vx+=(tx-p.x)*kk;p.vy+=(ty-p.y)*kk;
        }
        var damp=(mouse.inside?.92:.94)*(1-m*.11);
        p.vx*=damp;p.vy*=damp;
        var minD=(mouse.inside?.18:.32)*(1-m*.9);
        if(Math.abs(p.vx)<minD)p.vx+=(Math.random()-.5)*.4;
        if(Math.abs(p.vy)<minD)p.vy+=(Math.random()-.5)*.4;
        if(!once){p.x+=p.vx;p.y+=p.vy;}
        if(p.x<0){p.x=0;p.vx=Math.abs(p.vx);}
        if(p.x>c.width){p.x=c.width;p.vx=-Math.abs(p.vx);}
        if(p.y<0){p.y=0;p.vy=Math.abs(p.vy);}
        if(p.y>c.height){p.y=c.height;p.vy=-Math.abs(p.vy);}
      }
      ctx.lineWidth=.7;
      for(i=0;i<pts.length;i++){
        for(j=i+1;j<pts.length;j++){
          var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;
          var d2=dx*dx+dy*dy;
          if(d2<link*link){
            var d=Math.sqrt(d2);
            var alpha=Math.min(.95,(0.65+linkBoost)*(1-d/link)*(1+m*.45));
            ctx.strokeStyle='rgba('+_redRGB+','+alpha.toFixed(2)+')';
            ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();
          }
        }
      }
      if(mouse.inside){
        ctx.lineWidth=.5;
        for(i=0;i<pts.length;i++){
          var cd=pts[i]._distC;
          if(cd<ATTRACT){
            var ca=(0.75*(1-cd/ATTRACT)).toFixed(2);
            ctx.strokeStyle='rgba('+_redRGB+','+ca+')';
            ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
          }
        }
      }
      for(i=0;i<pts.length;i++){
        p=pts[i];
        var glow=p._distC<ATTRACT?(1-p._distC/ATTRACT)*.9:0;
        var breath=mouse.inside?0:(Math.sin(frame*.018+p.x*.008)*.09+.09);
        var a=(.72+glow+breath)*p._pv;
        if(m>0&&!p.t)a*=(1-.6*m);
        if(p.bright||glow>0.2){
          ctx.beginPath();
          ctx.arc(p.x,p.y,p.r*(p.bright?5:3),0,Math.PI*2);
          ctx.fillStyle='rgba('+_redRGB+','+(a*(p.bright?.4:.5)).toFixed(2)+')';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r+(glow*2)+(p.t?m*.9:0),0,Math.PI*2);
        ctx.fillStyle='rgba('+_redRGB+','+Math.min(a,0.95).toFixed(2)+')';
        ctx.fill();
      }
      if(mouse.inside){
        ctx.beginPath();ctx.arc(mouse.x,mouse.y,5,0,Math.PI*2);
        ctx.fillStyle='rgba('+_redRGB+',.9)';ctx.fill();
        ctx.beginPath();ctx.arc(mouse.x,mouse.y,14,0,Math.PI*2);
        ctx.fillStyle='rgba('+_redRGB+',.12)';ctx.fill();
      }
      if(!once)requestAnimationFrame(loop);
    }
    function loop(){draw(false);}
    /* the canvas fills the window, so cursor position = viewport position */
    document.addEventListener('mousemove',function(e){
      mouse.tx=e.clientX;mouse.ty=e.clientY;mouse.inside=true;
    },{passive:true});
    document.addEventListener('mouseleave',function(){mouse.inside=false},{passive:true});
    window.addEventListener('resize',function(){setTimeout(resize,60)},{passive:true});
    resize();
    if(!reduce&&!running){running=true;requestAnimationFrame(loop);}
  })();
})();

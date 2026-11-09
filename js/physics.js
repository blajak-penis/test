(()=>{"use strict";
window.CALPhysics={
  makeBody(c){const parts=c.bones.map(b=>({id:b.id,x:b.x||0,y:b.y||0,vx:0,vy:0,px:b.x||0,py:b.y||0,m:Math.max(.2,b.mass||1)}));const by=new Map(parts.map(p=>[p.id,p]));const links=c.bones.filter(b=>b.parent).map(b=>({a:by.get(b.parent),b:by.get(b.id),len:b.len,stiff:.9}));return {parts,links,time:0};},
  step(body,ctrl,dt){const P=body.parts;for(let i=0;i<P.length;i++){const p=P[i];p.vy+=16*dt;p.vx*=.995;p.vy*=.995;const a=ctrl[i]||0;p.vx+=Math.sin(a)*4*dt;p.vy+=Math.cos(a)*1.5*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}
    for(let k=0;k<5;k++)for(const l of body.links){let dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,d=Math.hypot(dx,dy)||.001,q=(d-l.len)/d*.5*l.stiff;let cx=dx*q,cy=dy*q;l.a.x+=cx;l.a.y+=cy;l.b.x-=cx;l.b.y-=cy}
    for(const p of P){if(p.y>85){p.y=85;p.vy=Math.min(0,p.vy)*-.12;p.vx*=.86}if(p.x<-420){p.x=-420;p.vx*=-.2}if(p.x>420){p.x=420;p.vx*=-.2}}
    body.time+=dt;
  },
  pose(body){return body.parts.map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy}))},
  displacement(body){return body.parts.reduce((a,p)=>a+p.x,0)/body.parts.length}
};})();
(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$("#stage"),ctx=canvas.getContext("2d");
let W=0,H=0,mode="2d",goal="walk",running=false,arenaRunning=false,frame=0,zoom=1;
let creature=makeCreature("Rookie"), generation=0,best=0,fitness=0;
let creatures=[creature,makeCreature("Opponent")];
const log=(m)=>{$("#log").textContent=(m+"\n"+$("#log").textContent).slice(0,3500)};

function makeCreature(name){
  return {name,bones:[
    {id:"root",name:"Root",x:0,y:-35,len:42,angle:0},
    {id:"legL",name:"Leg L",x:-12,y:0,len:42,angle:.35,parent:"root"},
    {id:"legR",name:"Leg R",x:12,y:0,len:42,angle:-.35,parent:"root"},
    {id:"footL",name:"Foot L",x:-12,y:40,len:24,angle:.15,parent:"legL"},
    {id:"footR",name:"Foot R",x:12,y:40,len:24,angle:-.15,parent:"legR"},
    {id:"armL",name:"Arm L",x:-23,y:-18,len:30,angle:.55,parent:"root"},
    {id:"armR",name:"Arm R",x:23,y:-18,len:30,angle:-.55,parent:"root"}
  ],muscles:[
    {id:"hipL",name:"Hip L",a:"root",b:"legL",power:.8},
    {id:"hipR",name:"Hip R",a:"root",b:"legR",power:.8},
    {id:"armL",name:"Arm L",a:"root",b:"armL",power:.6},
    {id:"armR",name:"Arm R",a:"root",b:"armR",power:.6}
  ],brain:{weights:Array.from({length:14},()=>Math.random()*2-1)}};
}
function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;W=r.width;H=r.height;canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
addEventListener("resize",resize);resize();

function worldPoint(b){
  let x=b.x,y=b.y,a=b.angle;
  if(b.parent){const p=creature.bones.find(q=>q.id===b.parent);if(p){const pp=worldPoint(p);x+=pp.x;y+=pp.y;a+=p.angle}}
  return {x,y,a};
}
function endpoints(b){const p=worldPoint(b);return {x:p.x,y:p.y,tx:p.x+Math.sin(p.a)*b.len,ty:p.y+Math.cos(p.a)*b.len}}
function draw2D(){
  ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H*.58);ctx.scale(zoom,zoom);
  ctx.strokeStyle="#172235";ctx.lineWidth=1;for(let x=-600;x<600;x+=40){ctx.beginPath();ctx.moveTo(x,250);ctx.lineTo(x,-250);ctx.stroke()}for(let y=-240;y<280;y+=40){ctx.beginPath();ctx.moveTo(-600,y);ctx.lineTo(600,y);ctx.stroke()}
  ctx.strokeStyle="#26384d";ctx.beginPath();ctx.moveTo(-600,85);ctx.lineTo(600,85);ctx.stroke();
  for(const b of creature.bones){const e=endpoints(b);ctx.lineWidth=8;ctx.strokeStyle="#8fb3df";ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.tx,e.ty);ctx.stroke();ctx.lineWidth=3;ctx.strokeStyle="#dcecff";ctx.stroke();ctx.fillStyle="#4b8bd8";ctx.beginPath();ctx.arc(e.x,e.y,7,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.tx,e.ty,6,0,Math.PI*2);ctx.fill()}
  for(const m of creature.muscles){const a=creature.bones.find(b=>b.id===m.a),b=creature.bones.find(b=>b.id===m.b);if(a&&b){const p=endpoints(a),q=endpoints(b);ctx.strokeStyle="#e28a8a";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.tx,p.ty);ctx.lineTo(q.x,q.y);ctx.stroke()}}
  ctx.fillStyle="#dce7f7";ctx.font="12px system-ui";ctx.fillText(creature.name,-55,-125);ctx.restore();
}
function draw3D(){
  ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H*.55);ctx.scale(zoom,zoom);
  const nodes=creature.bones.map(b=>({b,p:worldPoint(b)}));
  const project=(x,y,z)=>({x:x+z*.45,y:y-z*.28});
  ctx.strokeStyle="#18283d";for(let i=-300;i<=300;i+=40){ctx.beginPath();let a=project(i,110,-180),b=project(i,110,180);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();a=project(-300,110,i);b=project(300,110,i);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
  for(const {b,p} of nodes){const e=project(p.x,p.y,p.x*.18);const t=project(p.x+Math.sin(p.a)*b.len,p.y+Math.cos(p.a)*b.len,p.x*.18);ctx.strokeStyle="#8fb3df";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.fillStyle="#4b8bd8";ctx.beginPath();ctx.arc(e.x,e.y,7,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle="#dce7f7";ctx.font="12px system-ui";ctx.fillText(creature.name,-55,-145);ctx.restore();
}
function draw(){mode==="2d"?draw2D():draw3D();frame++;requestAnimationFrame(draw)}
draw();

function rebuildLists(){
  $("#boneList").innerHTML=creature.bones.map((b,i)=>'<div class="item"><span>'+b.name+'</span><input data-bone="'+b.id+'" type="range" min="-180" max="180" value="'+Math.round(b.angle*57.3)+'"></div>').join("");
  $("#muscleList").innerHTML=creature.muscles.map(m=>'<div class="item"><span>'+m.name+'</span><small>'+m.a+' → '+m.b+'</small></div>').join("");
  $$("[data-bone]").forEach(el=>el.oninput=()=>{const b=creature.bones.find(q=>q.id===el.dataset.bone);if(b)b.angle=+el.value*Math.PI/180});
}
function selectMode(m){mode=m;$("#mode2d").classList.toggle("active",m==="2d");$("#mode3d").classList.toggle("active",m==="3d");$("#modeLabel").textContent=m==="2d"?"2D Rig View":"3D Preview"}
$("#mode2d").onclick=()=>selectMode("2d");$("#mode3d").onclick=()=>selectMode("3d");
$$(".tab").forEach(t=>t.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".tab-page").forEach(x=>x.classList.remove("active"));t.classList.add("active");$("#tab-"+t.dataset.tab).classList.add("active")});
$$(".goal").forEach(g=>g.onclick=()=>{$$(".goal").forEach(x=>x.classList.remove("active"));g.classList.add("active");goal=g.dataset.goal;log("Goal changed to "+goal)});
$("#creatureName").oninput=e=>creature.name=e.target.value||"Creature";
$("#addBone").onclick=()=>{const id="bone"+Date.now();creature.bones.push({id,name:"Bone "+creature.bones.length,x:0,y:0,len:30,angle:0,parent:"root"});rebuildLists()};
$("#removeBone").onclick=()=>{if(creature.bones.length>1){const b=creature.bones.pop();creature.muscles=creature.muscles.filter(m=>m.a!==b.id&&m.b!==b.id);rebuildLists()}};
$("#addMuscle").onclick=()=>{const ids=creature.bones.map(b=>b.id);creature.muscles.push({id:"m"+Date.now(),name:"Muscle "+creature.muscles.length,a:ids[0],b:ids[Math.min(1,ids.length-1)],power:.5});rebuildLists()};
$("#removeMuscle").onclick=()=>{creature.muscles.pop();rebuildLists()};
$("#bodyPreset").onchange=()=>applyBodyPreset($("#bodyPreset").value);
$("#applyPreset").onclick=()=>applyBodyPreset($("#bodyPreset").value);
function applyBodyPreset(p){
  const c=makeCreature(creature.name); if(p==="Runner")c.bones.forEach(b=>b.len*=1.2);
  if(p==="Climber"){c.bones.push({id:"handL",name:"Hand L",x:-20,y:0,len:18,angle:0,parent:"armL"},{id:"handR",name:"Hand R",x:20,y:0,len:18,angle:0,parent:"armR"});}
  if(p==="Quadruped"){c.bones.push({id:"rearL",name:"Rear L",x:-16,y:18,len:38,angle:.3,parent:"root"},{id:"rearR",name:"Rear R",x:16,y:18,len:38,angle:-.3,parent:"root"});}
  creature.bones=c.bones;creature.muscles=c.muscles;creature.brain=c.brain;rebuildLists();log("Applied "+p+" body preset");
}
$("#population").oninput=e=>$("#popOut").textContent=e.target.value;
$("#mutation").oninput=e=>$("#mutOut").textContent=e.target.value+"%";
$("#trainSpeed").oninput=e=>$("#speedOut").textContent=e.target.value+"x";

let trainTimer=null;
function score(){
  const base={walk:Math.random()*40+40,run:Math.random()*50+35,jump:Math.random()*45+35,roll:Math.random()*45+30,climb:Math.random()*40+25,balance:Math.random()*50+35,fight:Math.random()*45+35}[goal];
  const complexity=creature.bones.length*1.7+creature.muscles.length*2;
  return Math.max(0,base+complexity+generation*.8);
}
function trainStep(){
  generation++;fitness=score();if(fitness>best)best=fitness;
  creature.brain.weights=creature.brain.weights.map(w=>w+(Math.random()-.5)*(+$("#mutation").value/100));
  $("#generation").textContent=generation;$("#fitness").textContent=fitness.toFixed(1);$("#best").textContent=best.toFixed(1);
  $("#runState").textContent="TRAINING";log("gen "+generation+" · "+goal+" · fitness "+fitness.toFixed(1));
}
$("#stepBtn").onclick=trainStep;
$("#trainBtn").onclick=()=>{if(running){stopTraining();return}running=true;$("#trainBtn").textContent="Pause training";const tick=()=>{if(!running)return;for(let i=0;i<+$("#trainSpeed").value;i++)trainStep();trainTimer=setTimeout(tick,90)};tick()};
function stopTraining(){running=false;clearTimeout(trainTimer);$("#trainBtn").textContent="Start training";$("#runState").textContent="READY"}
$("#stopBtn").onclick=stopTraining;

function fillArena(){["arenaA","arenaB"].forEach((id,i)=>{$("#"+id).innerHTML=creatures.map((c,n)=>'<option value="'+n+'">'+c.name+'</option>').join("");$("#"+id).value=i})}
$("#fightBtn").onclick=()=>{arenaRunning=true;$("#runState").textContent="ARENA";log("Arena started")};
$("#stopFight").onclick=()=>{arenaRunning=false;$("#runState").textContent="READY";log("Arena stopped")};

const oldDraw=draw; // arena overlay via draw loop patch
function arenaOverlay(){
  if(!arenaRunning)return;
  ctx.save();ctx.fillStyle="rgba(5,8,12,.22)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#cfe0f8";ctx.font="bold 14px system-ui";ctx.fillText("ARENA · "+creatures[+$("#arenaA").value].name+" vs "+creatures[+$("#arenaB").value].name,14,26);ctx.restore();
}
const rawRAF=requestAnimationFrame; // overlay through independent loop
setInterval(()=>arenaOverlay(),120);

$("#newCreature").onclick=()=>{creature=makeCreature("Creature "+(creatures.length+1));creatures.push(creature);rebuildLists();fillArena();log("Created new creature")};
$("#resetCreature").onclick=()=>{creature=makeCreature($("#creatureName").value||"Rookie");rebuildLists();log("Creature reset")};
$("#saveBtn").onclick=()=>{const blob=new Blob([JSON.stringify(creature,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(creature.name||"creature")+".json";a.click();URL.revokeObjectURL(a.href)};
$("#loadFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{creature=JSON.parse(r.result);creatures[0]=creature;rebuildLists();fillArena();log("Imported "+f.name)}catch(err){log("Import failed")}};r.readAsText(f)};
$("#demoBtn").onclick=()=>{generation=0;best=0;fitness=0;for(let i=0;i<40;i++)trainStep();log("Loaded demo evolution")};

rebuildLists();fillArena();
window.addEventListener("pointerdown",e=>{if(e.target===canvas)canvas.setPointerCapture(e.pointerId)});
})();
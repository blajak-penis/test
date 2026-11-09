(()=>{"use strict";
class Evolution{
 constructor(make,fitness,size,mutation){this.make=make;this.fitness=fitness;this.size=size;this.mutation=mutation;this.generation=0;this.pop=[];this.best=null;this.avg=0}
 seed(){this.pop=Array.from({length:this.size},()=>this.make())}
 step(){const ranked=this.pop.map(x=>({x,score:this.fitness(x)})).sort((a,b)=>b.score-a.score);this.best=ranked[0];this.avg=ranked.reduce((s,x)=>s+x.score,0)/ranked.length;this.generation++;const elite=Math.max(1,Math.floor(this.size*.2)),next=ranked.slice(0,elite).map(x=>x.x);while(next.length<this.size){const p=ranked[Math.floor(Math.random()*elite)].x;const c=this.make(p);c.brain.mutate(this.mutation);next.push(c)}this.pop=next;return this.best}
}
window.CALEvolution=Evolution;
})();
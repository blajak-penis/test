(()=>{"use strict";
function rand(){return Math.random()*2-1}
class Brain{
 constructor(input=12,hidden=10,output=8,genes){this.input=input;this.hidden=hidden;this.output=output;this.genes=genes||Array.from({length:input*hidden+hidden+hidden*output+output},rand)}
 forward(x){let k=0,h=[];for(let j=0;j<this.hidden;j++){let s=0;for(let i=0;i<this.input;i++)s+=x[i]*this.genes[k++];s+=this.genes[k++];h[j]=Math.tanh(s)}
 let o=[];for(let j=0;j<this.output;j++){let s=0;for(let i=0;i<this.hidden;i++)s+=h[i]*this.genes[k++];s+=this.genes[k++];o[j]=Math.tanh(s)}return o}
 clone(){return new Brain(this.input,this.hidden,this.output,this.genes.slice())}
 mutate(rate){for(let i=0;i<this.genes.length;i++)if(Math.random()<rate)this.genes[i]+=rand()*rate*.8}
}
window.CALBrain=Brain;
})();
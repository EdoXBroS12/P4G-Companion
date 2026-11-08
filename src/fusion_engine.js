/* Adapted from aqiu384/megaten-fusion-tool (Unlicense), commit in fusion_data.json.
   Complete finite direct combinations for a chosen current-level configuration.
   Skill chains and fusion accidents are deliberately not guessed. */
(function(root){
class FusionEngine{
 constructor(data){
  this.data=data;this.names=Object.keys(data.demons).sort();this.dem=data.demons;
  this.levels={};this.bins={};this.order=Object.fromEntries(data.chart.races.map((r,i)=>[r,i]));
  for(const name of this.names){let d=this.dem[name];this.levels[name]=d.lvl;if(!data.special[name])(this.bins[d.race]??=[]).push(name)}
  for(const a of Object.values(this.bins))a.sort((a,b)=>this.dem[a].lvl-this.dem[b].lvl);
  this.pairSpecial={};this.tripleSpecial={};for(const [n,a]of Object.entries(data.special)){if(a.length===2)this.pairSpecial[[...a].sort().join('|')]=n;if(a.length===3)this.tripleSpecial[[...a].sort().join('|')]=n;}
 }
 race(a,b,triple=false){let i=this.order[a],j=this.order[b];if(i===undefined||j===undefined)return null;const r=triple?this.data.chart.table[Math.max(i,j)][Math.min(i,j)]:this.data.chart.table[Math.min(i,j)][Math.max(i,j)];return r==='-'?null:r;}
 normal(a,b){
  if(a===b)return null;
  const fixed=this.pairSpecial[[a,b].sort().join('|')];if(fixed)return fixed;
  const x=this.dem[a],y=this.dem[b];if(!x||!y)return null;
  const race=this.race(x.race,y.race),bins=(this.bins[race]||[]).filter(n=>n!==a&&n!==b);
  if(x.race===y.race){const threshold=(x.lvl+y.lvl)/2+1;return [...bins].reverse().find(n=>this.dem[n].lvl<=threshold)||null;}
  const threshold=(x.lvl+y.lvl)/2+.5;
  return bins.find(n=>this.dem[n].lvl>=threshold)||bins.at(-1)||null;
 }
 triple(a,b,c){
  if(new Set([a,b,c]).size!==3)return null;
  const fixed=this.tripleSpecial[[a,b,c].sort().join('|')];if(fixed)return fixed;
  const names=[a,b,c].sort((a,b)=>this.levels[b]-this.levels[a]||this.order[this.dem[a].race]-this.order[this.dem[b].race]);
  const [hi,lo1,lo2]=names.map(n=>this.dem[n]);
  let mid=lo1.race===lo2.race?lo1.race:this.race(lo1.race,lo2.race);
  if(!mid)return null;
  let race=this.race(mid,hi.race,true);if(!race)return null;
  const threshold=(hi.lvl+lo1.lvl+lo2.lvl)/3+4.25;
  return (this.bins[race]||[]).find(n=>![a,b,c].includes(n)&&this.dem[n].lvl>=threshold)||null;
 }
 canInherit(target,skill){const d=this.dem[target],s=this.data.skills.find(s=>s.name===skill);if(s?.element==='pas')return true;const i=this.data.inherit.elems.indexOf(s?.element),r=this.data.inherit.inherits.indexOf(d.inherits||d.inherit);return !!(i>=0&&r>=0&&this.data.inherit.ratios[r][i]>0)}
 sources(names,skill){return names.filter(n=>this.dem[n].skills[skill]!==undefined).map(n=>({name:n,learnAt:Math.max(this.dem[n].lvl,Math.ceil(this.dem[n].skills[skill])),ready:this.levels[n]>=this.dem[n].skills[skill]}));}
 recipes(target,kind='all'){
  if(this.data.special[target])return [{kind:'special',ingredients:this.data.special[target],target}];
  const results=[],a=this.names;
  if(kind!=='triple')for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(this.normal(a[i],a[j])===target)results.push({kind:'normal',ingredients:[a[i],a[j]],target});
  if(kind!=='normal')for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)if(this.triple(a[i],a[j],a[k])===target)results.push({kind:'triple',ingredients:[a[i],a[j],a[k]],target});
  return results;
 }
}
if(typeof module!=='undefined')module.exports=FusionEngine;else root.FusionEngine=FusionEngine;
})(typeof window!=='undefined'?window:globalThis);

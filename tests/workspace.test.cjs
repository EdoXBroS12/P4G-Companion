const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const load=()=>import(pathToFileURL(path.resolve(__dirname,'../src/workspace-ui.js')).href);
test('all 69 quests remain reachable once across pages, without changing the catalogue',async()=>{
 const {questPage}=await load(),rows=Array.from({length:69},(_,i)=>({id:i+1}));const before=JSON.stringify(rows),ids=[];
 for(let page=0;page<6;page++){const result=questPage(rows,page);ids.push(...result.items.map(q=>q.id));assert.ok(result.items.length<=12);assert.equal(result.pages,6);}
 assert.deepEqual(ids,rows.map(q=>q.id));assert.equal(JSON.stringify(rows),before);
});
test('filtering and invalid page numbers always resolve to a usable page',async()=>{
 const {questPage}=await load();const rows=[{id:19},{id:33}];
 assert.deepEqual(questPage(rows,999).items,rows);assert.equal(questPage(rows,999).first,1);
 assert.equal(questPage(rows,-1).page,0);assert.equal(questPage(rows,NaN).page,0);
 const empty=questPage([],10);assert.equal(empty.page,0);assert.equal(empty.pages,1);assert.equal(empty.first,0);assert.equal(empty.last,0);
});

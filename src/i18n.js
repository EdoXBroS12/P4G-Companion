const normalized=s=>String(s??'').replace(/\r\n/g,'\n').replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim();
export function createI18n(){
  let language='it',dictionary=new Map(),observer=null,queued=false;
  const originals=new WeakMap(),originalAttrs=new WeakMap();
  const skip='script,style,textarea,[data-no-translate],.en,.profile-name,#profile';
  function t(value){
    const original=String(value??'');if(language!=='en'||!original.trim())return original;
    const exact=dictionary.get(normalized(original));if(exact)return exact;
    const questTitle=/^(Q\d+ · )(.+)$/.exec(original);if(questTitle)return questTitle[1]+t(questTitle[2]);
    const period=/^DIARIO \/ (.+)$/.exec(original);if(period)return 'JOURNAL / '+({'aprile-giugno':'April–June','luglio-agosto':'July–August','settembre-ottobre':'September–October','novembre-dicembre':'November–December','gennaio-febbraio':'January–February'}[period[1]]||period[1]);
    const guideHeading=/^GUIDA \/ (.+)$/.exec(original);if(guideHeading)return 'GUIDE / '+({'PREPARAZIONE':'PREPARATION','SOCIAL LINK':'SOCIAL LINKS','UTILITY':'ACTIVITIES'}[guideHeading[1]]||guideHeading[1]);
    const selectSearch=/^Cerca in (.+)$/.exec(original);if(selectSearch)return 'Search '+t(selectSearch[1]);
    const rules=[
      [/^Ora stai cercando come creare (.+)\.$/,'You are now looking for a way to fuse $1.'],
      [/^È un ingrediente intermedio\. La richiesta finale resta (.+) con (.+)\.$/,'This is an intermediate ingredient. The final request is still $1 with $2.'],
      [/^Seleziona una voce: (.+)$/,'Choose an option: $1'],
      [/^(\d+) voce · Invio per scegliere$/,'$1 option · Enter to select'],
      [/^(\d+) voci · Invio per scegliere$/,'$1 options · Enter to select'],
      [/^OPZIONE (.+)$/,'OPTION $1'],[/^PERCORSO (\d+)$/,'ROUTE $1'],
      [/^(\d+)–(\d+) di (\d+)$/,'$1–$2 of $3'],
      [/^Stato quest (\d+)$/,'Quest $1 status'],
      [/^Illustrazione ([\s\S]+)$/,'Illustration: $1'],
      [/^Livello base (\d+) per una nuova fusione\. Una versione già registrata può essere evocata dal Compendium NG\+\.$/,'Base level $1 for a new fusion. A registered version can be summoned from the NG+ Compendium.'],
      [/^Passo\s+(\d+)\s+di\s+(\d+)$/,'Step $1 of $2'],
      [/^Passo\s*$/,'Step '],[/^\s*di\s+(\d+)$/,' of $1'],
      [/^Rango\s+(\d+)$/,'Rank $1'],[/^✓ Rango\s+(\d+)$/,'✓ Rank $1'],
      [/^(\d+)\/(\d+) completate nel ramo$/,'$1/$2 completed in this diary branch'],
      [/^(\d+) richieste · Nessuno stato è ricavato automaticamente dal salvataggio del gioco\.$/,'$1 requests · Quest status is not read automatically from your game save.'],
      [/^(\d+) capitoli trovati$/,'$1 chapters found'],
      [/^(\d+) ricette filtrate su (\d+) totali · (.+) livello base (\d+)\. Controlla risultato e abilità nella preview del gioco\.$/,'$1 filtered recipes out of $2 total · $3 base level $4. Check the result and skill in the game preview.'],
      [/^Come creo (.+)\?$/,'How do I fuse $1?'],
      [/^Rango (\d+) · (.+) con (.+)$/,'Rank $1 · $2 with $3'],
      [/^(.+) · livello base (\d+)$/,'$1 · base level $2'],
      [/^Risultato richiesto$/,'Required result'],
      [/^SPECIALE · (\d+)$/,'SPECIAL · $1'],[/^NORMALE · (\d+)$/,'NORMAL · $1'],[/^TRIANGOLARE · (\d+)$/,'TRIANGLE · $1'],
      [/^(.+): (.+) al livello (\d+) · controlla che la conservi$/,'$1: $2 at level $3 · check that the skill is still present'],
      [/^(.+): (.+) al livello (\d+) · da allenare$/,'$1: $2 at level $3 · training required'],
      [/^Richiede la skill già trasmessa a un ingrediente o una carta (.+)\. Segui la catena guidata del rango\.$/,'Requires the skill on an ingredient or a $1 Skill Card. Follow the guided recipe for this rank.'],
      [/^Spunte del ramo: (.+)$/,'Diary branch: $1'],[/^Salvataggio fallito: (.+)$/,'Could not save: $1'],
      [/^Dal (.+)$/,'Available from $1'],[/^Termine: (.+) · leggi le note della scheda$/,'Target date: $1 · read the quest notes'],
    ];
    for(const [pattern,replacement]of rules)if(pattern.test(original.trim()))return original.trim().replace(pattern,replacement);
    return original;
  }
  function nodeText(node){
    if(node.parentElement?.closest(skip)||!node.nodeValue?.trim())return;
    if(!originals.has(node))originals.set(node,node.nodeValue);
    const source=originals.get(node),translated=t(source);
    if(node.nodeValue!==translated)node.nodeValue=translated;
  }
  function translateDOM(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while((n=walker.nextNode()))nodeText(n);
    for(const element of root.querySelectorAll('[placeholder],[title],[aria-label],[alt]')){
      if(element.closest(skip))continue;
      for(const attr of ['placeholder','title','aria-label','alt']){
        const value=element.getAttribute(attr);if(value){let attrs=originalAttrs.get(element);if(!attrs){attrs={};originalAttrs.set(element,attrs);}if(!attrs[attr]||value!==attrs[attr].output)attrs[attr]={source:value,output:value};const translated=t(attrs[attr].source);attrs[attr].output=translated;if(value!==translated)element.setAttribute(attr,translated);}
      }
    }
    document.documentElement.lang=language;
  }
  function observe(root=document.body){
    observer?.disconnect();observer=new MutationObserver(records=>{
      if(!records.some(r=>r.type==='childList'||(r.type==='characterData'&&r.target.nodeValue!==t(originals.get(r.target)??r.target.nodeValue))))return;
      if(queued)return;queued=true;queueMicrotask(()=>{queued=false;translateDOM(root)});
    });observer.observe(root,{subtree:true,childList:true,characterData:true});translateDOM(root);
  }
  return {t,translateDOM,observe,setLanguage(l){language=l==='en'?'en':'it';document.documentElement.lang=language;},getLanguage:()=>language,setDictionary(obj){dictionary=new Map(Object.entries(obj).filter(([,v])=>typeof v==='string').map(([k,v])=>[normalized(k),v]));},has:s=>dictionary.has(normalized(s))};
}

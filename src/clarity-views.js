import { ENDING_CARDS, CONTENT_GROUPS, ROUTE_ORDER } from './content-map.js';
import { routeGuideSteps, journalHelp } from './journey-model.js';

export function createClarityViews(c) {
  const {e,rawEsc,btn,hero,tabbar,asset,blocks,notes,gallery,quickChoices,saveCardById,nav}=c;
  const status=(r)=>c.state.endings[r.id]?'Già visto':'Da ottenere';
  function shell(){
    const done=ENDING_CARDS.filter(r=>c.state.endings[r.id]).length;
    const inRoute=c.ui.view.startsWith('ending:');
    const extra=['preparazione','social','utility','sources'];
    return `<div class="app-shell"><aside class="sidebar">
      <div class="brand"><span class="brand-tv">P4G</span><div>COMPANION<small>GOLDEN · OFFLINE GUIDE</small></div></div>
      <div class="nav-group"><p>CHE COSA VUOI FARE?</p>${nav('La tua Inaba','home','⌂')}${nav('Finali e percorsi','roadmap','↗',done+'/7')}${nav('Quest secondarie','quests','▦',Object.values(c.profile().quests).filter(v=>v==='done').length+'/69')}${nav('Salvataggi','saves','▣')}${nav('Margaret · Fusioni','margaret','✦')}</div>
      <div class="nav-group"><details class="routes-nav" ${inRoute?'open':''}><summary>Scegli un finale</summary>${ENDING_CARDS.filter(r=>!c.state.endings[r.id]).map(r=>nav(r.title,'ending:'+r.id,'<i style="background:'+r.color+'"></i>',c.state.endings[r.id]?'✓':'')).join('')}<details class="seen-endings" ${ENDING_CARDS.some(r=>c.state.endings[r.id]&&c.ui.view==='ending:'+r.id)?'open':''}><summary>Finali già visti</summary>${ENDING_CARDS.filter(r=>c.state.endings[r.id]).map(r=>nav(r.title,'ending:'+r.id,'✓')).join('')}</details></details></div>
      <div class="nav-group"><details ${extra.includes(c.ui.view)?'open':''}><summary>Preparazione e altre guide</summary>${nav('Preparazione','preparazione','◉')}${nav('Social Link','social','♡')}${nav('Libri, pesca e materiali','utility','◇')}${nav('Fonti e documenti','sources','☷')}</details>${nav('App e progressi','settings','⚙')}</div>
      <div class="footer-status"><img src="${asset('teddie_layout.png')}" alt="Teddie"><p>Un passo alla volta.<small>Guide e diario offline</small></p></div>
      </aside><div class="workspace"><header class="topbar"><strong class="topbar-title">P4G COMPANION</strong><div class="searchbox"><input type="search" id="global-search" placeholder="Cerca nella guida e premi Invio" aria-label="Cerca nella guida"></div><div class="header-actions"><div class="language-switch" role="group" aria-label="Language" data-no-translate>${['it','en'].map(l=>`<button data-action="language" data-value="${l}" aria-pressed="${c.i18n.getLanguage()===l}" title="${l==='it'?'Italiano':'English'}">${l.toUpperCase()}</button>`).join('')}</div>${btn('▣ <span class="full-only">Overlay</span>','compact','title="Apri il pannello compatto"','icon')}${btn(c.windowMode.pinned?'◆':'◇','pin','title="Sempre in primo piano"','icon')}${btn('—','minimize','title="Riduci a icona"','icon')}</div></header>
      <div class="toolbar"><select class="compact-nav" id="compact-nav" aria-label="Sezione">${[['home','La tua Inaba'],...ENDING_CARDS.map(r=>['ending:'+r.id,r.title]),['quests','69 quest'],['saves','Salvataggi'],['margaret','Margaret / Fusioni'],['roadmap','Finali e percorsi'],['settings','App e progressi']].map(([id,t])=>`<option value="${id}" ${c.ui.view===id?'selected':''}>${e(t)}</option>`).join('')}</select><label class="small" for="profile">Ramo del diario</label><select id="profile" class="profile-name">${Object.entries(c.state.profiles).map(([id,p])=>`<option value="${e(id)}" ${id===c.state.activeProfile?'selected':''}>${rawEsc(p.name)}</option>`).join('')}</select>${btn('+ Nuovo ramo','new-profile','','small')}${btn('?','journal-help','aria-label="Come funziona il diario"','icon')}</div>
      <main class="content" id="content"></main></div></div>`;
  }
  function home(){
    const next=(c.state.settings.personalContext?[...ROUTE_ORDER,'bad1','bad2']:['bad1','bad2',...ROUTE_ORDER]).map(id=>ENDING_CARDS.find(r=>r.id===id)).find(r=>!c.state.endings[r.id]);
    const pos=c.profile().position, resume=pos&&ENDING_CARDS.find(r=>r.id===pos.routeId);
    const done=ENDING_CARDS.filter(r=>c.state.endings[r.id]).length;
    return hero('La tua seconda run,\nun passo alla volta.','Scegli che cosa vuoi fare. Ogni percorso tiene insieme solo le istruzioni che gli servono.','team.png','PERSONA 4 GOLDEN')+`
      <div class="home-progress"><span><strong>${done}/7</strong> finali visti</span><span><strong>${Object.values(c.profile().quests).filter(s=>s==='done').length}/69</strong> quest completate nel diario</span></div>
      <div class="home-primary-grid">
        <article class="panel next-route" style="--accent:${next?.color||'#ffdc00'}"><p class="eyebrow">${resume?'Riprendi la lettura':'Ordine consigliato dei finali'}</p><h2>${e((resume||next)?.title||'Tutti i finali segnati come visti')}</h2><p>${e(resume?'Riapri il punto che stavi consultando. Il diario ricorda la lettura, non la posizione nel gioco.':next?.intro||'Puoi consultare o ripetere ogni percorso dalla mappa.')}</p>${resume?btn('Riprendi il percorso','resume','data-route="'+resume.id+'"','primary'):next?btn('Apri il percorso guidato','go','data-view="ending:'+next.id+'"','primary'):''}${btn('Scegli un altro finale','go','data-view="roadmap"')}</article>
        <article class="panel current-run"><h2>Scenario di riferimento</h2><p><strong>Esempio: 22 maggio · NG+</strong><br>Kanji salvato; Adachi 1, Marie 2, Margaret 2.</p><p class="small">Le guide illustrate seguono questo scenario NG+. Il tuo diario parte vuoto; segna tu i progressi. L’app non legge in tempo reale l’avanzamento di Steam.</p>${btn('Cosa fare da questa data','chapter','data-section="adesso"')}</article>
      </div>
      <div class="content-header"><h2>Che cosa ti serve adesso?</h2></div>
      <div class="home-tool-grid">
        <button class="tool-tile" data-nav="quests"><span class="tool-icon">▦</span><h3>Quest secondarie</h3><p>Trova l’NPC, segui l’obiettivo e controlla i termini.</p><span>Apri il diario →</span></button>
        <button class="tool-tile" data-nav="margaret"><span class="tool-icon">✦</span><h3>Fusioni di Margaret</h3><p>Scegli il rango. Vedi ingredienti, abilità e alternative.</p><span>Apri le richieste →</span></button>
        <button class="tool-tile" data-nav="saves"><span class="tool-icon">▣</span><h3>Salvataggi</h3><p>Quando creare uno slot e quale ricaricare.</p><span>Apri i checkpoint →</span></button>
      </div>
      <div class="panel mascot-note"><img src="${asset('teddie.png')}" alt="Teddie"><p><strong>Per usarla mentre giochi</strong><br>Il pulsante Overlay apre la finestra compatta. <kbd>Ctrl + Shift + Spazio</kbd> la mostra o la nasconde.</p></div>`;
  }
  function routeView(r){
    const tabs=[['guida','Passo passo'],['scelte','Risposte'],['checkpoint','Salvataggi'],['appunti','Appunti']];
    const t=[...tabs.map(([id])=>id),'schede'].includes(c.ui.tab)?c.ui.tab:'guida';
    const heading=c.windowMode.compact?`<div class="compact-route-title"><img src="${asset(r.artFile)}" alt="${e(r.characters.join(', '))}"><div><h1>${e(r.title)}</h1><p>${e(r.subtitle)}</p></div></div>`:hero(r.title,r.subtitle,r.artFile,r.characters.join(' · '),`<span class="pill">${e(status(r))}</span><span class="pill">${e(r.decisiveDate)}</span>`);
    const head=heading+tabbar(tabs,t);
    if(t==='scelte')return head+`<div class="page-intro"><h2>Le risposte da riconoscere nel gioco</h2><p>Usa il testo inglese per individuare l’opzione. Per preparazione e ordine completo degli eventi torna a Passo passo.</p></div>`+quickChoices(r);
    if(t==='checkpoint')return head+`<div class="page-intro"><h2>I salvataggi di questo percorso</h2><p>Devi crearli nel gioco. La casella qui sotto è soltanto un promemoria del tuo diario.</p></div>`+r.checkpointIds.map(saveCardById).join('')+finishPanel(r);
    if(t==='appunti')return head+notes('ending:'+r.id);
    if(t==='schede')return head+`<p>${btn('← Torna al percorso','route-tab','data-value="guida"')}</p>`+gallery(r.sectionIds);
    const steps=routeGuideSteps[r.id]||r.sectionIds.map(sectionId=>({id:sectionId,sectionId,title:c.byId[sectionId].title,why:''}));
    let index=steps.findIndex(s=>s.id===c.ui.journeyStep);
    if(index<0)index=steps.findIndex(s=>s.sectionId===c.ui.chapter);
    if(index<0&&c.profile().position?.routeId===r.id)index=steps.findIndex(s=>s.id===c.profile().position.stepId);
    if(index<0)index=0;
    const step=steps[index];c.ui.journeyStep=step.id;c.ui.chapter=step.sectionId;
    c.profile().position={routeId:r.id,stepId:step.id,chapterId:step.sectionId};
    const canonical=c.byId[step.sectionId];
    const section=step.blockIndices?{...canonical,blocks:step.blockIndices.map(i=>({...canonical.blocks[i],sourceBlockIndex:i}))}:canonical;
    if(r.id==='normal'&&step.sectionId==='normal'){
      const guard=section.blocks.find(b=>b.sourceBlockIndex===9);
      if(guard){guard.label='Prima di scegliere Yes · verifica D-T';guard.text='Controlla di avere D-T, slot 07, creato alla farfalla prima dell’ultimo saluto e della scena Dojima/Nanako. Se lo hai già creato, conservalo: non sovrascriverlo ora con un salvataggio successivo. Servirà per riprendere il True Ending dopo questo finale.';}
    }
    return head+`
      <div class="journey-bar"><span>Passo <strong>${index+1}</strong> di ${steps.length}</span><div class="inline-actions">${index?btn('← Precedente','journey','data-step="'+e(steps[index-1].id)+'"'):''}${index<steps.length-1?btn('Passo successivo →','journey','data-step="'+e(steps[index+1].id)+'"'):''}</div></div>
      <div class="reader-layout"><div class="reader-main">
        ${index===0?`<details class="disclosure-card prerequisites" open><summary>Prima di iniziare questo percorso</summary><ul>${r.prerequisites.map(p=>'<li>'+e(p)+'</li>').join('')}</ul></details>`:''}
        <div class="reading-step"><p class="step-caption">${e(step.checkpointHint||'Guida del percorso')}</p><h2>${e(step.title)}</h2><p>${e(step.why||'Segui le istruzioni in ordine prima di passare alla tappa seguente.')}</p></div>
        ${blocks(section)}
        ${index===steps.length-1?finishPanel(r):`<div class="step-next"><span>Hai consultato questo passaggio?</span>${btn(e(step.nextLabel||'Vai al passo successivo')+' →','journey','data-step="'+e(steps[index+1].id)+'"','primary')}<small>Il pulsante cambia pagina; non segna il gioco come completato.</small></div>`}
      </div><aside class="step-nav"><h3>Il percorso</h3><ol>${steps.map((s,i)=>`<li><button class="${index===i?'active':''}" data-action="journey" data-step="${e(s.id)}" ${index===i?'aria-current="step"':''}><span>${i+1}</span><div>${e(s.title)}</div></button></li>`).join('')}</ol>${btn('Schede illustrate','route-tab','data-value="schede"')}</aside></div>`;
  }
  function finishPanel(r){return `<article class="panel route-finish"><p class="step-caption">Quando hai visto il finale</p><h2>${e(r.reload.label)}</h2><p>${e(r.reload.when)}</p><p>${e(r.reload.note)}</p>${btn(c.state.endings[r.id]?'✓ Finale segnato come visto':'Segna il finale come visto','ending-done','data-ending="'+r.id+'"','primary')}</article>`;}
  function fusionView(){
    const target=DTarget(),different=c.ui.fusionTarget!==target.name;
    return `<div class="page-intro"><h2>Trova una ricetta per la richiesta</h2><p>Scegli il rango di Margaret. Le ricette indicano chi deve avere l’abilità e a quale livello. Per i passaggi consigliati usa la scheda Nove richieste.</p></div>
      <article class="panel fusion-main"><label class="field-label" for="fusion-request">1. Quale richiesta vuoi soddisfare?</label><select id="fusion-request">${c.D.fusion.targets.map(t=>`<option value="${t.name}" ${t.name===c.ui.fusionRequest?'selected':''}>Rango ${t.rank} · ${e(t.name)} con ${e(t.skill)}</option>`).join('')}</select>
      <div class="fusion-goal"><span>Risultato richiesto</span><strong>${e(target.name)} <span>con</span> ${e(target.skill)}</strong><small>Livello base ${target.level} per una nuova fusione. Una versione già registrata può essere evocata dal Compendium NG+.</small></div>
      ${different?`<div class="ingredient-context"><strong>Ora stai cercando come creare ${e(c.ui.fusionTarget)}.</strong><p>È un ingrediente intermedio. La richiesta finale resta ${e(target.name)} con ${e(target.skill)}.</p>${btn('Torna alla richiesta finale','fusion-return','','primary')}</div>`:''}
      <label class="check-label"><input id="fusion-donor" type="checkbox" ${c.ui.fusionDonor?'checked':''}> Preferisci ingredienti che apprendono l’abilità richiesta</label>
      <p class="field-help">Le fusioni speciali restano visibili: la loro abilità può richiedere una catena intermedia.</p>
      <details class="disclosure-card fusion-advanced" ${different?'open':''}><summary>2. Modifica ingredienti, livelli o tipo di fusione</summary>
        <div class="fusion-controls"><label>Persona da creare<select id="fusion-target">${c.engine.names.map(n=>`<option value="${n}" ${n===c.ui.fusionTarget?'selected':''}>${e(n)} · livello base ${c.engine.dem[n].lvl}</option>`).join('')}</select></label><label>Tipo di fusione<select id="fusion-kind">${[['all','Tutti i tipi'],['normal','Normale · 2 ingredienti'],['triple','Triangolare · 3 ingredienti'],['special','Speciale · ingredienti fissi']].map(([id,t])=>`<option value="${id}" ${c.ui.fusionKind===id?'selected':''}>${t}</option>`).join('')}</select></label><label>Deve contenere<input id="fusion-search" type="search" value="${rawEsc(c.ui.fusionSearch)}" placeholder="Nome dell’ingrediente"></label></div>
        <details class="disclosure-card"><summary>Livelli attuali delle tue Persona</summary><p class="field-help">Modifica solo le Persona che sono salite di livello. Il loro ordine può cambiare il risultato di una fusione triangolare. Questi valori appartengono al ramo del diario selezionato.</p><input type="search" id="level-search" placeholder="Cerca una Persona da modificare…"><div id="level-list" class="level-list"></div>${btn('Ripristina i livelli base','reset-levels')}</details>
        ${btn('Ricalcola con questi valori','calculate-fusion','','primary')}
      </details><p id="fusion-info" class="field-help" role="status">Calcolo delle ricette…</p></article>
      <div class="content-header"><div><h2>${different?'Ricette dell’ingrediente':'Ricette disponibili'}</h2><p class="field-help">Clicca il nome di un ingrediente per scoprire come crearlo. Controlla sempre risultato e abilità nella preview del gioco.</p></div></div>
      <div id="fusion-results"></div><div class="pager">${btn('← Precedenti','fusion-prev')}<span id="fusion-count"></span>${btn('Successive →','fusion-next')}</div>`;
  }
  function DTarget(){return c.D.fusion.targets.find(t=>t.name===c.ui.fusionRequest);}
  return {shell,home,routeView,fusionView};
}

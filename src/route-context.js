/**
 * Adattamento esclusivamente editoriale delle sezioni condivise al ramo aperto.
 * Non modifica guide_content.json, il modello dei finali o l'oggetto ricevuto.
 * Le risposte EN e le conseguenze provengono dai dati di ricerca già verificati.
 * sourceBlockIndex conserva l'identità originaria per le checklist dopo i filtri.
 */

const ROUTES = new Set(['bad1', 'bad2', 'bad3', 'complice', 'normal', 'true', 'golden']);

function clone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}

function routeId(route) {
  const id = typeof route === 'string' ? route : route?.id ?? route?.researchId;
  return id === 'accomplice' ? 'complice' : id;
}

function hospitalForBadEnding(section, id, seen = true) {
  const number = id === 'bad1' ? 1 : 2;
  const prefix = `Bad ${number}`;
  const outcome = section.blocks.find(block => block.label === `${prefix} • già visto`);
  const opening = section.blocks.filter(block => ['Prima della scena', 'Che cosa sta accadendo', 'Dove inizia la sequenza'].includes(block.label));
  for (const block of opening) {
    if (block.label === 'Che cosa sta accadendo') {
      block.text = 'Dopo la crisi di Nanako, il gruppo affronta Namatame in ospedale. Yosuke propone di gettarlo nella TV. Qui stai consultando un esito già visto: le istruzioni sotto ripetono soltanto questo ramo.';
    }
    if (block.label === 'Dove inizia la sequenza') {
      block.label = 'Prima risposta libera';
      block.text = block.text.split(' La sequenza vincolante')[0];
    }
  }
  const choices = id === 'bad1'
    ? [
      { en: 'Push the bastard in.', it: 'Buttate dentro quel bastardo.', text: 'Quando Yosuke chiede che cosa fare, scegli di gettare Namatame nella TV.' },
      { en: 'Do it already.', it: 'Fatelo e basta.', text: 'Conferma la decisione di gettarlo nella TV.' },
    ]
    : [
      { en: 'Wait a second here...', it: 'Aspettate un momento...', text: 'Ferma la decisione di gettare Namatame nella TV.' },
      { en: 'Leave him for the police.', it: 'Lasciamolo alla polizia.', text: 'Interrompi la deduzione e consegna Namatame alla polizia.' },
    ];
  section.blocks = [
    ...opening,
    ...choices.map((choice, index) => ({ label: `${prefix} • risposta ${index + 1}`, kind: 'info', ...choice })),
    {
      ...(outcome ?? {}), label: `${prefix} • già visto`, kind: 'done',
      text: id === 'bad1'
        ? 'Namatame muore e Nanako non torna. Questo è il Bad Ending 1 già completato.'
        : 'Namatame viene risparmiato, Nanako si salva e l’indagine si ferma. È il Bad Ending 2 coerente con il tuo racconto, distinto dal Normal/Good Ending.',
    },
    { label: 'FINALE COMPLETATO → RICARICA A', kind: 'save', text: 'Dopo il finale, ricarica A, slot 04, se vuoi riprendere dal bivio. Questo esito è già visto: non è una nuova priorità della run.' },
  ];
  section.kicker = `BAD ENDING ${number} • GIÀ VISTO • SAVE A`;
  if(!seen){
    for(const b of section.blocks){
      if(b.label?.includes('già visto'))b.label=b.label.replace('già visto','esito');
      if(b.text)b.text=b.text.replace('Qui stai consultando un esito già visto: le istruzioni sotto ripetono soltanto questo ramo.','Le istruzioni sotto seguono soltanto questo ramo.').replace(' già completato.','.').replace(' coerente con il tuo racconto','').replace(' Questo esito è già visto: non è una nuova priorità della run.','');
    }
    section.kicker=section.kicker.replace('GIÀ VISTO','PERCORSO');
  }
  return section;
}

/** @param {object} section Sezione originale di guide_content.
 *  @param {string|object} route ID oppure ending card. Assente/sconosciuto = vista generale.
 *  @returns {object} Copia indipendente della sezione, con soli adattamenti di presentazione.
 */
export function contextSection(section, route) {
  const output = clone(section);
  if (!output || !Array.isArray(output.blocks)) return output;
  const id = routeId(route);
  if (!ROUTES.has(id)) return output;

  output.blocks = output.blocks.map((block, index) => ({ ...block, sourceBlockIndex: block.sourceBlockIndex ?? index }));

  if (output.id === '03_dicembre') {
    if (id === 'bad1' || id === 'bad2') return hospitalForBadEnding(output, id, typeof route==='object' ? route.seen!==false : true);
    output.blocks = output.blocks.filter(block => !/^Bad [12] • già visto/.test(block.label ?? ''));
  }

  if (output.id === '05_dicembre') {
    // Bad 1/2 terminano già il 3 dicembre: non inventare per loro un ramo del 5.
    const branch = id === 'bad3' ? 'A' : id === 'complice' ? 'B' : ['normal', 'true', 'golden'].includes(id) ? 'C' : null;
    if (branch) {
      output.blocks = output.blocks.filter(block => {
        if (block.label === 'Le tre frecce') return false;
        if (id === 'bad3' && block.label === 'Il nome corretto') return false;
        const match = /^RAMO ([ABC])\b/.exec(block.label ?? '');
        return !match || match[1] === branch;
      });
      if (id === 'bad3') {
        const target = output.blocks.find(block => block.label?.startsWith('RAMO A'));
        if (target) target.text = 'Non scegliere Tohru Adachi: seleziona un nome diverso per ciascuno dei tre tentativi. Una sola accusa sbagliata non basta. Esaurite tutte e tre le possibilità, attendi il finale e i titoli, quindi RICARICA B, slot 05.';
      }
      output.kicker = `${id === 'bad3' ? 'BAD ENDING 3' : id === 'complice' ? 'COMPLICE' : 'STORIA PRINCIPALE'} • SAVE B`;
    }
  }

  if (output.id === '02_gennaio' && ['golden', 'true', 'normal'].includes(id)) {
    const golden = id === 'golden';
    output.blocks = output.blocks.filter(block => golden
      ? !block.label?.startsWith('RAMO TEMPORANEO') && !['Non riattivare la ricerca', 'Perché Marie MAX non impedisce True'].includes(block.label)
      : !block.label?.startsWith('RAMO FINALE'));
    output.kicker = golden ? 'ACCETTA LA RICERCA MARIE • SAVE C' : 'RAMO TEMPORANEO NORMAL / TRUE • SAVE C';
    for (const block of output.blocks) {
      if (block.label === 'Inizio dialogo') {
        block.text = block.text.replace('poi seguire il ramo desiderato.', golden ? 'poi segui le domande e accetta la ricerca di Marie.' : 'poi segui le domande e rifiuta la ricerca sul ramo temporaneo.');
      }
      if (block.label === 'Trascrizione e verifica') {
        block.text = golden
          ? 'La scelta per accettare la ricerca è la prima opzione. Il testo inglese è verificato nei messaggi estratti di Golden, E441_500A.bf, SEL_013, archivio Mysh; fonti E06 ed E15.'
          : 'La scelta per rifiutare la ricerca è la seconda opzione. Effetto confermato da GameFAQs e Atwiki; testo inglese verificato nei messaggi estratti di Golden, E441_500A.bf, SEL_013, archivio Mysh.';
      }
      if (!golden && block.label === 'Condizione comune') {
        block.label = 'Condizione del piano con tutti gli ending';
        block.text = 'Nel checkpoint C del piano consigliato Marie è già al rango 10, prima di chiudere Magatsu: serve a recuperare poi Golden dallo stesso save. Marie MAX non è un requisito del Normal o del True senza epilogo.';
      }
    }
  }

  if (output.id === 'true' && id === 'golden') {
    output.title = 'Golden Ending • l’indagine conclusiva';
    output.color = 'golden';
    output.art = 'golden';
    output.kicker = 'RAMO GOLDEN • 20 MARZO • D-G > F';
    for (const block of output.blocks) {
      if (block.label === 'Riparti da D-T') {
        block.label = 'Riparti da D-G • SLOT 08';
        block.text = 'Sei sul ramo Golden: Marie è stata salvata e Hollow Forest è completata. Il 20 marzo usa D-G, slot 08, prima dell’ultimo saluto. Completa tutte le tappe dell’indagine e il dungeon finale: Golden comprende l’intera conclusione True.';
      }
      if (block.label?.startsWith('TRUE COMPLETATO')) {
        block.label = 'GOLDEN COMPLETATO • CONSERVA IL RAMO';
        block.text = 'Guarda la conclusione True, i titoli e l’epilogo estivo aggiuntivo. Conserva i dati completati Golden su CLEAR 12 o un nuovo slot libero, mantenendo D-G/F per riprendere prima del boss. Nessuna ricarica a C è richiesta.';
      }
    }
  }

  if (['true', 'golden'].includes(output.id) && ['true', 'golden'].includes(id)) {
    for (const block of output.blocks) {
      if (block.label === 'Attenzione' && block.text?.startsWith('Yes chiude il ramo con Normal.')) {
        block.text = `Yes chiude il ramo con Normal. Se lo scegli per errore, ricarica ${id === 'golden' ? 'D-G, slot 08, sul ramo Golden' : 'D-T, slot 07, sul ramo senza epilogo Golden'}.`;
      }
    }
  }
  return output;
}

export default contextSection;

/**
 * Etichette e spiegazioni del lettore guidato.
 * L'ordine coincide con ENDING_CARDS.sectionIds in content-map.js.
 * Questi testi orientano la lettura: le istruzioni complete e i dialoghi restano
 * nei blocchi di guide_content, adattati al ramo tramite contextSection.
 */

export const routeChapterLabels = {
  bad1: {
    '03_dicembre': 'Segui il ramo Bad Ending 1',
  },
  bad2: {
    '03_dicembre': 'Segui il ramo Bad Ending 2',
  },
  bad3: {
    '03_dicembre': 'Supera il bivio in ospedale',
    '05_dicembre': 'Sbaglia tutte e tre le accuse',
  },
  complice: {
    adachi: 'Verifica il rango 6 di Adachi',
    '03_dicembre': 'Supera il bivio in ospedale',
    '05_dicembre': 'Identifica Adachi e proteggilo',
    complice: 'Completa l’alleanza e brucia la lettera',
  },
  normal: {
    '05_dicembre': 'Indica Adachi agli amici',
    dicembre: 'Completa il dungeon di dicembre',
    '02_gennaio': 'Conserva il bivio per Golden',
    saluti: 'Salva prima di completare i saluti',
    normal: 'Torna a casa e guarda il finale',
  },
  true: {
    '02_gennaio': 'Verifica il ramo senza ricerca Marie',
    saluti: 'Riprendi i saluti dal checkpoint D-T',
    true: 'Scopri la verità e affronta Izanami',
  },
  golden: {
    marie: 'Completa il legame con Marie',
    dicembre: 'Proteggi dicembre e completa Magatsu',
    '02_gennaio': 'Accetta la ricerca di Marie',
    golden: 'Salva Marie in Hollow Forest',
    saluti: 'Salva D-G e completa i saluti',
    true: 'Completa l’indagine e guarda l’epilogo',
  },
};

const step = (routeId, sectionId, why, checkpointHint, nextLabel, blockIndices) => ({
  id: `${routeId}-${sectionId}`,
  title: routeChapterLabels[routeId][sectionId],
  sectionId,
  why,
  checkpointHint,
  nextLabel,
  ...(blockIndices ? { blockIndices } : {}),
});

export const routeGuideSteps = {
  bad1: [
    step('bad1', '03_dicembre',
      'Questo ramo porta al Bad Ending 1. Se lo hai già visto, puoi lasciarlo completato nel diario e dedicarti agli ending mancanti.',
      'A, slot 04. Dopo il finale ricarica A per tornare al bivio.',
      'Torna al riepilogo dei finali'),
  ],
  bad2: [
    step('bad2', '03_dicembre',
      'Namatame viene risparmiato, Nanako resta viva e l’indagine si interrompe. Questa pagina distingue il Bad Ending 2 dal Normal/Good Ending.',
      'A, slot 04. Dopo il finale ricarica A per tornare al bivio.',
      'Torna al riepilogo dei finali'),
  ],
  bad3: [
    step('bad3', '03_dicembre',
      'Per arrivare alla deduzione del 5 dicembre devi completare tutte e sei le risposte corrette dell’ospedale. Se hai già B pronto, questo passaggio è un controllo dei requisiti.',
      'A, slot 04: prompt dopo l’esame, prima della sequenza. Appena puoi indagare il 5 dicembre, crea B.',
      'Continua: le tre accuse del 5 dicembre'),
    step('bad3', '05_dicembre',
      'Questo ramo termina quando esaurisci i tre tentativi con nomi diversi da Tohru Adachi. Una sola accusa sbagliata non basta.',
      'B, slot 05: salva alla farfalla prima dell’ultimo NPC. Dopo finale e titoli, ricarica B.',
      'Torna al riepilogo: ricarica B nel gioco'),
  ],
  complice: [
    step('complice', 'adachi',
      'Il finale Complice richiede Adachi / Jester al rango 6 entro il 1° novembre. Controlla questo requisito prima di seguire il bivio di dicembre.',
      'Conserva la progressione nel LIVE, slot 11. B deve appartenere a una partita con il requisito di Adachi già soddisfatto.',
      'Continua: il bivio in ospedale'),
    step('complice', '03_dicembre',
      'Le sei risposte corrette mantengono aperta l’indagine e permettono di arrivare alla scelta su Adachi.',
      'A, slot 04, prima della lunga scena. Se la deduzione si interrompe, ricarica A.',
      'Continua: identifica e proteggi Adachi'),
    step('complice', '05_dicembre',
      'Seleziona Tohru Adachi e conferma entrambe le decisioni di proteggerlo. Questo è il bivio che avvia il finale Complice.',
      'Crea o ricarica B, slot 05, prima di terminare l’indagine. Mantienilo per riprendere poi la storia principale.',
      'Continua: l’incontro conclusivo con Adachi'),
    step('complice', 'complice',
      'Segui l’incontro del 20 marzo, le risposte dell’alleanza e la decisione sulla lettera. Attendi anche la scena aggiuntiva dopo i titoli.',
      'Dopo il finale ricarica B, slot 05. Da lì comunica agli amici i sospetti su Adachi per continuare verso gli altri ending.',
      'Torna al riepilogo: ricarica B nel gioco'),
  ],
  normal: [
    step('normal', '05_dicembre',
      'Riparti dalla deduzione raggiunta dopo l’ospedale: identifica Adachi e informa gli amici. È la linea principale che conduce a marzo.',
      'Ricarica B, slot 05, dopo Complice. Non scegliere di proteggere Adachi su questo ramo.',
      'Continua: il dungeon di dicembre'),
    step('normal', 'dicembre',
      'Completa Magatsu Inaba seguendo le indicazioni sul calendario. Il piano protegge anche Marie e le attività necessarie per recuperare Golden in seguito.',
      'Conserva B e usa LIVE, slot 11, per avanzare. Prima della conversazione del 2 gennaio crea C.',
      'Continua: conserva il bivio del 2 gennaio'),
    step('normal', '02_gennaio',
      'Nel piano con tutti gli ending, tieni C intatto e rifiuta la ricerca sul ramo temporaneo Normal/True. Marie non è un requisito del Normal Ending.',
      'C, slot 06: farfalla nel distretto commerciale prima di entrare nella Velvet Room. Servirà per ripartire verso Golden dopo True.',
      'Continua: il salvataggio e i saluti del 20 marzo'),
    step('normal', 'saluti',
      'Saluta i personaggi dei Social Link già al massimo. Il checkpoint prima dell’ultimo saluto ti permetterà di vedere Normal e poi riprendere verso True.',
      'D-T, slot 07: salva alla farfalla prima dell’ultimo saluto e della scena Dojima/Nanako.',
      'Continua: torna a casa per il Normal Ending'),
    step('normal', 'normal',
      'Accetta di tornare a casa dopo i saluti e guarda il finale. La scheda completa riunisce anche i passaggi precedenti per permetterti di ricontrollarli.',
      'Dopo Normal ricarica D-T, slot 07. Per True, al termine dei saluti rifiuterai di tornare a casa.',
      'Torna al riepilogo: ricarica D-T nel gioco'),
  ],
  true: [
    step('true', '02_gennaio',
      'Controlla che il ramo abbia rifiutato la ricerca di Marie: così vedrai True senza epilogo Golden. Se riparti da D-T dopo Normal, questa scelta è già stata effettuata.',
      'Conserva C, slot 06, per il successivo ramo Golden. Per continuare subito dopo Normal ricarica D-T, slot 07.',
      'Continua: riprendi i saluti dal 20 marzo'),
    step('true', 'saluti',
      'Ripeti i saluti necessari dopo il caricamento di D-T. Non devi massimizzare altri Social Link: servono i saluti di quelli già al massimo.',
      'Mantieni D-T, slot 07, prima dell’ultimo saluto. Nel passaggio successivo rifiuta il ritorno a casa.',
      'Continua: l’indagine conclusiva'),
    step('true', 'true',
      'Segui nell’ordine Junes, Dojima, Velvet Room, distributore e dungeon finale. Tutte le risposte, le condizioni e i controlli del boss restano nella pagina.',
      'Usa F, slot 10, per la preparazione finale senza sostituire C o D-T. Dopo True ricarica C, slot 06, per iniziare Golden.',
      'Torna al riepilogo: ricarica C nel gioco'),
  ],
  golden: [
    step('golden', 'marie',
      'Verifica Marie al rango 10 prima di chiudere il dungeon di dicembre. Se riparti dal C preparato nel piano, questo requisito è già soddisfatto.',
      'Il checkpoint C deve provenire da una partita con Marie MAX. Se manca il requisito, serve un salvataggio precedente alla chiusura di Magatsu.',
      'Continua: proteggi il calendario di dicembre'),
    step('golden', 'dicembre',
      'Il completamento del dungeon fa avanzare il calendario. Usa questa tappa per controllare Marie e le attività prima della chiusura del mese; da C è un controllo retrospettivo.',
      'Conserva C, slot 06, prima della conversazione con Margaret del 2 gennaio. Non sovrascriverlo con i dati di completamento True.',
      'Continua: accetta la ricerca di Marie'),
    step('golden', '02_gennaio',
      'Da C accetta con Margaret di cercare Marie. Le quest e gli oggetti ottenuti dopo C sul ramo temporaneo vanno recuperati anche su questo ramo per conservarli.',
      'Ricarica C, slot 06, dopo True. Durante la conversazione segui il ramo che accetta la ricerca.',
      'Continua: Hollow Forest e il salvataggio di Marie'),
    step('golden', 'golden',
      'Prosegui verso la gita e completa Hollow Forest. Le regole su equipaggiamento, SP, ritorni e boss sono necessarie per prepararti; poi resta da completare la conclusione True.',
      'E-pre, slot 13, il 10 febbraio sera; E, slot 09, alla farfalla dell’hub il 13 febbraio. Mantieni separato C.',
      'Continua: prepara D-G e i saluti del 20 marzo',
      [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]),
    step('golden', 'saluti',
      'Con Hollow Forest completata, prepara il salvataggio del ramo Golden e saluta i Social Link già al massimo. Dopo i saluti dovrai proseguire l’indagine.',
      'D-G, slot 08: salva prima dell’ultimo saluto e della scena Dojima/Nanako. Questo è il checkpoint del ramo con Marie salvata.',
      'Continua: l’indagine finale e l’epilogo Golden'),
    step('golden', 'true',
      'Completa tutte le tappe dell’indagine True e sconfiggi Izanami. Su questo ramo la conclusione prosegue nell’epilogo Golden: attendi anche ciò che segue i titoli.',
      'Mantieni D-G e F. Usa CLEAR, slot 12 o un nuovo slot libero, per i dati completati. Dopo Golden non occorre ricaricare C.',
      'Torna al riepilogo: conserva il ramo Golden'),
  ],
};

// Il lettore segue una sequenza: i riepiloghi dei capitoli autonomi non devono
// chiedere di ricaricare B dopo averne già completato il bivio.
const orderedStageSelections = {
  'golden-golden': Array.from({length:23}, (_,i)=>i+6),
  'complice-complice': [2,3,4,5,6,7,8,9,10,11,12],
  'normal-normal': [9,4,5,6,7,8,10],
  'normal-saluti': [0,1,2,3,4,5,6,7],
  'true-saluti': [0,1,2,3,4,5,6,7],
  'golden-saluti': [0,1,2,3,4,5,6,7],
  'true-true': Array.from({length:39}, (_,i)=>i+2),
  'golden-true': Array.from({length:39}, (_,i)=>i+2),
};
for (const steps of Object.values(routeGuideSteps)) for (const stage of steps) {
  if (orderedStageSelections[stage.id]) stage.blockIndices = orderedStageSelections[stage.id];
}

export const profileHelpCopy = {
  label: 'Ramo del diario',
  short: 'Scegli quali spunte e appunti consultare. Il salvataggio del gioco non cambia.',
  explanation: 'Un ramo del diario raccoglie quest, checklist e appunti per una parte della tua run. Cambiarlo nell’app non carica uno slot di Persona 4 Golden e non modifica i file Steam.',
  createTitle: 'Crea un ramo del diario',
  createAction: 'Copia le spunte in un nuovo ramo',
  createExplanation: 'Il nuovo ramo parte da una copia del diario attuale. Crealo quando separi i tuoi salvataggi nel gioco, così puoi tenere distinti i progressi del ramo temporaneo e di quello Golden.',
  afterReload: 'Dopo aver ricaricato uno slot nel gioco, seleziona il ramo del diario corrispondente e controlla le spunte. L’app non rileva automaticamente ciò che quel salvataggio contiene.',
  copiedProgress: 'Copiare il diario non trasferisce quest, oggetti o progressi fra salvataggi del gioco. Se hai copiato spunte maturate dopo il checkpoint ricaricato, correggile.',
  globalEndings: 'I finali segnati come visti restano nello storico comune. Quest, checklist e appunti appartengono invece al ramo del diario selezionato.',
};

export const checkpointHelpCopy = {
  label: 'Checkpoint di gioco',
  markLabel: 'Ho creato questo salvataggio nel gioco',
  short: 'Prima salva nel gioco; poi annotalo qui.',
  explanation: 'La spunta è una tua conferma manuale. L’app non crea, copia, verifica o carica il salvataggio Steam indicato.',
  beforeMarking: 'Apri il menu di salvataggio del gioco nel momento indicato, controlla lo slot e salva. Solo dopo conferma il checkpoint nel diario.',
  beforeReload: 'Per ricaricare usa Load nel gioco e controlla data e slot. Selezionare un checkpoint nell’app apre soltanto le istruzioni.',
  progressLoss: 'Caricare un vecchio salvataggio riporta anche quest, oggetti e progressi a quel momento. Le spunte del diario non fanno avanzare il gioco.',
  protectedSlots: 'Conserva gli slot originali 01, 02, 03 e 99. Tieni i dati di completamento separati dai checkpoint prima dei bivi.',
};

export const journeyHelpCopy = {
  readerProgress: 'La posizione nel percorso indica dove stai leggendo, non ciò che hai già fatto nel gioco.',
  nextAction: 'Il pulsante Continua apre la tappa seguente della guida. Esegui prima nel gioco le azioni che ti servono.',
  fullInstructions: 'Ogni tappa conserva le istruzioni complete. Apri Scelte rapide per ritrovare le risposte durante un dialogo.',
  prerequisiteReview: 'Se hai già il checkpoint richiesto, le tappe precedenti servono a controllare i requisiti: non devi rigiocarle solo per avanzare nel lettore.',
  alreadySeen: 'Questo finale è già segnato come visto. Puoi consultarlo senza ripeterlo.',
};

/**
 * Contratto degli indici: sono quelli dell'array blocks ORIGINALE, prima dei filtri.
 * Il renderer deve conservare sourceBlockIndex quando seleziona o adatta i blocchi.
 * Golden 0–5 è già coperto dai requisiti Marie e dalla tappa del 2 gennaio.
 * Golden 29–69 non è eliminato dalla guida: l'indagine duplicata vive nella tappa
 * true adattata con contextSection(section, 'golden'); D-G, epilogo e CLEAR 12
 * restano lì. La sezione originale non contiene un blocco separato San Valentino.
 */
export const journeySourceSelections = {
  'golden-golden': {
    sectionId: 'golden',
    indexBasis: 'original-blocks',
    firstIndex: 6,
    firstLabel: 'Gennaio • conserva qui i progressi',
    lastIndex: 28,
    lastLabel: 'Dopo Hollow Forest',
    nextIndex: 29,
    nextLabel: 'Prosegui sul ramo Golden',
    duplicatedConclusion: {
      sourceSectionId: 'golden', sourceIndices: [29,68,69],
      destinationStepId: 'golden-true', destinationSectionId: 'true', contextRouteId: 'golden',
      requiredContextLabels: ['Riparti da D-G • SLOT 08', 'GOLDEN COMPLETATO • CONSERVA IL RAMO'],
      note: 'I blocchi 30–67 ripetono le tappe True; 29 e 68 sono coperti dagli adattamenti Golden di apertura e chiusura. Il 69 conserva le fonti della stessa indagine.',
    },
  },
};

export const journalHelp = {intro: profileHelpCopy.explanation, steps: [profileHelpCopy.createExplanation, profileHelpCopy.afterReload, profileHelpCopy.globalEndings]};
export default { routeChapterLabels, routeGuideSteps, profileHelpCopy, checkpointHelpCopy, journeyHelpCopy, journeySourceSelections };

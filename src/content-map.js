/**
 * Mappa editoriale dell'app: riferimenti ai contenuti già verificati, non nuove regole.
 * Fonti locali: Persona4Golden_Guide/data/{guide_content,endings_research,save_plan,
 * preparation,quests}.json. Le traduzioni italiane dei dialoghi sono redazionali.
 * artFile è il nome dell'asset esistente; il renderer decide la sua URL pubblica.
 */

export const CONTENT_VERSION = '2026-11-08';

export const ROUTE_ORDER = ['bad3', 'complice', 'normal', 'true', 'golden'];
export const ALL_ENDING_ORDER = ['bad1', 'bad2', ...ROUTE_ORDER];

export const CHECKPOINT_SUMMARIES = {
  A: { id: 'A', slot: 4, color: '#8B2440', label: '3 dicembre · prima dell’ospedale', when: 'Accetta il prompt dopo l’esame, prima della lunga sequenza narrativa.', where: 'Prompt di salvataggio del gioco', loss: 'Ricaricare elimina dal ramo attivo tutti i progressi successivi al salvataggio del 3 dicembre.' },
  B: { id: 'B', slot: 5, color: '#E44335', label: '5 dicembre · prima della deduzione', when: 'Salva appena controlli Yu durante l’indagine, prima dell’ultimo NPC richiesto.', where: 'Farfalla blu nel distretto commerciale', loss: 'Ricaricare elimina dal ramo attivo i progressi successivi a questo salvataggio.' },
  C: { id: 'C', slot: 6, color: '#9C69CB', label: '2 gennaio · prima di Margaret', when: 'Salva di giorno prima della conversazione con Margaret nella Velvet Room.', where: 'Farfalla blu, Shopping District South', loss: 'Dopo True torni qui: gennaio, febbraio e marzo del ramo temporaneo vanno ripetuti sul ramo Golden, comprese le quest che vuoi conservare.' },
  'D-T': { id: 'D-T', slot: 7, color: '#4389EF', label: '20 marzo · Normal / True', when: 'Nel ramo senza ricerca Marie, salva prima dell’ultimo saluto e della scena Dojima/Nanako.', where: 'Farfalla blu nel distretto commerciale', loss: 'Ricaricare ripete i saluti e la preparazione successivi al salvataggio.' },
  'D-G': { id: 'D-G', slot: 8, color: '#E9BF35', label: '20 marzo · Golden', when: 'Nel ramo con Hollow Forest completata, salva prima dell’ultimo saluto e della scena Dojima/Nanako.', where: 'Farfalla blu nel distretto commerciale', loss: 'Ricaricare elimina dal ramo attivo i progressi successivi del 20 marzo.' },
  E: { id: 'E', slot: 9, color: '#DCB45C', label: '13 febbraio · Hollow Forest', when: 'Salva nell’hub prima di esplorare Hollow Forest.', where: 'Farfalla blu a Grave of Hollow Memories', loss: 'Ricaricare ripete i progressi successivi nella foresta. E è un backup del dungeon; il bivio True/Golden resta C.' },
  'E-pre': { id: 'E-pre', slot: 13, color: '#DCB45C', label: '10 febbraio sera · prima della gita', when: 'Crea il backup prima della gita.', where: 'Calendario a Casa Dojima', loss: 'Ricaricare ripete gli eventi successivi al 10 febbraio. Il bivio True/Golden resta C.' },
  F: { id: 'F', slot: 10, color: '#34A9C6', label: '20 marzo · preparazione finale', when: 'Dopo l’indagine e prima del dungeon; conserva poi un backup prima del boss tornando all’ingresso.', where: 'Farfalla nel distretto commerciale o nell’hub TV', loss: 'Ricaricare ripete esplorazione e combattimenti successivi. F non sostituisce D-T o D-G.' },
  LIVE: { id: 'LIVE', slot: 11, color: '#FFFFFF', label: 'Progressione ordinaria', when: 'Usa i punti di salvataggio disponibili sul ramo attivo.', where: 'Calendario o farfalla blu', loss: 'Si perdono i progressi non salvati.' },
  CLEAR: { id: 'CLEAR', slot: 12, color: '#D5C661', label: 'Dati di completamento', when: 'Usa il prompt dopo il finale in uno slot separato.', where: 'Prompt finale del gioco', loss: 'Il clear save avvia la successiva NG+ e non sostituisce un checkpoint precedente al finale.' },
};

export const SAVE_POLICY = {
  protectedSlots: [1, 2, 3, 99],
  liveCheckpoint: 'LIVE',
  clearCheckpoint: 'CLEAR',
  endingHistoryScope: 'global',
  questProgressScope: 'save-branch',
  sectionIds: ['salvataggi'],
  notice: 'Ricaricare uno slot precedente non unisce quest, oggetti o progressi dei diversi rami. Eventuali trofei dipendono dall’avvenuta registrazione da parte della piattaforma. Non sovrascrivere i checkpoint con i clear save.',
};

export const ENDING_CARDS = [
  {
    id: 'bad1', researchId: 'bad1', title: 'Bad Ending 1', subtitle: 'Namatame nella TV',
    color: '#711B28', art: 'bad', artFile: 'bad.png', completed: true, priority: null,
    characters: ['Namatame', 'Nanako', 'Yu'], decisiveDate: '3 dicembre',
    intro: 'Namatame viene gettato nella TV e Nanako resta morta. Questo ramo termina durante gli eventi del 3 dicembre.',
    prerequisites: ['Arrivare alla scena dell’ospedale del 3 dicembre.'],
    sectionIds: ['03_dicembre'], checkpointIds: ['A'], startCheckpoint: 'A',
    reload: { checkpointId: 'A', label: 'RICARICA A', when: 'Dopo aver visto questo finale.', note: 'Segna il finale come visto nel diario; poi ricarica A per proseguire verso gli altri esiti.' },
  },
  {
    id: 'bad2', researchId: 'bad2', title: 'Bad Ending 2', subtitle: 'Namatame risparmiato, indagine interrotta',
    color: '#903145', art: 'bad', artFile: 'bad.png', completed: true, priority: null,
    characters: ['Namatame', 'Nanako', 'Yu'], decisiveDate: '3 dicembre',
    intro: 'Namatame viene risparmiato, Nanako si riprende e l’indagine si interrompe. Questo esito è distinto dal Normal/Good Ending.',
    prerequisites: ['Arrivare alla scena dell’ospedale del 3 dicembre.'],
    sectionIds: ['03_dicembre'], checkpointIds: ['A'], startCheckpoint: 'A',
    reload: { checkpointId: 'A', label: 'RICARICA A', when: 'Dopo aver visto questo finale.', note: 'Per proseguire verso gli altri esiti serve l’intera sequenza corretta dell’ospedale.' },
  },
  {
    id: 'bad3', researchId: 'bad3', title: 'Bad Ending 3', subtitle: 'Tre accuse errate',
    color: '#B43A49', art: 'bad', artFile: 'bad.png', completed: false, priority: 1,
    characters: ['Yu', 'Nanako', 'Namatame'], decisiveDate: '5 dicembre',
    intro: 'Completa la deduzione corretta del 3 dicembre; il 5 dicembre esaurisci tutti e tre i tentativi scegliendo un sospettato diverso da Tohru Adachi.',
    prerequisites: ['Superare correttamente le sei scelte obbligatorie del 3 dicembre.', 'Creare B prima di completare i colloqui dell’indagine del 5 dicembre.'],
    sectionIds: ['03_dicembre', '05_dicembre'], checkpointIds: ['A', 'B'], startCheckpoint: 'B',
    reload: { checkpointId: 'B', label: 'RICARICA B', when: 'Dopo aver visto il finale e i titoli.', note: 'Da B puoi passare al ramo Complice o alla linea principale.' },
    terminologyNote: 'Qui Bad 3 indica il fallimento delle accuse del 5 dicembre. Alcune guide usano Bad 3 per Complice o accorpano questa variante ad altri esiti negativi.',
  },
  {
    id: 'complice', researchId: 'accomplice', title: 'Accomplice Ending', subtitle: 'Il finale Complice di Adachi',
    color: '#E3242B', art: 'accomplice', artFile: 'accomplice.png', completed: false, priority: 2,
    characters: ['Adachi', 'Yu'], decisiveDate: '5 dicembre e 20 marzo',
    intro: 'Identifica Adachi, proteggilo in entrambe le conferme e completa il dialogo conclusivo del 20 marzo fino alla decisione di bruciare la lettera.',
    prerequisites: ['Adachi / Jester al rango 6 entro il 1° novembre.', 'Sequenza corretta all’ospedale il 3 dicembre.', 'Il 5 dicembre selezionare Tohru Adachi e proteggerlo due volte.'],
    sectionIds: ['adachi', '03_dicembre', '05_dicembre', 'complice'], checkpointIds: ['A', 'B'], startCheckpoint: 'B',
    reload: { checkpointId: 'B', label: 'RICARICA B', when: 'Dopo finale, titoli e scena aggiuntiva.', note: 'Riparti dal 5 dicembre e comunica agli amici i sospetti su Adachi per mantenere la linea principale.' },
  },
  {
    id: 'normal', researchId: 'normal', title: 'Normal / Good Ending', subtitle: 'Il ritorno a casa',
    color: '#A6ADB9', art: 'normal', artFile: 'normal.png', completed: false, priority: 3,
    characters: ['Yu', 'Nanako', 'Dojima'], decisiveDate: '20 marzo',
    intro: 'Dopo aver identificato Adachi e completato Magatsu Inaba, arriva al 20 marzo, completa i saluti e accetta di tornare a casa.',
    prerequisites: ['Comunicare agli amici i sospetti su Adachi il 5 dicembre.', 'Completare il dungeon di dicembre.', 'Creare D-T prima dell’ultimo saluto nel piano consigliato. Marie non è un requisito del Normal Ending.'],
    sectionIds: ['05_dicembre', 'dicembre', '02_gennaio', 'saluti', 'normal'], checkpointIds: ['B', 'C', 'D-T'], startCheckpoint: 'B',
    reload: { checkpointId: 'D-T', label: 'RICARICA D-T', when: 'Dopo aver visto il Normal Ending.', note: 'Ripeti la conclusione dei saluti e scegli di non tornare a casa per avviare l’indagine True.' },
    independenceNote: 'Normal è ottenibile anche sul ramo con Marie. Il piano usa D-T per vedere Normal e True consecutivamente senza rifare gennaio fra i due.',
  },
  {
    id: 'true', researchId: 'true', title: 'True Ending', subtitle: 'Senza epilogo Golden',
    color: '#1272E8', art: 'team', artFile: 'team.png', completed: false, priority: 4,
    characters: ['Yu', 'Yosuke', 'Chie', 'Yukiko', 'Kanji', 'Rise', 'Naoto', 'Teddie'], decisiveDate: '2 gennaio e 20 marzo',
    intro: 'Sul ramo temporaneo senza ricerca di Marie, rifiuta di tornare a casa il 20 marzo e segui l’indagine completa fino a Yomotsu Hirasaka e Izanami.',
    prerequisites: ['Linea principale dopo Adachi e Magatsu Inaba.', 'Nel piano di separazione, da C rifiutare la ricerca Marie il 2 gennaio.', 'Il 20 marzo proseguire oltre i saluti con tutte le tappe e le risposte della scheda True.'],
    sectionIds: ['02_gennaio', 'saluti', 'true'], checkpointIds: ['C', 'D-T', 'F'], startCheckpoint: 'D-T',
    reload: { checkpointId: 'C', label: 'RICARICA C', when: 'Dopo aver visto il True Ending senza epilogo Golden.', note: 'Torna al 2 gennaio e accetta la ricerca di Marie. Quest e progressi di gennaio–marzo del ramo temporaneo vanno ripetuti sul ramo Golden per conservarli.' },
  },
  {
    id: 'golden', researchId: 'golden', title: 'Golden Ending', subtitle: 'Marie, Hollow Forest ed epilogo',
    color: '#E7B624', art: 'golden', artFile: 'golden.png', completed: false, priority: 5,
    characters: ['Marie', 'Yu', 'Teddie', 'Investigation Team'], decisiveDate: '2 gennaio, 13 febbraio e 20 marzo',
    intro: 'È il ramo da conservare alla fine della run: ricerca di Marie, Hollow Forest, intera conclusione True e successivo epilogo speciale.',
    prerequisites: ['Marie / Aeon al rango 10 prima di chiudere il dungeon di dicembre; il piano sicuro la completa entro il 21 dicembre.', 'Da C, il 2 gennaio accettare con Margaret di cercare Marie.', 'Completare Hollow Forest il 13 febbraio.', 'Il 20 marzo completare l’indagine True e il dungeon finale; attendere l’epilogo dopo i titoli.'],
    sectionIds: ['marie', 'dicembre', '02_gennaio', 'golden', 'saluti', 'true'], checkpointIds: ['C', 'E-pre', 'E', 'D-G', 'F', 'CLEAR'], startCheckpoint: 'C',
    reload: { checkpointId: null, label: 'CONSERVA IL RAMO GOLDEN', when: 'Dopo il finale e l’epilogo.', note: 'Nessuna ricarica obbligatoria. Mantieni i checkpoint e salva gli eventuali dati di completamento in uno slot separato.' },
  },
];

export const QUEST_SECTION_IDS = Array.from({ length: 69 }, (_, i) => `quest_${String(i + 1).padStart(2, '0')}`);

export const QUEST_PERIOD_GROUPS = [
  { id: 'aprile-giugno', title: 'Aprile–giugno', indexSectionId: 'indice_aprile-giugno', questIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,22,23,24,25,26,28,29,30,19,31,32,33] },
  { id: 'luglio-agosto', title: 'Luglio–agosto', indexSectionId: 'indice_luglio-agosto', questIds: [34,27,35,37,38,40,36,39] },
  { id: 'settembre-ottobre', title: 'Settembre–ottobre', indexSectionId: 'indice_settembre-ottobre', questIds: [41,42,43,44,45,46,48,49,50,51,52,47,53] },
  { id: 'novembre-dicembre', title: 'Novembre–dicembre', indexSectionId: 'indice_novembre-dicembre', questIds: [54,55,56,57,58,59] },
  { id: 'gennaio-febbraio', title: 'Gennaio–febbraio', indexSectionId: 'indice_gennaio-febbraio', questIds: [60,61,62,63,64,65,66,67,68,69] },
].map(group => ({ ...group, sectionIds: [group.indexSectionId, ...group.questIds.map(id => `quest_${String(id).padStart(2, '0')}`)] }));

export const CONTENT_GROUPS = [
  {
    id: 'preparazione', title: 'Preparazione', subtitle: 'Da fare dalla tua data attuale', color: '#F5D928', art: 'team', artFile: 'team.png',
    intro: 'Situazione della run, legenda, priorità dal 22 maggio e linea comune di dicembre.',
    sectionIds: ['copertina', 'legenda', 'adesso', 'dicembre', 'checklist'], dataSources: ['preparation.json'],
  },
  {
    id: 'salvataggi', title: 'Salvataggi', subtitle: 'Checkpoint, slot e ricariche', color: '#9C69CB', art: 'teddie', artFile: 'teddie.png',
    intro: 'Proteggi gli slot originali e tieni separati i checkpoint dai dati di completamento.',
    sectionIds: ['salvataggi'], dataSources: ['save_plan.json'], checkpointIds: Object.keys(CHECKPOINT_SUMMARIES),
  },
  {
    id: 'quest69', title: '69 quest', subtitle: 'Catalogo, periodi e catene', color: '#7150BD', art: 'teddie', artFile: 'teddie.png',
    intro: 'Nessuna quest è presunta accettata o conclusa. Le date di disponibilità sono distinte dalle scadenze; le spunte dell’app sono un registro personale.',
    sectionIds: ['quest_regole', 'quest_current', 'quest_chains', ...QUEST_PERIOD_GROUPS.flatMap(group => group.sectionIds)],
    dataSources: ['quests.json', 'quest_support.json'], questCount: 69, periodGroupIds: QUEST_PERIOD_GROUPS.map(group => group.id),
  },
  {
    id: 'social', title: 'Social Link', subtitle: 'Requisiti e contenuti facoltativi', color: '#E3242B', art: 'accomplice', artFile: 'accomplice.png',
    intro: 'Adachi serve al finale Complice; Marie al Golden. Non è necessario massimizzare tutti i Social Link. Margaret e gli altri requisiti opzionali restano distinti dagli ending.',
    sectionIds: ['adachi', 'marie', 'ngplus'], dataSources: ['preparation.json'],
    externalModules: [{ id: 'margaret', title: 'Margaret MAX · Fusioni', directory: 'Margaret_Fusioni', contentFile: 'data/guide_content.json' }],
  },
  {
    id: 'utility', title: 'Utility', subtitle: 'Pesca, libri, materiali e controlli', color: '#34A9C6', art: 'teddie', artFile: 'teddie.png',
    intro: 'Supporto alle attività: pesca e Guardian, scambi, materiali da conservare, libri mancabili, saluti e contenuti NG+.',
    sectionIds: ['fishing_start', 'fishing_guardians', 'fish_trade', 'material_reserve', 'libri', 'saluti', 'ngplus', 'checklist'],
    dataSources: ['quest_support.json', 'preparation.json'],
  },
  {
    id: 'roadmap', title: 'Master Roadmap', subtitle: 'Tutti e sette gli esiti', color: '#F5D928', art: 'team', artFile: 'team.png',
    intro: 'Bad 1 e Bad 2 già visti; ordine consigliato Bad 3 → Complice → Normal → True → Golden.',
    sectionIds: ['esiti'], dataSources: ['endings_research.json'], endingIds: ALL_ENDING_ORDER,
    note: 'Sette esiti pratici: alcune guide accorpano le varianti negative; Golden estende la conclusione True.',
  },
];

export const ENDING_BY_ID = Object.fromEntries(ENDING_CARDS.map(ending => [ending.id, ending]));
export const GROUP_BY_ID = Object.fromEntries(CONTENT_GROUPS.map(group => [group.id, group]));

export default { version: CONTENT_VERSION, endings: ENDING_CARDS, groups: CONTENT_GROUPS, questPeriods: QUEST_PERIOD_GROUPS, checkpoints: CHECKPOINT_SUMMARIES, routeOrder: ROUTE_ORDER, savePolicy: SAVE_POLICY };

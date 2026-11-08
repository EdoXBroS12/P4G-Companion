# Verifica delle quest — Persona 4 Golden

Ricerca: 8 novembre 2026. Catalogo: 69 ID distinti, numerazione occidentale di **Golden**. I nomi italiani sono traduzioni descrittive redazionali. I nomi inglesi di oggetti e nemici restano riconoscibili nel gioco.

Il file autorevole per l'impaginazione è `data/quests.json`, rigenerabile con `node data/build_quests.cjs`. `data/quest_support.json` contiene procedure di pesca, catene e materiali da riservare. Le quest non sono marcate completate sulla base del solo dungeon di Kanji: il registro del giocatore va controllato.

## Metodo

Confronto delle tabelle di RPG Site, GameFAQs (Hurricanehaon, Uruhara, KADFC e walkthrough recente 81937), Neoseeker, hXcHector e Steam. Le schede individuali della Megami Tensei Wiki aggiungono riscontri di NPC, dipendenze, ricompense e oggetti. Il calendario fotografico Steam è stato usato per risolvere alcune discrepanze di disponibilità in Golden. Le tabelle nemici specifiche di Golden servono a non importare intervalli dei piani di Persona 4 originale.

Non è stata effettuata una partita di prova per tutte le 69 missioni. Le discrepanze non risolte sono dichiarate nei dati e gestite con un appuntamento prudenziale, senza convertire una data di sblocco in una scadenza.

## Decisioni verificate e correzioni

| Punto | Esito adottato |
|---|---|
| Q5, Demon Statue | Fonti storiche: 31/08; scheda specifica: fino al 26/07. Procedura sicura: accettare e consegnare entro 25/07, prima delle vacanze. Il 31/08 non viene promesso come giorno utile. |
| Gemelle | Catene Golden: 30→35→36→52 e 30→43; completare entrambi prima di 53. Termine operativo 16/11, coerente con “prima del 17/11”. Alcune schede mescolano il termine di novembre dell'originale; non lo si usa per rinviare. |
| Q7–Q15 | Disponibilità sequenziale secondo Hermit. Non si attribuiscono le date fittizie 07/05, 08/05 ecc. alle successive richieste. |
| Q13 | La conclusione di Q20 rende disponibili i gatti davanti a casa Dojima. |
| Q21 | Il conteggio dei pasti è discordante; la conferma affidabile è Antibiotic Gel e lo stato Completed. |
| Q22 | Non sette pasti: 20 pesci equivalenti, incluso l'avvio; Guardian vale cinque. Il premio è Soma. |
| Q31 | Iai Katana: sei Golden Cloth; Cleaning Mop tramite Artisan Apprentice. Cleaning Uniform richiede il lavoro ospedaliero. |
| Q34 | Cinque Thick Hide per Hard Boots in Golden. Non dieci. |
| Q38 | Completa prima Q32 e consegna sia Tetracorn sia Makaracorn. |
| Q40 | Ricompensa inglese Picross Rules!, non Riddlemania. Fashionable Dishes sono materiali vendibili: conservarne tre. |
| Q44 | Culurium da Steel Machine; i capitoli 8–9 sono la zona verificata. Non confondere con Tungsten. |
| Q47/Q51 | Fine Coal come drop di richiesta interferisce con Power Rock. Raccogliere le rocce prima oppure consegnare Q51 e tornare. Q37 viene completata prima di Q47 per prudenza. |
| Q53/Q54 | Q53 ha il flag dal 31/10: il calendario NPC lo dichiara esplicitamente e presenta la visita il 01/11 perché presume che il giocatore aiuti Yosuke a Halloween. Q54 parte dal 01/11. I giorni successivi di alcuni walkthrough non sono scadenze. |
| Q54 | Resta discordante la statistica per Wait: vedere il messaggio del gioco se bloccato; non imporre inutilmente tutte le statistiche al massimo. Ricompensa riportata come Haikara Shirt; alcune guide scrivono Skirt. |
| Q55 | Prerequisito Q42; Q47 in alcune tabelle è un refuso. |
| Q56 | Animal Guide si consegna al ragazzo dell'aula 2-2, che vuole regalarlo alla ragazza sul tetto. |
| Q62/Q63 | Orichalcum ×1 e Golden Chains ×3 sono conservabili già da dicembre, prima di accettare a gennaio. |
| Q66 | Bloody Hide ×8 → Vidar's Boots → Animal Slippers. Premio Fighter Armor. |
| Q67 | Mondo Stone richiede Guardian del fiume. Sea Guardian dà Kaiou Stone. Animal Paw si scambia allo Shiroku Pub, non da Daidara. |
| Q68 | Pianificata dal 19/01; alcune fonti riportano 18/01. Dopo Q67. |
| Q65/Q68 e Gekkou | Le uniformi Gekkou femminili sono un premio distinto da Q65. Ritirarle da Kashiwagi dal 16/01 e prima di completare Q68/lasciare il corridoio. Richiedono quelle maschili ottenute dopo gli esami autunnali; Yu non deve indossare il costume Gekkou. Conferme nella guida costumi GameFAQs 65828 e nella scheda Gekkou Uniform. |
| Q69 | Il quiz non richiede tutte le altre quest. Per prudenza viene consigliata anche la precedente Q49 del preside. Non è una richiesta Hermit. |

## Disponibilità: differenze residue dichiarate

Q25: 05/06 contro 07/06. Q26 e Q28: 07/06 contro 08/06. Q38: 24/07 contro 25/07. Q45: 26/09 contro 27/09. Q46: 28/09 contro 29/09. Q47: 12/10 contro 13/10. Q48–Q50: 08/10 contro 12/10. Q51–Q52: 09/10 contro 13/10.

Il catalogo conserva una data riportata e indica esplicitamente quando cominciare a controllare e quando ripassare. Per Q28 e Q38 il campo principale usa la data più tarda, mentre la nota conserva quella precedente; Q68 è pianificata dal 19/01 per prudenza. Questi scarti non compromettono una quest se si segue la procedura: le consegne sono pianificate con margine. Non si presenta la data più tarda come una deadline.

## Controlli automatici e limiti

- Tutti gli ID 1–69 compaiono una sola volta.
- Ogni voce ha nome originale, traduzione, sblocco, NPC, luogo, obiettivo, ricompensa, riferimenti e checklist.
- `null` in nemico/dungeon/piani significa non applicabile o nessun piano preciso verificato, non informazione inventata.
- Le date prudenziali hanno una spiegazione; non esiste una deadline inventata per ogni quest.
- Il 31/01 è un obiettivo redazionale per lasciare margine; il 05/02 è il termine del tempo libero ordinario. Non è garantita la presenza di ogni NPC in quel singolo giorno.
- È consigliato finire le missioni sul ramo destinato a essere conservato. Una ricarica precedente non trasferisce le quest o gli oggetti ottenuti dopo quel salvataggio.

## Fonti escluse

Non sono stati usati per i dati finali siti recenti che scambiano numeri e obiettivi (per esempio Q69 con Hermit), PDF ripubblicati su domini estranei o guide di Persona 4 Revival. Le pagine wiki condivise fra P4 e Golden non prevalgono da sole sul calendario specifico Golden.

L'elenco cliccabile completo è in `quest_sources.json`; ogni quest punta ai propri ID fonte e URL anche in `quests.json`.

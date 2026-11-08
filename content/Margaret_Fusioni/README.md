# Margaret MAX - Fusioni Persona 4 Golden

Fascicolo separato italiano, completo e utilizzabile offline. Aggiunta alla Complete Endings & Quest Roadmap.

## Apri da qui

- **MARGARET_FUSIONI.pdf**: 37 pagine con testo selezionabile e segnalibri; consigliato in File/Libri su iPhone.
- **index.html**: le stesse istruzioni, checklist e calcolatore completo. Tieni tutta la cartella insieme: i dati sono locali e non serve Internet.
- **images/**: 37 PNG 1800 × 4000, numerati; i collegamenti del capitolo HTML aprono le immagini corrispondenti.
- **svg/**: sorgenti modificabili con testo reale.
- **data/FUSIONI_RANGO_*.csv**: nove tabelle, 30.516 combinazioni dirette complessive ai livelli base. I CSV usano UTF-8 con BOM e separatore punto e virgola.
- **sources/FONTI_E_VERIFICHE.html**: fonti, riscontri, discrepanze risolte e ambito dei controlli.

## Da dove parti

Ultimo salvataggio letto: 22 maggio, NG+, Yu 21 e Margaret 2. Il prossimo incarico è **Matador con Mahama** per il rango 3. La nuova fusione di Matador richiede Yu 24. Un Matador già registrato può essere evocato anche sopra il livello attuale di Yu: controlla il Compendium e l’eventuale carta Mahama prima di allenarti inutilmente.

Il fascicolo contiene tutti i nove incarichi, **31 percorsi guidati / 41 passaggi**, i livelli dei donatori e le alternative con Skill Card, café e Compendium NG+. I quattro risultati speciali hanno ingredienti fissi: le alternative cambiano il percorso dell’abilità, non inventano una seconda ricetta finale.

## Calcolatore

1. Scegli la richiesta Margaret. Il bersaglio e l’abilità si aggiornano insieme.
2. Consulta coppie, terne e ricetta speciale. Le speciali restano visibili anche senza un donatore naturale nella combinazione.
3. Se gli ingredienti sono saliti di livello, modifica i loro livelli attuali e premi **Calcola / aggiorna livelli**. Questo è importante per l’ordine delle fusioni triangolari.
4. Il filtro donatori indica chi impara naturalmente la skill e a quale livello. Devi possedere davvero la skill e non averla cancellata. Per una ricetta speciale può servire la catena guidata del capitolo.
5. Disattiva il filtro per vedere anche ricette da completare con una carta o un ingrediente personalizzato. Usa **Come creo…?** per cercare gli ingredienti. Il menu permette di interrogare tutti i 205 Persona del modello Golden.
6. Esporta il CSV per ottenere tutte le righe filtrate, oltre le 40 visualizzate per pagina. Le tabelle preesportate usano i livelli base, non quelli del tuo salvataggio.

“Tutte” indica le combinazioni dirette deterministiche per un profilo di livelli preciso. Non comprende catene di lunghezza illimitata, tutte le configurazioni di abilità ereditate, incidenti casuali o bonus Fusion Forecast. I prerequisiti dei Persona e i livelli delle nuove fusioni vanno rispettati; non si presume che il giocatore abbia tutti i Social Link MAX.

Le spunte e i livelli si conservano nel browser locale e non modificano il gioco. Il collegamento alla guida principale è disponibile nel pacchetto completo. L’anteprima HTML di File su iPhone può limitare JavaScript: usa il PDF o un browser capace di aprire cartelle HTML locali.

## Verifica

- Doppio riscontro delle richieste e dei livelli; ricette confrontate con dati Golden e guide specifiche.
- Confronto del motore con le funzioni TypeScript originali aqiu384: 20.910 coppie e 1.414.910 terne ai livelli base, più 1.414.910 terne con un secondo profilo di livelli attuali. Zero discrepanze per i nove target.
- Anteprime PNG ispezionate; 37 immagini senza tagli o sovrapposizioni; testo estratto dal PDF coerente con 31 percorsi e 41 passaggi.
- HTML verificato su viewport 390 × 844, filtri, ricetta speciale, download CSV, livelli persistenti e collegamenti PNG.
- Il controllo non è una prova di tutte le fusioni dentro il gioco. Le stringhe, le skill e la preview vanno sempre controllate prima di confermare.

Fonti principali: GameFAQs Golden, RPG Site (con correzioni documentate), Neoseeker, hXcHector, Megaten Wiki e il progetto aqiu384/megaten-fusion-tool. Le fusioni a 4/5/6 ingredienti si sbloccano il **10 luglio** in Golden: il 20 luglio di alcune guide è stato scartato. Dati e algoritmi aqiu384 sono Unlicense, commit fissato in data/fusion_data.json; unica normalizzazione della tabella: Hang → Hanged.

## Sorgenti e rigenerazione

I JSON sono modificabili; tutto il testo è anche in docs/GUIDA_MARGARET.md. Dalla cartella del fascicolo:

1. `python scripts/build_margaret_content.py`
2. `python scripts/render_margaret.py`
3. `node scripts/build_margaret_html.cjs`
4. `node scripts/qa_margaret_engine.cjs`

Richiede Python con reportlab, Pillow, pypdf; Poppler nel PATH; font Segoe UI di Windows. Per il test del motore serve Node 24. Il generatore originale dei dati e gli altri script di confezionamento restano nella cartella scripts della guida principale. Le illustrazioni sono riutilizzate dagli asset originali del progetto, separate dal testo tipografico.

Guida non ufficiale. Persona 4 Golden e i personaggi appartengono ai rispettivi titolari.

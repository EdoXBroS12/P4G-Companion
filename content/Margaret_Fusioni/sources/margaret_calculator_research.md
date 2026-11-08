# Ricerca tecnica: fusioni Margaret in Persona 4 Golden

Verificata il 7–8 novembre 2026. Questa nota descrive le fonti e l'ambito del calcolatore dei nove target; non modifica la roadmap degli ending.

## Fonti selezionate

La fonte implementativa principale è [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool), licenza Unlicense, fissata al commit `0b207612f6cdcff092e62af16f5c355271a1d892`. L'interfaccia specifica è [Persona 4 Golden](https://aqiu384.github.io/megaten-fusion-tool/#/p4g). La [Fusion Theory pubblicata dallo stesso autore](https://aqiu384.github.io/megaten-database/fusion-theory) offre formule ed esempi Golden, utili come fixture leggibili.

[arantius/persona-fusion-calculator](https://github.com/arantius/persona-fusion-calculator), licenza Apache 2.0, contiene [data4golden.js](https://github.com/arantius/persona-fusion-calculator/blob/gh-pages/data4golden.js), [app.js](https://github.com/arantius/persona-fusion-calculator/blob/gh-pages/app.js) e una [pagina Golden](https://arantius.github.io/persona-fusion-calculator/4golden.html#/list/name). È stato consultato come confronto secondario. Non è stato usato per sostituire indiscriminatamente dati o formule di aqiu384: presenta convenzioni e imperfezioni diverse, descritte sotto.

## File Golden da importare

Tutti i percorsi seguenti sono relativi al [commit verificato](https://github.com/aqiu384/megaten-fusion-tool/tree/0b207612f6cdcff092e62af16f5c355271a1d892).

| File | Funzione e cautela |
|---|---|
| `src/app/p4/compendium.module.ts` | Definisce esplicitamente come distinguere P4 e P4G. È la fonte per la composizione dei dati. |
| `src/app/p4/data/demon-data.json` + `golden-demon-data.json` | Unire per nome di Persona: la voce Golden sostituisce quella base. Non leggere soltanto il file Golden. Escludere le Persona dei compagni dagli ingredienti. |
| `src/app/p4/data/skill-data.json` + `golden-skill-data.json` | Importare le righe per nome abilità (`a[0]`), con priorità alle righe Golden. |
| `src/app/p4/data/golden-fusion-chart.json` | Tabella Golden: metà superiore per due ingredienti, metà inferiore per la seconda operazione triangolare. Include Aeon e Jester. |
| `src/app/p4/data/special-recipes.json` | Combinazioni fisse: hanno precedenza sul calcolo ordinario. |
| `src/app/p4/data/golden-demon-unlocks.json` | Requisiti di sblocco, da distinguere dalla mera possibilità matematica della fusione. |
| `src/app/p4/data/inheritance-types.json` | Tipi di eredità, dodici categorie attive e matrice di compatibilità. Valore zero: vietato. Valore positivo: ammesso. |
| `src/app/p4/data/comp-config.json` | Ordine degli Arcani e categorie. |
| `src/app/pq2/models/skill-importer.ts` | Schema compatto delle abilità, unicità, costi e fonte della carta. Il riuso del percorso `pq2` non significa dati del gioco Persona Q2. |
| `src/app/pq2/models/per-fusion-chart.ts` | Interpreta le due metà della tabella e i modificatori dei livelli. |
| `src/app/compendium/fusions/smt-nonelem-fusions.ts` | Fusione a due ingredienti di Arcani diversi. |
| `src/app/compendium/fusions/per-nonelem-fusions.ts` | Eccezione per due ingredienti dello stesso Arcano. |
| `src/app/compendium/fusions/per-triple-fusions.ts` | Tre ingredienti, loro ordine e parità di livello attuale. |

Il merge importato contiene 205 Persona utilizzabili come specie nel calcolo. Valori `0.1`, `0.2` ecc. in `skills` indicano slot innati; non sono livelli a cui allenare una Persona. I valori interi di apprendimento devono essere confrontati con il livello attuale, senza presumere che il giocatore abbia conservato l'abilità.

## Regole applicate e verifiche

Per due Arcani diversi si usa la tabella normale e la soglia `floor((baseA + baseB)/2) + 1`, scegliendo il risultato ordinario compatibile. I livelli guadagnati dagli ingredienti non entrano nella media. Due ingredienti dello stesso Arcano richiedono invece l'algoritmo di discesa, escludendo gli ingredienti stessi e i risultati speciali: non applicare il comune arrotondamento verso l'alto.

Per tre ingredienti, il livello **attuale** più alto stabilisce l'ingrediente C; in caso di parità prevale l'Arcano che viene prima nell'ordine della tabella. Gli altri due determinano l'Arcano intermedio con la tabella normale; intermedio e C usano la tabella triangolare. La soglia del risultato usa i tre livelli **base** e il modificatore +5. Tre ingredienti dello stesso Arcano non seguono la regola discendente delle coppie.

Il codice sorgente usa `+0.5` per la soglia normale e `+4.25` per quella triangolare prima del confronto con livelli interi: producono rispettivamente le soglie intere `floor(media)+1` e `floor(media)+5`. Non sono modificatori da presentare al giocatore come bonus aggiuntivi.

Esempi pubblicati e riprodotti: Girimehkala base48 + Mithra base31 → Taowu56; King Frost attuale32/base22 + Makami27 + Neko Shogun32 → Decarabia46. Questi esempi verificano la distinzione fra livello base e attuale. Fonte: [Fusion Theory](https://aqiu384.github.io/megaten-database/fusion-theory).

Le ricette speciali a due o tre ingredienti devono prevalere sulle formule generiche. Casi controllati: Belial + Nebiros → Alice; Rangda + Barong → Shiva; Parvati + Shiva → Ardha; Clotho + Lachesis + Atropos → Norn. Due copie della medesima specie non costituiscono ingredienti validi.

## I nove target e l'eredità

| Rango | Target, livello base | Abilità richiesta | Categoria |
|---:|---|---|---|
| 2 | Ippon-Datara 17 | Sukukaja | supporto |
| 3 | Matador 24 | Mahama | luce |
| 4 | Gdon 31 | Rampage | fisico |
| 5 | Neko Shogun 32 | Bufula | ghiaccio |
| 6 | Black Frost 38 | Auto-Sukukaja | passiva |
| 7 | Yatagarasu 40 | Megido | onnipotente |
| 8 | Yatsufusa 49 | Mediarama | recupero |
| 9 | Ganesha 50 | Tetrakarn | supporto |
| 10 | Trumpeter 67 | Mind Charge | supporto |

Tutte e nove le eredità richieste sono compatibili con il tipo del target. Nessuno dei nove target apprende naturalmente la propria abilità richiesta nell'elenco Golden importato: occorre eredità oppure Skill Card. Le passive ordinarie, come Auto-Sukukaja, non si cercano fra le dodici categorie della matrice attiva. Le abilità uniche sono una restrizione distinta; non estendere un controllo limitato a queste nove richieste a qualunque passiva del gioco.

Golden consente la selezione manuale delle abilità ereditabili e le Skill Card; i pesi positivi della matrice non vanno presentati come probabilità di selezione casuale. Un donatore naturale non è l'unico portatore possibile: l'abilità può essere stata trasferita in precedenza. Viceversa, il semplice livello sufficiente non prova che l'abilità sia ancora presente nella build salvata.

Ricette speciali dei target, dal file `special-recipes.json`:

- Neko Shogun: Ara Mitama + Nigi Mitama + Kusi Mitama + Saki Mitama.
- Black Frost: Jack Frost + Pyro Jack + King Frost + Pixie + Ghoul.
- Yatsufusa: Thoth + Orthrus + Makami + Narasimha + Mothman.
- Trumpeter: Matador + White Rider + Daisoujou + Pabilsag + Taotie + Taowu.

Due passaggi particolarmente diretti, verificati nei dati Golden: Thoth impara Mediarama al47 ed è ingrediente fisso di Yatsufusa; Taotie impara Mind Charge al38 ed è ingrediente fisso di Trumpeter. Se si sono cancellate queste abilità, il solo livello non basta.

## Discrepanze individuate

1. **Refuso `Hang`:** nella cella Empress/Lovers della tabella aqiu384 Golden. Normalizzato in `Hanged`, nome effettivo dell'Arcano. Senza correzione alcune ricette vengono perse.
2. **Formula e implementazione al limite superiore:** il testo Fusion Theory descrive come non valida una coppia la cui soglia supera l'ultimo risultato ordinario dell'Arcano; `smt-nonelem-fusions.ts` applica un limite all'ultimo risultato disponibile. Il motore segue il codice verificato. Questa divergenza non cambia le combinazioni dei nove target, che non sono l'ultimo risultato ordinario del proprio Arcano. Non rivendicare, sulla base di questo audit, validazione integrale di ogni risultato fuori ambito.
3. **Parità fra due ingredienti alti dello stesso Arcano:** le funzioni inverse upstream possono omettere il caso per via dei confronti stretti. Nel calcolo diretto la scelta fra i due non cambia Arcani né media base. Verificata separatamente l'invarianza alle sei permutazioni; non spacciata per prova in gioco.
4. **Arantius:** il dataset Golden contiene grafie quali `CHariot`, `MAgician` e `Heirophant`; normalizzarle prima di confrontare tabelle. Le sue liste speciali comprendono anche convenzioni per risultati bassi che non corrispondono all'elenco delle sole ricette fisse di aqiu384. Nel caso stesso Arcano, il confronto della soglia in `app.js` non coincide sempre con quello aqiu384. Perciò il secondo calcolatore non è stato trattato come consenso perfetto o come sostituto automatico dell'oracolo.

## Significato verificabile di esaustività

È possibile enumerare tutte le coppie e tutte le terne di specie distinte, più le ricette speciali fisse, **per un determinato insieme di livelli attuali**. Su 205 specie sono 20.910 coppie e 1.414.910 terne. Sono numeri finiti e testabili; i conteggi per target sono nel rapporto QA.

Non è corretto chiamare ciò «tutte le possibili catene con abilità»: le eredità pregresse, le carte, i diversi livelli e i bonus/incidenti introducono stati ulteriori. La dicitura consigliata è: **tutte le combinazioni dirette per la configurazione di livelli impostata**, con separazione fra risultato di specie e disponibilità effettiva dell'abilità. Il livello del protagonista, gli sblocchi, gli ingredienti registrati e il denaro possono impedire l'esecuzione di una ricetta matematicamente corretta.

## Audit consegnato

`Margaret_Fusioni/docs/QA_CALCOLATORE.md` e `QA_ENGINE.json`: confronto completo dei nove target con funzioni TypeScript originali, sia a livelli base sia con un secondo profilo di livelli attuali variati; casi mirati per speciali, Arcani uguali, pareggi e abilità. Zero discrepanze e zero avvisi alla consegna. Le funzioni originali e la relativa licenza sono incluse in `Margaret_Fusioni/sources/upstream/` per rendere il test ripetibile offline.

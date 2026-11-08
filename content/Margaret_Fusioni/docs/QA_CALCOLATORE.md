# Verifica del calcolatore Margaret

Esito: **PASS**, 8 novembre 2026. Il test riguarda i nove target delle richieste di Margaret in **Persona 4 Golden**. Nessuna discrepanza e nessun avviso aperto nel rapporto `QA_ENGINE.json`.

Il confronto esegue direttamente le funzioni TypeScript del progetto [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool/tree/0b207612f6cdcff092e62af16f5c355271a1d892), commit `0b207612f6cdcff092e62af16f5c355271a1d892`. L'oracolo non ricopia le formule del motore: rimuove import e annotazioni TypeScript, poi esegue le funzioni originali con gli stessi dati Golden normalizzati. Non è una prova effettuata dentro il gioco.

## Copertura

- Tutte le **20.910 coppie** distinte tra 205 Persona.
- Tutte le **1.414.910 terne** distinte con i livelli base.
- Tutte le **1.414.910 terne** con un secondo profilo di livelli attuali aumentati: cambia l'ordine degli ingredienti e introduce parità fra Arcani.
- Confronto in entrambe le direzioni: nessuna ricetta per i nove target mancante e nessuna ricetta aggiunta rispetto all'oracolo.
- Fixture per fusioni speciali a due ingredienti, tre ingredienti dello stesso Arcano, priorità degli Arcani a parità di livello attuale, rifiuto di ingredienti duplicati e quattro ricette speciali dei target.
- Compatibilità di eredità per tutte le nove abilità richieste; controllo negativo Black Frost/Mahama.

| Target | Normali | Triangolari, livelli base | Speciali fisse |
|---|---:|---:|---:|
| Ippon-Datara | 75 | 240 | 0 |
| Matador | 117 | 1.801 | 0 |
| Gdon | 194 | 5.446 | 0 |
| Neko Shogun | 0 | 0 | 1 |
| Black Frost | 0 | 0 | 1 |
| Yatagarasu | 213 | 11.783 | 0 |
| Yatsufusa | 0 | 0 | 1 |
| Ganesha | 137 | 10.506 | 0 |
| Trumpeter | 0 | 0 | 1 |

I conteggi indicano ricette che producono la **specie**. Per soddisfare Margaret, il risultato deve possedere anche l'abilità richiesta. Un ingrediente elencato fra i donatori naturali deve averla effettivamente imparata e conservata; una ricetta senza donatore naturale può richiedere una catena di eredità o una Skill Card.

## Correzioni e casi controllati

- La tabella Golden originale contiene `Hang` alla cella Empress/Lovers. È stato normalizzato in `Hanged`, Arcano presente nei dati. Nessun'altra tabella è stata sostituita con quella di Persona 4 originale.
- Auto-Sukukaja è passiva: non compare nella matrice dei dodici elementi attivi. La sua eredità da parte di Black Frost è ammessa e verificata.
- Clotho + Lachesis + Atropos deve dare Norn attraverso la ricetta speciale, prima del calcolo triangolare generico. Il controllo passa dopo la correzione dell'override.
- La fixture pubblicata dall'autore, King Frost **attuale 32/base 22** + Makami 27 + Neko Shogun 32, produce Decarabia: il pareggio privilegia Emperor rispetto a Star.
- Una parità fra due ingredienti dello stesso Arcano non deve dipendere dall'ordine di selezione: sei permutazioni di Ippon-Datara 35 + Mothman 35 + Jack Frost 16 producono Ose. L'oracolo inverso originale omette alcuni pareggi dello stesso Arcano; per questo caso è stato verificato separatamente il comportamento della formula diretta.

## Limite preciso di «tutte»

L'esaustività riguarda **tutte le combinazioni dirette di specie** nel dataset Golden per i nove risultati, dato un preciso profilo di livelli attuali. Le triangolari possono cambiare quando un ingrediente sale di livello: il profilo va aggiornato. I test coprono due profili completi e casi mirati, non ogni possibile assegnazione dei livelli 1–99.

Non equivale all'enumerazione di tutte le catene di fusione, di tutte le configurazioni di abilità ereditate o di tutti gli effetti di Fusion Forecast e incidenti. Non dimostra che il giocatore possieda già gli ingredienti, abbia sbloccato le Persona richieste, possa pagarle o abbia il livello necessario per fondere il risultato.

Il confronto con il codice sorgente conferma la correttezza dell'adattamento; non costituisce una verifica indipendente dei dati originali del gioco. Per la consegna a Margaret controllare sempre il nome della Persona e l'abilità nella schermata di conferma.

## Riproduzione

Nell'addon: `node scripts/qa_margaret_engine.cjs` con Node.js 24. I tre file TypeScript dell'oracolo, immutati, sono in `sources/upstream/`; non occorre scaricare il repository. Il comando rigenera `docs/QA_ENGINE.json`. Il messaggio `ExperimentalWarning` relativo a `stripTypeScriptTypes` non segnala un fallimento del test.

Fonte delle formule ed esempi: [Fusion Theory](https://aqiu384.github.io/megaten-database/fusion-theory). Dettagli di importazione dati, discrepanze fra fonti e restrizioni: `sources/margaret_calculator_research.md` nella guida principale.

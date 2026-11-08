# QA visivo — ricette Margaret

Data: 8 novembre 2026. Esito: **PASS**, senza problemi bloccanti osservati. Controllo eseguito sui file esportati; nessuna modifica a dati, ricette o impaginazione.

## Immagini effettivamente ispezionate

- `previews/CONTACT_02.jpg`: pagine 13–24, tutte le dodici miniature.
- `previews/CONTACT_03.jpg`: pagine 25–36, tutte le dodici miniature.
- PNG originali aperti singolarmente: `09_rango_02_01`, `10_rango_02_02`, `12_rango_03_01`, `18_rango_05_02`, `20_rango_06_01`, `25_rango_08_02`, `27_rango_09_01`, `30_rango_10_02`.

La selezione aggiunge le ricette iniziali assenti dalle due tavole richieste e approfondisce catene a più passaggi, passiva Auto-Sukukaja, triangolari e alternativa Mind Charge.

## Impaginazione e leggibilità

- Nei file osservati non compaiono testi troncati, righe sovrapposte, card sovrapposte o invasioni del piè di pagina.
- I titoli lunghi vanno a capo correttamente. Il corpo delle istruzioni conserva dimensioni uniformi, margini e separazione fra percorsi.
- Le pagine dense, in particolare 20 e 25, mantengono l’ultima riga sopra il margine inferiore e sopra la fascia del numero di pagina.
- Nomi delle Personas, abilità, livelli e formule sono leggibili nei PNG originali. Il simbolo grafico `>` separa chiaramente ingredienti e risultato; il sorgente usa la freccia `→`.
- L’illustrazione di Teddie resta nell’intestazione e non copre contenuti.
- La progressione “Parte 01 / 02” o “Parte 01 / 03” e il numero di pagina rendono identificabili le continuazioni. Nessuna ricetta osservata perde il suo passaggio conclusivo al cambio pagina.
- I PNG sono verticali, 1800 × 4000, come riportato in `QA_EXPORTS.json`. La verifica è stata effettuata sulle anteprime e sui PNG nel visualizzatore; non è stata eseguita su un iPhone fisico.

## Coerenza delle 31 ricette

Confronto automatico in sola lettura fra `data/margaret_recipes_verified.json` del progetto principale e `docs/GUIDA_MARGARET.md` del fascicolo: presenti **tutte le 41 formule di fusione** appartenenti ai **31 percorsi**, con ogni stringa “Trasmetti [abilità] da [donatore]” richiesta. Zero omissioni dopo normalizzazione del solo simbolo di freccia.

Riscontro visivo dei punti più sensibili:

- Ippon-Datara: Sukukaja da Sylph 11, Angel 6 oppure Ghoul 10; marcatura del rango 2 già ottenuto nella partita letta.
- Matador: Anzu 19 per Mahama; nella triangolare Principality è esplicitamente il livello attuale più alto.
- Gdon: Rampage da Matador 27 o Ippon-Datara 21; entrambe le alternative restano distinguibili.
- Neko Shogun: Bufula passa attraverso Kusi Mitama oppure Nigi Mitama, con tutti i quattro ingredienti speciali. Il percorso tramite Pazuzu evidenzia il livello 37 dell’intermedio e la possibile scorciatoia se già disponibile.
- Black Frost: Anzu + Apsaras/Sylph produce Jack Frost; Ose + Oni produce Pyro Jack. Auto-Sukukaja è trasmessa anche nel secondo passaggio, con i cinque ingredienti fissi.
- Yatagarasu: Megido attraversa Ares quando richiesto; le alternative dirette indicano il donatore corretto.
- Yatsufusa: Mediarama da Thoth 47 oppure Narasimha preparato prima; presenti cinque ingredienti e vincolo sui livelli attuali per la triangolare Kushinada-Hime.
- Ganesha: Tetrakarn da Decarabia o Kaiwan; la spiegazione della triangolare con tre Star è coerente con il dataset verificato.
- Trumpeter: sei ingredienti sia nel percorso Taotie 38 sia nell’alternativa Jack Frost 25 → Matador. È esplicito che il secondo Matador deve avere Mind Charge e che la fusione speciale finale non cambia.

Le formule e le eredità corrispondono alla ricerca già validata. Le pagine osservate conservano inoltre la distinzione fra livello minimo della nuova fusione e richiamo dal Compendium NG+.

## Riscontri di esportazione e limiti

`docs/QA_EXPORTS.json` riporta 37 pagine, nessun overflow, testo PDF estraibile e nove target. `docs/QA_ENGINE.json` registra il controllo del motore rispetto al commit del dataset. Questi risultati automatici sono complementari all’ispezione visiva sopra descritta.

Le pagine 32–36 su carte e Chagall sono state controllate per tagli, sovrapposizioni e leggibilità. Le loro fonti di gameplay appartengono alla verifica specifica delle Skill Card; questo controllo non introduce ulteriori ricette o requisiti. Non sono state eseguite fusioni nel gioco durante il QA.

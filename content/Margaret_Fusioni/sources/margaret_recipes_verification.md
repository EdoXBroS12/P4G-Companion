# Margaret — verifica indipendente delle ricette (Golden)

Verificato l’8 novembre 2026. Ambito: Persona 4 Golden; dati della versione Golden applicati sopra la base comune del calcolatore aqiu384. Non sono state eseguite fusioni nel gioco per questa verifica.

Il file operativo è `data/margaret_recipes_verified.json`: 9 richieste, 31 percorsi pratici, 41 passaggi di fusione. Il generatore riproducibile è `scripts/build_margaret_verified.cjs`. Ogni percorso distingue fonti editoriali e ricette ricavate dal modello.

## Metodo e forza delle prove

1. Confronto delle richieste e delle soluzioni fra [RPG Site](https://www.rpgsite.net/feature/9837-persona-4-golden-fusion-solutions-for-the-empress-social-link-margaret), [hXcHector](https://www.hxchector.com/persona-4-golden-walkthrough/social-links/empress-margaret/), [GameFAQs PC di Lukaight](https://gamefaqs.gamespot.com/pc/293013-persona-4-golden/faqs/79084/empress-social-link) e [Neoseeker di yangxu](https://www.neoseeker.com/p4golden/faqs/256555-persona-4-golden-max-social.html).
2. Controllo di nomi, Arcani, livelli base, abilità apprese e ingredienti speciali nel [dataset P4G di aqiu384, commit 0b207612f6cdcff092e62af16f5c355271a1d892](https://github.com/aqiu384/megaten-fusion-tool/tree/0b207612f6cdcff092e62af16f5c355271a1d892/src/app/p4/data). I file Golden modificano ed estendono quelli di Persona 4: non basta caricare la sola base.
3. Ricalcolo delle ricette con l’algoritmo del progetto; verifica dei risultati e della possibilità di ereditare le abilità. Tutti i 41 passaggi corrispondono al bersaglio previsto.
4. Nelle fusioni triangolari diverse dallo stesso Arcano, vincolo esplicito sul Persona di livello attuale più alto. Le condizioni proposte sono conservative: disuguaglianza stretta per evitare dipendenza dagli spareggi.

Il dossier non tratta una guida copiata su un altro sito come conferma indipendente. In particolare [SteamAH](https://steamah.com/persona-4-golden-margarets-fusion-wishes-guide-empress-arcana/) dichiara la derivazione da Wikidot; GamePretty ripropone lo stesso testo. Le loro alternative sono state accettate solo dopo controllo nel dataset Golden e nel calcolatore.

## Mappa delle nove richieste

I livelli sono quelli base dei bersagli, cioè il livello minimo di Yu per una nuova fusione del bersaglio. Non sono un limite al richiamo di una versione già registrata in NG+.

| Rango ottenuto | Bersaglio | Abilità | Lv | Metodo principale e conferme |
|---|---|---|---:|---|
| 2 | Ippon-Datara | Sukukaja | 17 | Sylph + Cu Sith; alternative Angel 6 + Sarasvati, Obariyon + Ghoul 10. M01/M02/M03/M06/M10/M13. |
| 3 | Matador | Mahama | 24 | Anzu 19 + Berith. M01/M02/M06/M10/M11. |
| 4 | Gdon | Rampage | 31 | Matador 27 + Ippon-Datara, oppure Ippon-Datara 21 come donatore. Xiezhai 19 + Kusi Mitama è un’altra soluzione documentata. M01/M02/M03/M06/M10. |
| 5 | Neko Shogun | Bufula | 32 | King Frost + Hua Po → Kusi Mitama con Bufula; Cross con gli altri tre Mitama. M01/M02/M06/M10. |
| 6 | Black Frost | Auto-Sukukaja | 38 | Anzu 20 + Apsaras/Sylph → Jack Frost con Auto-Sukukaja; Pentagon. M01/M02/M06/M10/M11. |
| 7 | Yatagarasu | Megido | 40 | Taotie + Cu Sith → Ares con Megido; Ares + Black Frost. Alternativa diretta: Samael 39 + Mothman. M01/M04/M06/M12. |
| 8 | Yatsufusa | Mediarama | 49 | Thoth 47 nella Pentagon. Alternativa: Alraune + Triglav → Narasimha con Mediarama, poi la stessa Pentagon. M01/M02/M06/M08/M10. |
| 9 | Ganesha | Tetrakarn | 50 | Decarabia + Cu Chulainn; alternativa Kaiwan + Neko Shogun + Fuu-Ki. M01/M02/M04/M06/M10. |
| 10 | Trumpeter | Mind Charge | 67 | Taotie 38 nella Hexagon. Alternativa calcolata: Jack Frost 25 + Queen Mab → Matador con Mind Charge; poi la stessa Hexagon. M01/M02/M03/M06/M10/M12. |

Le altre soluzioni pratiche e ogni passaggio intermedio sono nel JSON. Le voci marcate «alternativa calcolata» sono deduzioni esplicite del modello: non vengono presentate come ricette direttamente trascritte dai walkthrough.

## Ingredienti fissi: nessuna ambiguità

Quattro richieste usano una fusione speciale con **un solo insieme diretto di ingredienti**. Un’alternativa riguarda il modo di preparare l’abilità su un componente, oppure l’uso di una Skill Card sul bersaglio; non cambia l’insieme della fusione finale. Conferme: [compendio GameFAQs](https://gamefaqs.gamespot.com/vita/641695-persona-4-golden/faqs/76145/persona-compendium), dataset M06 e guide delle richieste.

| Bersaglio | Tipo | Ingredienti esatti |
|---|---|---|
| Neko Shogun | Cross, 4 | Ara Mitama; Nigi Mitama; Kusi Mitama; Saki Mitama |
| Black Frost | Pentagon, 5 | Jack Frost; Pyro Jack; King Frost; Pixie; Ghoul |
| Yatsufusa | Pentagon, 5 | Thoth; Orthrus; Makami; Narasimha; Mothman |
| Trumpeter | Hexagon, 6 | Matador; White Rider; Daisoujou; Pabilsag; Taotie; Taowu |

## Donatori e livelli delle abilità

I dati seguenti sono verificati nel dataset Golden M06. Quando l’abilità è innata, il numero indica il livello base del Persona. Il livello non garantisce che il giocatore abbia conservato l’abilità: potrebbe averla sostituita.

| Abilità | Donatori usati |
|---|---|
| Sukukaja | Sylph: innata, base 11; Angel: 6; Ghoul: 10 |
| Mahama | Anzu: 19; Principality: 21; Power: innata, base 27 |
| Rampage | Ippon-Datara: 21; Matador: 27; Xiezhai: 19; Ares: 28; Legion: 23 |
| Bufula | King Frost: innata, base 22; Pazuzu: innata, base 37 |
| Auto-Sukukaja | Anzu: 20; Ose: 35; Hitokoto-Nushi: innata, base 41 |
| Megido | Taotie: innata, base 35; Samael: 39; Thoth: innata, base 45 |
| Mediarama | Thoth: 47; Alraune: innata, base 41; Kushinada-Hime: innata, base 44 |
| Tetrakarn | Decarabia: innata, base 46; Kaiwan: innata, base 24 |
| Mind Charge | Taotie: 38; Jack Frost: 25; Dis: 44 |

Riscontri separati particolarmente utili: [Anzu](https://www.hxchector.com/persona-4-golden-walkthrough/persona-guide/anzu/) per Mahama 19 e Auto-Sukukaja 20; [Angel](https://www.hxchector.com/persona-4-golden-walkthrough/persona-guide/Angel/) per Sukukaja 6; [Taotie](https://www.hxchector.com/persona-4-golden-walkthrough/persona-guide/taotie/) per Megido innato e Mind Charge 38; [Twinfinite](https://twinfinite.net/guides/persona-4-golden-yatsufusa-with-mediarama/) per i due donatori alternativi di Mediarama a Yatsufusa.

## Discordanze risolte e cautele

**10 luglio, non 20 luglio.** Alcune pagine delle fusioni indicano il 20 luglio. La guida PC Golden di Lukaight indica espressamente 07/10; il [calendario Golden](https://megatenwiki.com/wiki/Calendar_in_Persona_4_Golden) colloca lo sblocco delle 4/5/6 vie nell’evento del 10 luglio. Questa è la data adottata. Una Persona speciale già registrata può essere richiamata: lo sblocco riguarda la creazione di nuove fusioni con quei tipi.

**Base e livello attuale non sono intercambiabili.** La [teoria del calcolatore](https://aqiu384.github.io/megaten-database/fusion-theory) e GameFAQs distinguono le due quantità. Le normali a due usano i livelli base, mentre il terzo ingrediente logico di una triangolare è determinato dal livello attuale più alto. L’ordine con cui il giocatore clicca gli ingredienti non sostituisce questa regola. Nelle ricette del fascicolo si controlla comunque l’anteprima prima della conferma.

**La triangolare Ganesha con tre Star è stabile.** Kaiwan, Neko Shogun e Fuu-Ki appartengono tutti a Star. Il ricalcolo mantenendo a turno ciascuno come livello attuale più alto restituisce sempre Ganesha. Al contrario, Principality + Oberon + Saki Mitama produce Matador solo con la gerarchia indicata; alzare Oberon o Saki Mitama sopra Principality cambia il risultato.

**NG+ e Compendium.** Il richiamo di una Persona già registrata può superare il livello attuale di Yu, mentre una nuova fusione resta limitata dal livello del protagonista. La distinzione è esplicita nella [risposta GameFAQs dedicata](https://gamefaqs.gamespot.com/vita/641695-persona-4-golden/answers/579968-can-i-summon-a-persona-from-compendium-if-its-higher-level-than-me) ed è coerente con la sezione NG+ di [Neoseeker KADFC](https://www.neoseeker.com/p4golden/faqs/264246-persona-4-golden-a.html) e [New Game+](https://megatenwiki.com/wiki/New_Game%2B). La pagina Neoseeker completa ha restituito 403 alla lettura diretta finale; il suo estratto indicizzato è stato usato solo come riscontro, non come unica prova.

**Nomi e refusi.** Kusi Mitama è Strength, non Priestess. Anzu + Apsaras/Sylph dà Jack Frost, non Pyro Jack. Yatsufusa usa cinque ingredienti, non sei. Le grafie adottate dal dataset sono Ippon-Datara, Cu Chulainn, Hitokoto-Nushi, Fuu-Ki, Kushinada-Hime, Taotie e Taowu. Il vecchio nome Tao Tie indica Taotie, non un ingrediente diverso. Le traduzioni automatiche che trasformano i nomi in parole italiane non sono usate.

**Scelta delle abilità in Golden.** Le abilità ereditabili si selezionano manualmente. I consigli di annullare e ripetere l’anteprima finché compare una selezione casuale appartengono al comportamento del gioco originale e non vengono applicati. Basta possedere il Persona corretto con l’abilità esatta e rientrare nella Velvet Room; non occorre che sia stato creato immediatamente prima. Conferma operativa: M03.

**Passive.** Auto-Sukukaja è ereditabile da Jack Frost, Pyro Jack e Black Frost. Il modello distingue la categoria passiva dalla matrice degli attacchi/abilità attive: un controllo che cerca `pas` nella sola matrice attiva produce un falso negativo. Questo problema è stato identificato e corretto nel motore prima della consegna dei dati.

## Limite di «tutti i modi»

Si possono enumerare tutte le combinazioni dirette normali, triangolari e speciali per un insieme esplicito di livelli attuali. Non è onesto equipararle a tutte le possibili catene di eredità: una stessa abilità può attraversare molti passaggi, essere insegnata con una carta, recuperata da una versione registrata, o provenire da Fusion Forecast. Il fascicolo offre percorsi semplici e verificati; il calcolatore separato enumera gli ingredienti diretti. Il risultato effettivo, il nome dell’abilità e il livello di Yu vanno controllati nell’anteprima.

## Registro delle fonti

Gli identificativi M01–M16, con titoli e URL completi, sono inclusi nel JSON accanto a ogni ricetta. Le fonti principali sono state confrontate, non copiate integralmente. I dati factualizzati (nomi, numeri, insiemi di ingredienti) sono mantenuti separati dalle note editoriali originali del fascicolo.

## Esito QA

- 9 richieste presenti e ordinate dal rango 2 al 10.
- 31 percorsi pratici; ciascuno termina nel Persona richiesto.
- 41 passaggi di fusione ricalcolati; zero bersagli discordanti.
- Tutte le abilità da trasferire nei passaggi risultano ereditabili dopo la gestione corretta delle passive.
- Per le fusioni speciali l’insieme degli ingredienti coincide con la ricetta fissa Golden.
- Donatori naturali e livelli confrontati con la base Golden; donatori intermedi marcati come eredità.
- Fusione di Neko Shogun via Pazuzu segnalata come più costosa in livelli: crea un intermedio 37 pur avendo bersaglio 32.
- Soluzioni calcolate distinguibili da quelle documentate direttamente dalle guide.
- Nessuna prova di esecuzione in gioco dichiarata; il salvataggio personale è stato soltanto letto.

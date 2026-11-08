# P4G Companion

[Italiano](README.it.md) · [Downloads](https://github.com/EdoXBroS12/P4G-Companion/releases) · [Report an issue](https://github.com/EdoXBroS12/P4G-Companion/issues)

An offline Windows companion for **Persona 4 Golden**: follow ending routes, track side quests and prepare Margaret’s fusion requests while you play. The app has an Italian/English text interface and a compact, always-on-top window.

**Full story spoilers.** This is an independent fan project, with no affiliation with or endorsement by ATLUS or SEGA. Version **1.2.0**.

![P4G Companion in English](docs/screenshots/home-en.png)

## Download and start

1. Open [Releases](https://github.com/EdoXBroS12/P4G-Companion/releases) and download the portable Windows x64 `.exe` attached to the release you want.
2. Run the downloaded file. No separate Node.js or Python installation is needed. The portable launcher may take a few seconds to extract its runtime on first launch.
3. Select Italian or English in the app’s language setting, then choose an ending, the quest catalogue or Margaret’s guide.

If a release has not been published yet, use the source-build instructions below. GitHub’s **Source code** archives contain the project, not a ready-to-run app.

## What is included

- Seven practical ending routes: Bad 1, Bad 2, Bad 3, Accomplice, Normal/Good, True and Golden. Some guides group the bad-ending variants differently; Golden extends the True conclusion with additional content.
- Instructions, original English dialogue choices, checkpoint reminders and a master roadmap.
- All **69 side quests**, with objectives, prerequisites, locations, rewards and notes distinguishing availability from deadlines or precautionary target dates.
- Preparation, Social Links, books, fishing and other missable content.
- Margaret’s nine requests, guided fusion recipes, Skill Cards and a calculator with adjustable current Persona levels.
- Separate journal branches for quest states, checklists, notes and fusion levels; shared history of endings you have seen.
- Local illustrated cards, PDFs and source notes.

**Language coverage:** the language switch translates the interface and textual guides. The currently bundled illustrated cards, PNGs and PDFs remain in **Italian**. In-game English names and quoted dialogue are retained so that you can identify the correct prompts. Italian explanations are editorial translations, not a claim to reproduce an official localisation.

## Use it while playing

The **Overlay** button switches to a compact desktop window. Use windowed or borderless-windowed mode in the game; exclusive fullscreen may cover desktop windows.

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + Space` | Show or hide the companion |
| `Ctrl + Shift + O` | Switch between compact and full views |
| `Ctrl + Shift + T` | Toggle always-on-top |

Text size and opacity are adjustable in settings. Searchable dropdowns support the keyboard as well as the mouse. If a shortcut is already used by another program, the app’s buttons remain available.

## Progress and save branches

The bundled guide uses an example New Game+ run starting on **22 May**, with sample Social Link ranks and numbered save slots. References such as “your 22 May position” describe that guide scenario; they are **not a live reading of your game**. Check your own date, ranks and save slots before following its schedule. The app does not import a player's game save or personal journal with the guide.

The journal is a manual record. It does not read, edit or synchronise the game’s save files. Mark a quest completed only after checking the in-game quest log.

Create a journal branch when you separate your in-game saves. A new branch copies the currently selected journal; it does not reconstruct an earlier checkpoint. Loading an old game save does not combine its quests, inventory or Persona progress with another save. Select the matching journal branch and check your current Persona levels before calculating triangular fusions.

Progress is stored in the Windows user’s application-data folder. Open that folder from the app’s settings, or export/import the journal as JSON. The portable EXE and the journal are separate files: keeping an exported copy is useful when moving to another PC.

The guides, images and calculator work offline. Opening a web source uses your browser and requires an internet connection.

## Verification and limitations

The content has been checked against Golden-specific guides, source notes and algorithm tests. This is not a guarantee that every route, dialogue variant or fusion has been tested inside the game. See the source notes included with the app, and report a discrepancy with its date, location and exact prompt.

Fusion results depend on the configured levels and the underlying Golden dataset. A recipe that creates a species does not prove that its ingredients possess the required skill or are available in your save. Check the fusion preview and the inherited skill before confirming. The calculator does not enumerate every possible inheritance history, accident or forecast effect.

## Build from source

Use **Windows x64 and Node.js 24**. Run these commands from the repository root, which contains `package.json`, `main.cjs`, `src/` and `content/`:

```powershell
npm ci
node node_modules/electron/install.js
npm test
npm run build
```

The portable app is generated under `dist/`. For local development:

```powershell
npm start
```

Dependency installation and the first packaging run need internet access. The GitHub Actions workflow runs the tests, builds the Windows executable and uploads a build artifact with checksums. It does **not** publish a GitHub Release; release publication is a separate maintainer step.

See [CONTRIBUTING.md](CONTRIBUTING.md) for content corrections, translation work and isolated UI testing.

## Licences and credits

Project application code is provided under the **MIT licence**; see `LICENSE` in the repository. This licence does not grant rights in Persona characters, game dialogue, trademarks or illustrations.

The fusion logic and data incorporate work from [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool), whose upstream repository uses the **Unlicense**. Read [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution, the pinned source revision and the separate treatment of fan illustrations and game material.

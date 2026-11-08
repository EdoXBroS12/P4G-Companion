# Third-party notices

The project’s MIT licence applies to its application code. It does not replace the licences or ownership of third-party components, game material or artwork described below.

## Persona 4 Golden and game material

Persona 4 Golden, Persona characters, related designs, game dialogue and associated trademarks belong to ATLUS, SEGA and their respective rights holders. P4G Companion is an unofficial fan project and is not affiliated with, sponsored by or endorsed by ATLUS or SEGA.

Game names and short English dialogue extracts are included to identify the correct in-game choices. Original English dialogue remains distinct from the project’s editorial explanations and translations. No rights in the underlying game material are granted by the application’s MIT licence.

Do not add game executables, decrypted game archives, extracted music, commercial guide scans or player save files to this repository.

## Fan illustrations

The bundled character illustrations are new fan-art compositions created for this project with image-generation assistance. They are not presented as official ATLUS artwork. The characters and underlying designs retain their respective owners’ rights.

Illustrations and other artwork are **not covered by the application code’s MIT licence**. The presence of an asset in this repository is not a grant of rights to the underlying characters, brands or game designs.

The current illustrated cards and PDF guides contain Italian text. The app’s English language setting translates its interface and textual guides; it does not translate text already rendered into those images or PDFs.

## aqiu384 — Megami Tensei Fusion Tools

- Upstream project: [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool).
- Source revision used by the Golden dataset: [`0b207612f6cdcff092e62af16f5c355271a1d892`](https://github.com/aqiu384/megaten-fusion-tool/tree/0b207612f6cdcff092e62af16f5c355271a1d892).
- Upstream licence: **Unlicense**, verified against the locally retained upstream `LICENSE.md`.
- Included adaptations: Golden Persona and skill data, fusion chart, special recipes, inheritance information and the application’s fusion-calculation logic.
- Relevant project paths: `src/fusion_engine.js` and `content/Margaret_Fusioni/data/`.
- Retained licence text: `content/Margaret_Fusioni/sources/LICENZA_DATI_AQIU384.txt` and, where the oracle sources are included, `content/Margaret_Fusioni/sources/upstream/LICENSE.md`.

The Unlicense is the licence declared by the upstream software repository. It does not grant ownership of the Persona characters or other underlying game intellectual property. The full licence text and upstream attribution should accompany redistributed copies of the incorporated material.

The implementation contains documented normalisation and adaptation work. For example, the Golden fusion chart’s `Hang` spelling is normalised to `Hanged`. Validation scope and limitations are recorded with the fusion source notes; an algorithm comparison is not a claim that every possible fusion has been tested in the game.

## Research sources and guide text

The guides compile project-authored instructions and translations from research across sources including RPG Site, Steam Community, GameFAQs, Neoseeker and specialist Golden guides. Source links and disagreements are retained in the bundled source dossiers under `content/sources/` and `content/Margaret_Fusioni/sources/`.

Those websites, their articles and any quoted material retain their own copyrights and terms. Citing a source does not make its entire article part of this project’s MIT licence. Preserve citations when correcting or extending the guide; do not replace them with copied full articles.

## Runtime and build dependencies

The application uses Electron and is packaged with electron-builder. Dependency versions are recorded in `package-lock.json`; dependencies retain their own licences. Electron distributions include their licence files and Chromium third-party notices. Keep those notices in packaged distributions.

The root MIT licence should be read together with these notices rather than treated as a blanket licence for every file or reference in the repository.

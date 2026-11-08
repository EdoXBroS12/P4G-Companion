# Contributing

Corrections, translation improvements and focused usability fixes are welcome. Issues and pull requests may be written in English or Italian.

## Report a gameplay problem

Include the app version, selected language, route or quest ID, in-game date and exact prompt you saw. State whether you are playing Persona 4 Golden and identify the platform. A screenshot with personal information removed can help.

For an ending or quest correction, link the source supporting it and explain the discrepancy. Keep these distinctions explicit:

- Persona 4 Golden versus the original Persona 4.
- An unlock date versus an actual deadline or a conservative planning date.
- An ending variant versus a separately counted route.
- A fusion that creates the species versus one that also carries the required skill.
- Base Persona levels versus current levels used to order triangular fusion ingredients.

Do not attach game save files, exported personal journals, account identifiers or private filesystem paths to a public issue.

## Set up and test

Use Windows x64 and Node.js 24. From the repository root:

```powershell
npm ci
npm test
npm start
```

Use an isolated journal when testing changes to progress or imports:

```powershell
npm start -- --qa-data ./qa/local-profile
```

That profile is separate from the normal application-data folder. Test imports with invented data. Do not use real game saves or overwrite a user’s journal as part of a test.

For changes affecting packaged behaviour:

```powershell
npm run build
```

Test the resulting executable as well as the development app. Unit and content checks do not replace interactive Windows tests of focus, keyboard navigation, overlay placement, imports or closing the window immediately after a change.

## Change content and translations together

Keep canonical IDs, route keys, quest numbers, filenames and source references stable. Preserve original English game dialogue and proper names. Translate explanations; do not invent a new English option to make a sentence sound smoother.

When changing an Italian source string, update the corresponding English dictionary entry and relevant coverage tests. Check quantities, conditions, dates and checkpoint reload instructions in both languages. Use the project’s **DD/MM** date convention consistently.

Where sources disagree, record the disagreement and retain the distinction between a confirmed requirement and a precaution. Critical route changes should be checked against reliable Golden-specific evidence; explain any remaining uncertainty rather than presenting it as settled.

Test shared chapters in every route that uses them. For example, a Golden chapter must not acquire True-only instructions to reload an earlier save after completion. Filtered checklist blocks must retain their original identities when the presentation changes.

## UI and progress changes

Check both languages in the full window and a narrow compact window. Verify readable wrapping, labels, keyboard access, dropdown search, visible focus and popup placement. Keep the original select values and change events compatible with the rest of the app.

Quest states, checklists, notes and configured fusion levels belong to a journal branch; ending history is shared. Exercise branch copying, switching, importing and exporting. Verify that the latest change survives an immediate close and that an invalid progress file can fall back to a valid backup.

Preserve the local-data design: ordinary guide and calculator use should work without a network connection. Do not introduce game-process injection, game-save editing or automatic collection of player data as an incidental part of a UI change.

## Keep public commits clean

Commit source and the assets required to build the app. Do not commit `node_modules/`, compiled executables, QA profiles, screenshots containing personal data, journal exports, credentials or local runtime paths. Check staged files before opening a pull request; ignore rules do not remove data that was already tracked.

Respect [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Application-code contributions must be compatible with MIT; third-party software and artwork retain their separate terms. Keep upstream fusion attribution and licence notices intact.

## Pull requests and releases

Describe the problem, resulting behaviour and checks performed. Include before/after screenshots for layout changes, using an invented journal. Keep gameplay corrections and unrelated visual changes separate when possible.

The build workflow uploads a portable Windows artifact and its checksums for review. It does not publish releases. A maintainer checks the staged contents, test results, bilingual presentation, notices and executable before manually attaching release files and writing release notes.

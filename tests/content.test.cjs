// Content integration checks. These read the guide/app only and never inspect
// or modify Persona 4 Golden save files or the user's Companion progress.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const vm = require('node:vm');

const APP = path.resolve(__dirname, '..');
const GUIDE = path.join(APP, 'content');
const CONTENT = path.join(APP, 'content');
const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const source = name => json(path.join(GUIDE, 'data', name));
const stable = value => JSON.parse(JSON.stringify(value));
const sorted = values => [...values].sort((a, b) => typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
const unique = (values, label) => assert.equal(new Set(values).size, values.length, `${label}: duplicate ID`);
const mapPromise = import(pathToFileURL(path.join(APP, 'src/content-map.js')).href);
const contextPromise = import(pathToFileURL(path.join(APP, 'src/route-context.js')).href);
const sourceFiles = ['quests.json', 'save_plan.json', 'endings_research.json', 'guide_content.json', 'manifest.json', 'preparation.json'];
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originalHashes = Object.fromEntries(sourceFiles.map(name => [name, hash(path.join(GUIDE, 'data', name))]));

function existsInside(base, relative, label) {
  assert.equal(typeof relative, 'string', `${label}: missing path`);
  const file = path.resolve(base, relative);
  assert.ok(file.startsWith(path.resolve(base) + path.sep), `${label}: path escapes its content root`);
  assert.ok(fs.existsSync(file), `${label}: missing ${relative}`);
  assert.ok(fs.statSync(file).isFile(), `${label}: expected a regular file (${relative})`);
  return file;
}

test('the app keeps the 69 canonical quests without altering gameplay fields', () => {
  const canonical = source('quests.json');
  const packaged = json(existsInside(CONTENT, 'data/quests.json', 'quest data'));
  assert.deepEqual(packaged, canonical, 'bundled quests differ from the verified source');
  assert.equal(packaged.quests.length, 69);
  assert.deepEqual(sorted(packaged.quests.map(q => q.id)), Array.from({ length: 69 }, (_, i) => i + 1));
  for (const q of packaged.quests) {
    assert.equal(q.checked, false, `Q${q.id}: never infer completion from a cleared dungeon`);
    for (const field of ['name_en', 'name_it', 'availability_note', 'period', 'npc', 'location', 'objective', 'deadline_note', 'reward', 'recoverability']) {
      assert.ok(typeof q[field] === 'string' && q[field].length, `Q${q.id}: missing ${field}`);
    }
    assert.ok(Array.isArray(q.prerequisites) && Array.isArray(q.notes) && q.source_urls.length, `Q${q.id}: missing prerequisites/notes/sources`);
  }
  assert.deepEqual(packaged.quests.filter(q => q.available_from === null).map(q => q.id), [8, 9, 10, 11, 12, 13, 14, 15]);
  assert.match(packaged.quests.find(q => q.id === 5).deadline_note, /PRUDENZIALE/);
  assert.deepEqual(packaged.quests.filter(q => q.deadline === '16/11').map(q => q.id), [30, 35, 36, 43, 52, 53]);
  for (const q of packaged.quests.filter(q => q.deadline === '16/11')) assert.match(q.deadline_note, /OPERATIVO SICURO/);
});

test('quest period navigation covers each numeric ID exactly once and uses its real period', async () => {
  const m = await mapPromise, quests = source('quests.json').quests;
  const ids = m.QUEST_PERIOD_GROUPS.flatMap(group => group.questIds);
  unique(ids, 'quest period groups');
  assert.deepEqual(sorted(ids), quests.map(q => q.id));
  assert.deepEqual(m.QUEST_SECTION_IDS, quests.map(q => `quest_${String(q.id).padStart(2, '0')}`));
  for (const group of m.QUEST_PERIOD_GROUPS) {
    assert.deepEqual(sorted(group.questIds), sorted(quests.filter(q => q.period === group.id).map(q => q.id)), `${group.id}: wrong period mapping`);
    for (const id of group.questIds) assert.ok(group.sectionIds.includes(`quest_${String(id).padStart(2, '0')}`));
  }
});

test('all seven ending cards match canonical identities, colours, completion and return checkpoints', async () => {
  const m = await mapPromise, verified = source('endings_research.json').endings;
  assert.equal(m.ENDING_CARDS.length, 7);
  unique(m.ENDING_CARDS.map(e => e.id), 'ending cards');
  unique(m.ENDING_CARDS.map(e => e.researchId), 'canonical ending IDs');
  assert.deepEqual(sorted(m.ENDING_CARDS.map(e => e.researchId)), sorted(verified.map(e => e.id)));
  assert.deepEqual(m.ROUTE_ORDER, ['bad3', 'complice', 'normal', 'true', 'golden']);
  assert.deepEqual(m.ALL_ENDING_ORDER, ['bad1', 'bad2', ...m.ROUTE_ORDER]);
  const checkpointIds = new Set(source('save_plan.json').map(s => s.id));
  for (const card of m.ENDING_CARDS) {
    const ending = verified.find(e => e.id === card.researchId);
    assert.equal(card.color, ending.color, `${card.id}: wrong route colour`);
    assert.equal(card.completed, ending.status === 'GIÀ COMPLETATO', `${card.id}: incorrect initial completion`);
    assert.deepEqual(card.characters, ending.characters, `${card.id}: character mapping changed`);
    assert.ok(checkpointIds.has(card.startCheckpoint), `${card.id}: nonexistent start checkpoint`);
    for (const id of card.checkpointIds) assert.ok(checkpointIds.has(id), `${card.id}: nonexistent checkpoint ${id}`);
    const expectedReload = card.researchId === 'golden' ? null : ending.reload_after;
    assert.equal(card.reload.checkpointId, expectedReload, `${card.id}: incorrect reload after ending`);
    assert.ok(card.reload.note && card.prerequisites.length && card.sectionIds.length);
    assert.equal(m.ENDING_BY_ID[card.id], card);
  }
  assert.equal(m.ENDING_BY_ID.complice.researchId, 'accomplice');
  assert.equal(m.ENDING_BY_ID.true.reload.checkpointId, 'C');
  assert.equal(m.ENDING_BY_ID.normal.reload.checkpointId, 'D-T');
  assert.ok(m.ENDING_BY_ID.golden.checkpointIds.includes('D-G'));
});

test('checkpoint IDs, protected slots and slot assignments match the verified save plan', async () => {
  const m = await mapPromise, saves = source('save_plan.json');
  assert.deepEqual(sorted(Object.keys(m.CHECKPOINT_SUMMARIES)), sorted(saves.map(s => s.id)));
  unique(saves.map(s => s.slot), 'save plan slots');
  for (const original of saves) {
    const summary = m.CHECKPOINT_SUMMARIES[original.id];
    assert.equal(summary.id, original.id);
    assert.equal(summary.slot, original.slot, `${original.id}: wrong slot`);
    assert.equal(summary.color, original.color, `${original.id}: wrong colour`);
    assert.ok(summary.loss && summary.when && summary.where, `${original.id}: missing save/loss instructions`);
  }
  assert.deepEqual(m.SAVE_POLICY.protectedSlots, source('endings_research.json').run.protect_slots);
  for (const save of saves) assert.ok(!m.SAVE_POLICY.protectedSlots.includes(save.slot), `${save.id}: would overwrite an original save`);
  assert.notEqual(m.CHECKPOINT_SUMMARIES['D-T'].slot, m.CHECKPOINT_SUMMARIES['D-G'].slot);
  assert.equal(m.SAVE_POLICY.liveCheckpoint, 'LIVE');
  assert.equal(m.SAVE_POLICY.clearCheckpoint, 'CLEAR');
});

test('every editorial reference resolves to an existing, unchanged guide section or asset', async () => {
  const m = await mapPromise;
  const original = source('guide_content.json');
  const bundled = json(existsInside(CONTENT, 'data/guide_content.json', 'guide content'));
  assert.deepEqual(bundled, original, 'canonical dialogue and procedures must not be rewritten during app bundling');
  const sections = new Set(bundled.map(s => s.id));
  unique(bundled.map(s => s.id), 'guide sections');
  const refs = [...m.ENDING_CARDS, ...m.CONTENT_GROUPS, ...m.QUEST_PERIOD_GROUPS, m.SAVE_POLICY];
  for (const entry of refs) {
    for (const id of entry.sectionIds || []) assert.ok(sections.has(id), `${entry.id || 'save policy'}: nonexistent section ${id}`);
    if (entry.artFile) existsInside(CONTENT, `assets/${entry.artFile}`, `${entry.id}: illustration`);
    for (const dataFile of entry.dataSources || []) {
      const local = json(existsInside(CONTENT, `data/${dataFile}`, `${entry.id}: data source`));
      assert.deepEqual(local, source(dataFile), `${entry.id}: altered source ${dataFile}`);
    }
    for (const module of entry.externalModules || []) existsInside(CONTENT, `${module.directory}/${module.contentFile}`, `${entry.id}: external module`);
  }
});

test('all main and Margaret manifest images exist and reference real sections', () => {
  for (const relative of ['', 'Margaret_Fusioni']) {
    const base = path.join(CONTENT, relative), canonical = path.join(GUIDE, relative);
    const manifest = json(existsInside(base, 'data/manifest.json', `${relative || 'main'} manifest`));
    assert.deepEqual(manifest, json(path.join(canonical, 'data/manifest.json')), `${relative}: manifest drift`);
    const sections = new Set(json(path.join(base, 'data/guide_content.json')).map(s => s.id));
    unique(manifest.map(p => p.page), `${relative}: page numbers`);
    unique(manifest.map(p => p.file), `${relative}: image filenames`);
    for (const page of manifest) {
      assert.ok(sections.has(page.section), `${relative}/${page.file}: nonexistent section ${page.section}`);
      existsInside(base, `images/${page.file}.png`, `${relative}: page ${page.page}`);
      assert.ok(page.part >= 1 && page.part <= page.parts, `${page.file}: invalid part numbering`);
    }
  }
});

test('Margaret data and engine remain the verified Golden version', () => {
  const canonical = path.join(GUIDE, 'Margaret_Fusioni');
  const bundled = path.join(CONTENT, 'Margaret_Fusioni');
  for (const name of ['fusion_data.json', 'guide_content.json', 'manifest.json', 'margaret_recipes_verified.json']) {
    assert.deepEqual(json(existsInside(bundled, `data/${name}`, `Margaret ${name}`)), json(path.join(canonical, 'data', name)), `Margaret ${name}: source changed`);
  }
  const fusion = json(path.join(bundled, 'data/fusion_data.json'));
  assert.equal(fusion.commit, '0b207612f6cdcff092e62af16f5c355271a1d892');
  assert.equal(Object.keys(fusion.demons).length, 205);
  assert.equal(fusion.targets.length, 9);
  const required = source('margaret_recipes_verified.json').targets;
  assert.deepEqual(fusion.targets.map(t => [t.rank, t.name, t.skill]), required.map(t => [t.rank, t.name, t.skill]));
  const engine = existsInside(APP, 'src/fusion_engine.js', 'app fusion engine');
  assert.equal(hash(engine), '265c546520f65a4bcbaddfcbc106dbdcdbfc05306aaa980e9208b7290f41de9a', 'the app must reuse the QA-verified fusion engine');
});

test('local HTML script, stylesheet and image references resolve without escaping the app', () => {
  const htmlFile = existsInside(APP, 'src/index.html', 'app entry point');
  const html = read(htmlFile);
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|data:|#)/i.test(ref)) continue;
    existsInside(APP, path.relative(APP, path.resolve(path.dirname(htmlFile), decodeURIComponent(ref.split(/[?#]/)[0]))), `index.html ${ref}`);
  }
  assert.match(html, /lang=["']it["']/);
});

test('loading app mappings and running content tests leave canonical data unchanged', async () => {
  await mapPromise;
  for (const [name, before] of Object.entries(originalHashes)) assert.equal(hash(path.join(GUIDE, 'data', name)), before, `${name}: test/map import modified canonical source`);
});

test('native progress persistence preserves separate profiles and recovers a valid backup', () => {
  // Exercise the actual persistence functions with an in-memory filesystem.
  // No Electron window, game save, userData file or shell process is touched.
  const text = read(path.join(APP, 'main.cjs'));
  const end = text.indexOf('function windowState(');
  assert.ok(end > 0, 'locate the persistence module before window setup');
  const files = new Map(), writes = [], userData = path.join(APP, '__qa_memory_only__');
  const storeFile = path.join(userData, 'progress.json');
  const mockFs = {
    readFileSync(file) { if (!files.has(file)) throw Error('ENOENT'); return files.get(file); },
    existsSync: file => files.has(file),
    mkdirSync() {},
    writeFileSync(file, value) { writes.push(['write', file]); files.set(file, value); },
    copyFileSync(from, to) { assert.ok(files.has(from)); writes.push(['copy', from, to]); files.set(to, files.get(from)); },
    renameSync(from, to) { assert.ok(files.has(from)); writes.push(['rename', from, to]); files.set(to, files.get(from)); files.delete(from); },
  };
  const context = {
    __dirname: APP,
    process: { argv: [] },
    module: { exports: {} },
    require(name) {
      if (name === 'electron') return { app: { getPath: () => userData } };
      if (name === 'fs') return mockFs;
      if (name === 'path') return path;
      throw Error(`unexpected module in persistence: ${name}`);
    },
  };
  vm.runInNewContext(text.slice(0, end) + '\nmodule.exports={initial,validate,readState,saveState};', context);
  const api = context.module.exports;
  const initial = stable(api.initial());
  assert.deepEqual(initial.endings, {});
  assert.equal(initial.settings.personalContext, false);
  assert.deepEqual(initial.profiles.comune.quests, {});
  assert.equal(api.validate(initial), true);
  for (const invalid of [null, {}, { ...initial, settings: null }, { ...initial, profiles: { comune: {} } }, { ...initial, activeProfile: 'missing' }]) {
    assert.equal(Boolean(api.validate(invalid)), false, 'reject incomplete imported profile data');
  }
  const progress = stable(initial);
  progress.profiles.comune.quests['5'] = true;
  progress.profiles.golden = { name: 'Golden', checks: {}, quests: { '5': false }, notes: { 'quest_05': 'Da ripetere dopo la ricarica' } };
  progress.endings.true = true;
  progress.activeProfile = 'golden';
  api.saveState(progress);
  assert.deepEqual(stable(api.readState()), progress);
  assert.equal(api.readState().profiles.comune.quests['5'], true);
  assert.equal(api.readState().profiles.golden.quests['5'], false);
  assert.equal(api.readState().endings.true, true, 'ending history remains independent of the selected quest profile');
  assert.equal(files.has(storeFile + '.tmp'), false, 'a successful save renames its temporary file');
  assert.ok(writes.some(([op, file]) => op === 'write' && file === storeFile + '.tmp'));
  assert.ok(writes.some(([op, from, to]) => op === 'rename' && from === storeFile + '.tmp' && to === storeFile));
  files.set(storeFile + '.bak', JSON.stringify(progress));
  for (const broken of ['{unfinished', JSON.stringify({ ...initial, profiles: { comune: {} } })]) {
    files.set(storeFile, broken);
    assert.deepEqual(stable(api.readState()), progress, 'invalid primary must fall back to valid backup');
  }
  files.delete(storeFile + '.bak');
  assert.deepEqual(stable(api.readState()), initial, 'two invalid or missing copies yield the safe initial state');
  for (const write of writes) for (const filename of write.slice(1)) assert.ok(filename.startsWith(userData + path.sep), 'all persistence writes stay within simulated userData');
});

test('Golden uses D-G/08 and Golden clear data in the shared final-investigation chapter', async () => {
  const { contextSection } = await contextPromise;
  const original = source('guide_content.json').find(s => s.id === 'true');
  const golden = contextSection(original, 'golden');
  assert.match(golden.title, /Golden Ending/);
  assert.equal(golden.color, 'golden');
  const opening = golden.blocks[0];
  assert.match(opening.label, /D-G.*SLOT 08/);
  assert.match(opening.text, /Hollow Forest.*completata/);
  assert.doesNotMatch(opening.text, /ricarica D-T|rifiutato la ricerca/i);
  const completed = golden.blocks.filter(b => /COMPLETATO/.test(b.label || ''));
  assert.equal(completed.length, 1);
  assert.match(completed[0].label, /^GOLDEN COMPLETATO/);
  assert.match(completed[0].text, /epilogo/);
  assert.match(completed[0].text, /CLEAR 12/);
  assert.doesNotMatch(completed[0].text, /slot 14|poi carica C|RICARICA C|torna al 2 gennaio/i);
  assert.ok(!golden.blocks.some(b => /TRUE COMPLETATO|RICARICA C/.test(b.label || '')));
  const warning = golden.blocks.find(b => b.label === 'Attenzione' && b.text.startsWith('Yes chiude'));
  assert.match(warning.text, /ricarica D-G, slot 08/);
  assert.doesNotMatch(warning.text, /D-T/);
  // The actual investigation choices are shared unchanged, in the same order.
  assert.deepEqual(golden.blocks.filter(b => b.en).map(b => [b.en, b.it]), original.blocks.filter(b => b.en).map(b => [b.en, b.it]));
  const trueRoute = contextSection(original, 'true');
  assert.match(trueRoute.blocks[0].text, /D-T slot 07/);
  assert.ok(trueRoute.blocks.some(b => /^TRUE COMPLETATO.*RICARICA C/.test(b.label || '')));
});

test('January 2 shows only the decisive response for the selected Golden or temporary route', async () => {
  const { contextSection } = await contextPromise;
  const original = source('guide_content.json').find(s => s.id === '02_gennaio');
  const refusal = "I'm not going if it's dangerous!";
  const acceptance = "I don't care about danger. I'll go.";
  for (const route of ['golden', 'true', 'normal']) {
    const output = contextSection(original, route), golden = route === 'golden';
    const choices = output.blocks.filter(b => b.en).map(b => b.en);
    assert.ok(choices.includes('Why did she leave?'));
    assert.ok(choices.includes('Where did she go?'));
    assert.ok(choices.includes(golden ? acceptance : refusal), `${route}: missing required response`);
    assert.ok(!JSON.stringify(output).includes(golden ? refusal : acceptance), `${route}: opposite decisive response is still visible`);
    const branches = output.blocks.filter(b => /^RAMO (?:FINALE|TEMPORANEO)/.test(b.label || ''));
    assert.equal(branches.length, 1, `${route}: exactly one actionable branch`);
    assert.match(branches[0].label, golden ? /^RAMO FINALE/ : /^RAMO TEMPORANEO/);
    if (golden) assert.ok(!output.blocks.some(b => b.label === 'Non riattivare la ricerca'));
    else assert.ok(output.blocks.some(b => b.label === 'Non riattivare la ricerca'));
  }
});

test('December 5 presents one actionable branch and never tells Bad 3 to accuse Adachi', async () => {
  const { contextSection } = await contextPromise;
  const original = source('guide_content.json').find(s => s.id === '05_dicembre');
  for (const [route, letter] of [['bad3', 'A'], ['complice', 'B'], ['normal', 'C'], ['true', 'C'], ['golden', 'C']]) {
    const output = contextSection(original, route);
    const branches = output.blocks.filter(b => /^RAMO [ABC]\b/.test(b.label || ''));
    assert.equal(branches.length, 1, `${route}: leaked competing branch`);
    assert.match(branches[0].label, new RegExp(`^RAMO ${letter}\\b`));
    assert.ok(!output.blocks.some(b => b.label === 'Le tre frecce'), `${route}: generic branch diagram instruction should not replace selected-route instructions`);
    if (route === 'bad3') {
      assert.ok(!output.blocks.some(b => b.label === 'Il nome corretto'));
      assert.match(branches[0].text, /^Non scegliere Tohru Adachi:/);
      assert.match(branches[0].text, /nome diverso.*tre tentativi/);
      assert.match(branches[0].text, /RICARICA B, slot 05/);
      assert.ok(!output.blocks.some(b => b.en === 'Tohru Adachi'));
    } else {
      assert.ok(output.blocks.some(b => b.label === 'Il nome corretto'));
      assert.match(branches[0].text, /Tohru Adachi/);
      assert.match(branches[0].text, route === 'complice' ? /Protect Adachi/ : /Tell friends about Adachi/);
    }
  }
  assert.deepEqual(contextSection(original, 'accomplice'), contextSection(original, 'complice'), 'canonical research ID and UI ID map to the same branch');
});

test('route context is a pure copy and preserves checklist identities when filtering shared sections', async () => {
  const { contextSection } = await contextPromise;
  const guide = source('guide_content.json');
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  for (const id of ['03_dicembre', '05_dicembre', '02_gennaio', 'true', 'golden']) {
    const original = freeze(guide.find(s => s.id === id)), before = JSON.stringify(original);
    for (const route of ['bad1', 'bad2', 'bad3', 'complice', 'normal', 'true', 'golden']) {
      const output = contextSection(original, { id: route });
      assert.notEqual(output, original);
      assert.notEqual(output.blocks, original.blocks);
      for (const block of output.blocks.filter(b => b.check)) {
        assert.ok(Number.isInteger(block.sourceBlockIndex), `${route}/${id}: lost stable checklist index`);
        const sourceBlock = original.blocks[block.sourceBlockIndex];
        assert.ok(sourceBlock?.check, `${route}/${id}: checklist points at an unrelated source block`);
        assert.equal(block.label, sourceBlock.label);
      }
      output.blocks[0].text = 'Only this output copy is changed by the test.';
      assert.equal(JSON.stringify(original), before, `${route}/${id}: source was mutated`);
    }
    assert.deepEqual(contextSection(original), stable(original), `${id}: general view must retain all source branches`);
    assert.deepEqual(contextSection(original, 'unknown'), stable(original));
  }
  for (const [name, before] of Object.entries(originalHashes)) assert.equal(hash(path.join(GUIDE, 'data', name)), before, `${name}: route adapter altered a canonical file`);
});

// Regression checks for the guided reader. Read-only: no game/diary writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');

const APP = path.resolve(__dirname, '..');
const DATA = path.join(APP, 'content/data');
const dataFiles = ['guide_content.json', 'endings_research.json', 'save_plan.json'];
const hash = name => createHash('sha256').update(fs.readFileSync(path.join(DATA, name))).digest('hex');
const beforeHashes = Object.fromEntries(dataFiles.map(name => [name, hash(name)]));
const read = name => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
const guide = read('guide_content.json');
const endings = read('endings_research.json');
const byId = Object.fromEntries(guide.map(section => [section.id, section]));
const originalGuide = JSON.stringify(guide);
const deepFreeze = object => {
  if (object && typeof object === 'object' && !Object.isFrozen(object)) {
    Object.freeze(object);
    Object.values(object).forEach(deepFreeze);
  }
  return object;
};
deepFreeze(guide);
const load = name => import(pathToFileURL(path.join(APP, 'src', name)).href);
const modules = Promise.all([load('journey-model.js'), load('route-context.js'), load('content-map.js')]);
const text = blocks => blocks.map(block => [block.label, block.text, block.en, block.it].filter(Boolean).join(' ')).join('\n');
const english = blocks => blocks.filter(block => block.en).map(block => block.en);

// Same boundary as the reader factory: select original indices in their given
// order, preserve their source identity, then apply the pure route adaptation.
function selectStage(stage, routeId, contextSection) {
  const canonical = byId[stage.sectionId];
  assert.ok(canonical, `${stage.id}: missing source section`);
  const selected = stage.blockIndices ? {
    ...canonical,
    blocks: stage.blockIndices.map(index => {
      assert.ok(Number.isInteger(index) && index >= 0 && index < canonical.blocks.length,
        `${stage.id}: undefined source block ${index}`);
      return { ...canonical.blocks[index], sourceBlockIndex: index };
    }),
  } : canonical;
  return contextSection(selected, routeId);
}

function stageFor(journey, routeId, sectionId) {
  const stage = journey.routeGuideSteps[routeId].find(item => item.sectionId === sectionId);
  assert.ok(stage, `${routeId}: missing stage ${sectionId}`);
  return stage;
}

test('all 7 routes and 22 reader stages retain canonical section order and valid labels', async () => {
  const [journey, , map] = await modules;
  assert.deepEqual(Object.keys(journey.routeGuideSteps), map.ENDING_CARDS.map(route => route.id));
  assert.equal(Object.values(journey.routeGuideSteps).flat().length, 22);
  const ids = Object.values(journey.routeGuideSteps).flat().map(stage => stage.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const route of map.ENDING_CARDS) {
    const stages = journey.routeGuideSteps[route.id];
    assert.deepEqual(stages.map(stage => stage.sectionId), route.sectionIds, `${route.id}: order changed`);
    for (const stage of stages) {
      for (const field of ['id', 'title', 'sectionId', 'why', 'checkpointHint', 'nextLabel']) {
        assert.ok(typeof stage[field] === 'string' && stage[field].trim(), `${stage.id}: missing ${field}`);
      }
      assert.equal(stage.title, journey.routeChapterLabels[route.id][stage.sectionId]);
    }
  }
  assert.equal(journey.routeGuideSteps.bad1.length, 1);
  assert.equal(journey.routeGuideSteps.bad2.length, 1);
});

test('every stage selects defined source blocks, preserves ordered indices and leaves frozen sources intact', async () => {
  const [journey, { contextSection }] = await modules;
  for (const [routeId, stages] of Object.entries(journey.routeGuideSteps)) {
    for (const stage of stages) {
      const result = selectStage(stage, routeId, contextSection);
      assert.notEqual(result, byId[stage.sectionId], `${stage.id}: should return a clone`);
      assert.ok(result.blocks.length, `${stage.id}: empty stage`);
      assert.ok(result.blocks.every(block => block && typeof block.label === 'string'));
      if (stage.blockIndices) {
        assert.equal(new Set(stage.blockIndices).size, stage.blockIndices.length, `${stage.id}: repeated source index`);
        assert.deepEqual(result.blocks.map(block => block.sourceBlockIndex), stage.blockIndices,
          `${stage.id}: index order or identity changed`);
      }
    }
  }
  assert.equal(JSON.stringify(guide), originalGuide);
});

test('late stages no longer restart their route and the save warning precedes the Normal choice', async () => {
  const [journey, { contextSection }] = await modules;
  const complice = selectStage(stageFor(journey, 'complice', 'complice'), 'complice', contextSection);
  assert.equal(complice.blocks[0].label, 'Salto della storia');
  assert.ok(!complice.blocks.some(block => block.label === 'Condizioni iniziali' || block.label === '5 dicembre • primo bivio'));
  const normal = selectStage(stageFor(journey, 'normal', 'normal'), 'normal', contextSection);
  assert.deepEqual(normal.blocks.map(block => block.sourceBlockIndex), [9, 4, 5, 6, 7, 8, 10]);
  assert.equal(normal.blocks[0].label, 'SAVE D-T • SLOT 07');
  assert.ok(!normal.blocks.some(block => ['Passaggio 1', 'Passaggio 2', 'Passaggio 3'].includes(block.label)));
  assert.match(normal.blocks.find(block => block.label === 'Passaggio 6').text, /scegli Yes \(Sì\)/);
  assert.match(text(normal.blocks), /RICARICA D-T/);
  for (const routeId of ['normal', 'true', 'golden']) {
    const greetings = selectStage(stageFor(journey, routeId, 'saluti'), routeId, contextSection);
    assert.deepEqual(greetings.blocks.map(block => block.sourceBlockIndex), [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.ok(!greetings.blocks.some(block => block.label === 'Dopo l’ultimo saluto'));
  }
});

test('hospital stages retain exactly the mandatory six answers or the chosen already-seen bad ending', async () => {
  const [journey, { contextSection }] = await modules;
  const mandatory = [
    'Wait a second here...', "We're missing something.", "Namatame's true feelings.",
    "Something's bothering me.", "We're missing something...", 'Calm the hell down!',
  ];
  assert.deepEqual(endings.hospital_dec3.choices.map(choice => choice.en), mandatory);
  for (const routeId of ['bad3', 'complice']) {
    const section = selectStage(stageFor(journey, routeId, '03_dicembre'), routeId, contextSection);
    assert.deepEqual(english(section.blocks), mandatory);
    assert.ok(!section.blocks.some(block => /^Bad [12] • già visto/.test(block.label)));
  }
  const bad1 = selectStage(stageFor(journey, 'bad1', '03_dicembre'), 'bad1', contextSection);
  const bad2 = selectStage(stageFor(journey, 'bad2', '03_dicembre'), 'bad2', contextSection);
  assert.deepEqual(english(bad1.blocks), ['Push the bastard in.', 'Do it already.']);
  assert.deepEqual(english(bad2.blocks), ['Wait a second here...', 'Leave him for the police.']);
  for (const section of [bad1, bad2]) {
    assert.match(text(section.blocks), /RICARICA A/);
    assert.ok(!section.blocks.some(block => /^Passo [1-6]/.test(block.label)));
  }
});

test('December 5 shows one intended branch and Accomplice keeps every final English choice', async () => {
  const [journey, { contextSection }] = await modules;
  for (const [routeId, branch] of [['bad3', 'A'], ['complice', 'B'], ['normal', 'C']]) {
    const section = selectStage(stageFor(journey, routeId, '05_dicembre'), routeId, contextSection);
    const branches = section.blocks.filter(block => /^RAMO /.test(block.label));
    assert.equal(branches.length, 1);
    assert.ok(branches[0].label.startsWith(`RAMO ${branch}`));
    assert.ok(!section.blocks.some(block => block.label === 'Le tre frecce'));
    if (routeId === 'bad3') {
      assert.ok(!section.blocks.some(block => block.label === 'Il nome corretto'));
      assert.match(branches[0].text, /Non scegliere Tohru Adachi/);
      assert.match(branches[0].text, /tre tentativi/);
      assert.match(branches[0].text, /RICARICA B/);
    }
  }
  const final = selectStage(stageFor(journey, 'complice', 'complice'), 'complice', contextSection);
  const expected = ['Go see Adachi', 'Did you do it?', 'No.', 'No.', "I'm on your side.", 'Yes.', 'Set fire to the letter'];
  assert.deepEqual(english(final.blocks), expected);
  assert.deepEqual(expected.slice(1), endings.accomplice.choices.map(choice => choice.en));
  assert.match(text(final.blocks), /filmato aggiuntivo/);
  assert.match(text(final.blocks), /RICARICA SAVE B/);
});

test('January keeps only the correct action, with opposite branches absent from the active reader', async () => {
  const [journey, { contextSection }] = await modules;
  for (const routeId of ['normal', 'true', 'golden']) {
    const section = selectStage(stageFor(journey, routeId, '02_gennaio'), routeId, contextSection);
    const positive = "I don't care about danger. I'll go.";
    const negative = "I'm not going if it's dangerous!";
    assert.deepEqual(english(section.blocks), ['Why did she leave?', 'Where did she go?', routeId === 'golden' ? positive : negative]);
    if (routeId === 'golden') {
      assert.ok(!section.blocks.some(block => block.label.startsWith('RAMO TEMPORANEO')));
      assert.ok(!section.blocks.some(block => ['Non riattivare la ricerca', 'Perché Marie MAX non impedisce True'].includes(block.label)));
    } else {
      assert.ok(!section.blocks.some(block => block.label.startsWith('RAMO FINALE')));
      assert.match(text(section.blocks), /Marie MAX non è un requisito/);
    }
  }
});

test('True and Golden retain every final-investigation answer, Junes fallback and boss instructions', async () => {
  const [journey, { contextSection }] = await modules;
  const expected = [
    'No', 'Yes', 'There is something...', 'My uncle, Dojima.',
    'I want to talk to you', 'The weird attendant?', 'I looked sick?', 'It might be important',
    "Isn't this where I first...?", 'Do you know Namatame?', 'Did those two come here?',
    'Did you do anything to them?', 'What did you do to me?', 'Did you give me the power?',
  ];
  for (const routeId of ['true', 'golden']) {
    const section = selectStage(stageFor(journey, routeId, 'true'), routeId, contextSection);
    assert.deepEqual(section.blocks.map(block => block.sourceBlockIndex), Array.from({ length: 39 }, (_, i) => i + 2));
    assert.deepEqual(english(section.blocks), expected);
    assert.match(text(section.blocks), /There is something\./);
    assert.match(text(section.blocks), /Orb of Sight/);
    assert.match(text(section.blocks), /Goho-M/);
    assert.match(text(section.blocks), /Myriad Truths/);
    assert.ok(section.blocks.some(block => block.label === 'Solo se compare questa schermata'));
    assert.ok(section.blocks.some(block => block.label === 'Margaret • facoltativo'));
    assert.ok(!section.blocks.some(block => /^Riparti da D-/.test(block.label)));
  }
});

test('Golden retains all Hollow Forest content once and preserves D-G, final epilogue and CLEAR 12 across stages', async () => {
  const [journey, { contextSection }] = await modules;
  const forest = selectStage(stageFor(journey, 'golden', 'golden'), 'golden', contextSection);
  assert.deepEqual(forest.blocks.map(block => block.sourceBlockIndex), Array.from({ length: 23 }, (_, i) => i + 6));
  assert.equal(forest.blocks[0].label, 'Gennaio • conserva qui i progressi');
  assert.equal(forest.blocks.at(-1).label, 'Dopo Hollow Forest');
  const range = journey.journeySourceSelections['golden-golden'];
  assert.equal(range.firstIndex, 6);
  assert.equal(range.firstLabel, byId.golden.blocks[6].label);
  assert.equal(range.lastIndex, 28);
  assert.equal(range.lastLabel, byId.golden.blocks[28].label);
  assert.ok(!forest.blocks.some(block => block.label.startsWith('Ricarica C') || block.label === 'Margaret • inizio' || block.label === 'Accetta la ricerca'));
  assert.ok(!forest.blocks.some(block => block.label.startsWith('Tappa 01')));
  for (const anchor of ['E-pre • SLOT 13', 'E • SLOT 09', 'Acquisti e rientri', 'Hollow Forest • piano 10', 'Boss • fase 4']) {
    assert.ok(forest.blocks.some(block => block.label === anchor), `missing ${anchor}`);
  }
  const goldenStages = journey.routeGuideSteps.golden;
  const all = goldenStages.flatMap(stage => selectStage(stage, 'golden', contextSection).blocks);
  assert.equal(english(all).filter(answer => answer === "I don't care about danger. I'll go.").length, 1,
    'Golden must retain its positive January decision exactly once across the full journey');
  const combined = text(all) + '\n' + goldenStages.map(stage => [stage.why, stage.checkpointHint].join(' ')).join('\n');
  assert.match(combined, /D-G, slot 08/);
  assert.match(combined, /prima dell’ultimo saluto/);
  assert.match(combined, /Hollow Forest.*completata|completata.*Hollow Forest/);
  assert.match(combined, /epilogo estivo aggiuntivo/);
  assert.match(combined, /CLEAR 12/);
  assert.match(combined, /Nessuna ricarica a C è richiesta/);
  assert.ok(!all.some(block => block.label.startsWith('TRUE COMPLETATO')));
  const actualFinal = selectStage(stageFor(journey, 'golden', 'true'), 'golden', contextSection);
  assert.ok(actualFinal.blocks.some(block => block.label === 'GOLDEN COMPLETATO • CONSERVA IL RAMO'));
  assert.equal(all.filter(block => block.label === 'Tappa 07 • Shopping District South → distributore Moel, a sinistra della libreria').length, 1);
});

test('reader and manual diary help never claim to load or create Steam saves', async () => {
  const [journey] = await modules;
  assert.equal(journey.profileHelpCopy.label, 'Ramo del diario');
  assert.match(journey.profileHelpCopy.explanation, /non carica uno slot/);
  assert.match(journey.checkpointHelpCopy.explanation, /conferma manuale/);
  assert.match(journey.checkpointHelpCopy.explanation, /non crea, copia, verifica o carica/);
  assert.match(journey.journeyHelpCopy.readerProgress, /non ciò che hai già fatto nel gioco/);
});

test.after(() => {
  assert.equal(JSON.stringify(guide), originalGuide, 'in-memory canonical content was modified');
  for (const name of dataFiles) assert.equal(hash(name), beforeHashes[name], `${name}: canonical file changed during the read-only tests`);
});

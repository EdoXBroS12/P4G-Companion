// Tests the real session-plan module. No Steam files, user diary or native window access.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const modulePromise = import(pathToFileURL(path.join(ROOT, 'src/overlay-plan.js')).href);
const questData = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/data/quests.json'), 'utf8'));
const questEnglish = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/quests.en.json'), 'utf8'));
const overlayEnglish = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/overlay.en.json'), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const profile = () => ({ name: 'Branch', checks: { 'save:C': true }, quests: { 1: 'active', 2: 'done' }, notes: { 'ending:golden': 'My note' }, fusionLevels: { Anzu: 19 } });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function views(api, current, options = {}) {
  let language = options.language || 'it';
  const dictionary = { ...questEnglish, ...overlayEnglish, 'Capitolo campione': 'Sample chapter', 'Prima tappa': 'First stage' };
  const translate = text => language === 'en' ? dictionary[text] || text : text;
  const context = {
    e: text => escape(translate(text)), rawEsc: escape, t: translate,
    asset: name => '../content/assets/' + name,
    profile: () => current,
    D: { quests: questData },
    byId: { sample: { title: 'Capitolo campione' } },
    windowMode: { compact: true, pinned: true, mousePassthrough: false },
    ...options,
  };
  return { ui: api.createOverlayPlan(context), language: next => { language = next; }, context };
}

test('an existing diary gains an empty plan without altering its progress; migration is idempotent', async () => {
  const api = await modulePromise;
  const current = profile(), before = clone(current);
  assert.deepEqual(api.ensurePlan(current), { schema: 1, items: [] });
  const afterFirst = clone(current);
  for (let i = 0; i < 3; i++) api.ensurePlan(current);
  assert.deepEqual(current, afterFirst);
  const { overlayPlan, ...unchanged } = current;
  assert.deepEqual(unchanged, before);
  api.addPlanItem(current, 'Keep this existing goal');
  const populated = clone(current.overlayPlan);
  api.ensurePlan(current);
  assert.deepEqual(current.overlayPlan, populated, 'Opening the list must not reset IDs, checks or text');
});

test('manual goals are cleaned, limited to 140 characters, and the 31st goal cannot replace existing work', async () => {
  const api = await modulePromise, current = profile();
  assert.equal(api.addPlanItem(current, '  \tGet\u0000 3\nGolden Chains\r ').item.text, 'Get 3 Golden Chains');
  const long = api.addPlanItem(current, 'x'.repeat(160));
  assert.equal(long.item.text, 'x'.repeat(140));
  assert.equal(api.addPlanItem(current, '\n\t\u0000 ').reason, 'empty');
  for (let i = 2; i < 30; i++) assert.equal(api.addPlanItem(current, `Goal ${i}`).ok, true);
  const before = clone(current.overlayPlan.items);
  assert.deepEqual(api.addPlanItem(current, 'The 31st goal'), { ok: false, reason: 'limit' });
  assert.deepEqual(current.overlayPlan.items, before);
  assert.equal(api.updatePlanItem(current, long.item.id, { text: 'y'.repeat(150) }).item.text.length, 140);
  const retained = clone(current.overlayPlan.items);
  assert.equal(api.updatePlanItem(current, long.item.id, { text: '   ' }).reason, 'empty');
  assert.deepEqual(current.overlayPlan.items, retained);
});

test('non-text values are rejected, and truncation never splits a Unicode character', async () => {
  const api = await modulePromise, current = profile();
  for (const text of [null, undefined, 123, true, {}, [], { toString() { throw new Error('Must not be coerced'); } }]) {
    assert.equal(api.addPlanItem(current, { text }).reason, 'empty');
  }
  assert.deepEqual(current.overlayPlan.items, []);
  const item = api.addPlanItem(current, 'a'.repeat(139) + '😀').item;
  assert.equal(item.text, 'a'.repeat(139));
  assert.equal(item.text.isWellFormed(), true);
  assert.equal(api.updatePlanItem(current, item.id, { text: { wrong: true } }).reason, 'empty');
  assert.equal(current.overlayPlan.items[0].text, 'a'.repeat(139));
  const completeEmoji = api.addPlanItem(current, 'a'.repeat(138) + '😀').item;
  assert.equal(completeEmoji.text, 'a'.repeat(138) + '😀');
});

test('different stages of one ending can coexist, while the same route stage or quest is not duplicated', async () => {
  const api = await modulePromise, current = profile();
  const first = api.addPlanItem(current, { text: 'Marie', kind: 'route', ref: 'golden@golden-marie' });
  const second = api.addPlanItem(current, { text: 'January', kind: 'route', ref: 'golden@golden-02_gennaio' });
  assert.equal(first.ok, true); assert.equal(second.ok, true);
  assert.equal(api.addPlanItem(current, { text: 'Same stage', kind: 'route', ref: first.item.ref }).reason, 'duplicate');
  assert.equal(api.addPlanItem(current, { text: 'Generic route', kind: 'route', ref: 'golden' }).ok, true);
  const quest = api.addPlanItem(current, { text: 'Q01', kind: 'quest', ref: '1' });
  api.updatePlanItem(current, quest.item.id, { done: true });
  const duplicate = api.addPlanItem(current, { text: 'Renamed Q01', kind: 'quest', ref: '1' });
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(duplicate.item.done, true, 'Adding a duplicate must not uncheck finished session work');
  assert.equal(current.overlayPlan.items.length, 4);
});

test('invalid links lose navigation while valid quest and route links retain their targets', async () => {
  const api = await modulePromise, current = profile();
  for (const value of [
    { kind: 'quest', ref: '70' }, { kind: 'quest', ref: '0' }, { kind: 'quest', ref: '../1' },
    { kind: 'route', ref: 'missing' }, { kind: 'route', ref: 'golden@../bad' },
    { kind: 'route', ref: 'golden@stage@extra' }, { kind: 'route', ref: 'golden@' + 'a'.repeat(101) },
  ]) {
    const result = api.addPlanItem(current, { text: 'Retain my reminder', ...value });
    assert.equal(result.item.kind, 'manual');
    assert.equal(result.item.ref, '');
  }
  assert.equal(api.addPlanItem(current, { text: 'Q69', kind: 'quest', ref: '69' }).item.ref, '69');
  const longest = 'true@' + 'a'.repeat(100);
  assert.equal(api.addPlanItem(current, { text: 'Long valid stage', kind: 'route', ref: longest }).item.ref, longest);
});

test('reordering respects both boundaries and preserves every item and its completion state', async () => {
  const api = await modulePromise, current = profile();
  const ids = ['First', 'Second', 'Third'].map(text => api.addPlanItem(current, text).item.id);
  api.updatePlanItem(current, ids[1], { done: true });
  const originalItems = Object.fromEntries(current.overlayPlan.items.map(item => [item.id, clone(item)]));
  const before = clone(current.overlayPlan.items);
  assert.equal(api.movePlanItem(current, ids[0], 'up').reason, 'boundary');
  assert.equal(api.movePlanItem(current, ids[2], 'down').reason, 'boundary');
  assert.equal(api.movePlanItem(current, ids[0], 'unknown').reason, 'boundary');
  assert.deepEqual(current.overlayPlan.items, before);
  assert.equal(api.movePlanItem(current, 'not-present', 'up').reason, 'missing');
  api.movePlanItem(current, ids[1], -1);
  assert.deepEqual(current.overlayPlan.items.map(item => item.id), [ids[1], ids[0], ids[2]]);
  api.movePlanItem(current, ids[0], 1);
  assert.deepEqual(current.overlayPlan.items.map(item => item.id), [ids[1], ids[2], ids[0]]);
  assert.deepEqual(Object.fromEntries(current.overlayPlan.items.map(item => [item.id, item])), originalItems);
});

test('session checks and removal cannot mark a quest or ending complete', async () => {
  const api = await modulePromise;
  const state = { profiles: { current: profile() }, endings: { bad1: true, golden: false } };
  const current = state.profiles.current;
  const questState = clone(current.quests), endingState = clone(state.endings), checks = clone(current.checks);
  const q = api.addPlanItem(current, { text: 'Quest goal', kind: 'quest', ref: '1' }).item;
  const r = api.addPlanItem(current, { text: 'Ending goal', kind: 'route', ref: 'golden@golden-true' }).item;
  api.updatePlanItem(current, q.id, { done: true });
  api.updatePlanItem(current, r.id, { done: true });
  assert.deepEqual(current.quests, questState); assert.deepEqual(state.endings, endingState); assert.deepEqual(current.checks, checks);
  assert.equal(api.clearCompletedPlan(current).removed, 2);
  assert.deepEqual(current.overlayPlan.items, []);
  assert.deepEqual(current.quests, questState); assert.deepEqual(state.endings, endingState); assert.deepEqual(current.checks, checks);
  assert.equal(api.removePlanItem(current, q.id).reason, 'missing');
});

test('diary branches and a JSON-copied branch retain independent plan items', async () => {
  const api = await modulePromise, first = profile(), empty = profile();
  const goal = api.addPlanItem(first, 'Original goal').item;
  const copied = clone(first);
  api.updatePlanItem(copied, goal.id, { text: 'Different branch goal', done: true });
  api.addPlanItem(empty, 'Separate new branch');
  assert.equal(first.overlayPlan.items[0].text, 'Original goal');
  assert.equal(first.overlayPlan.items[0].done, false);
  assert.equal(copied.overlayPlan.items[0].text, 'Different branch goal');
  assert.equal(copied.overlayPlan.items[0].done, true);
  api.removePlanItem(copied, goal.id);
  assert.equal(first.overlayPlan.items.length, 1);
  assert.equal(empty.overlayPlan.items.length, 1);
});

test('malformed imported plans are normalized without trusting IDs, completion strings or navigation keys', async () => {
  const api = await modulePromise, current = profile();
  current.overlayPlan = { schema: 999, items: [null, [], true, 'wrong', {}, { text: ' ' },
    { text: 123 }, { text: false }, { text: { html: '<script>' } }, { text: ['unexpected'] },
    { id: 'shared', text: 'Keep me', done: 'true', kind: 'route', ref: 'golden@bad/step', extra: '<script>' },
    { id: 'shared', text: 'Keep me too', done: true, kind: 'quest', ref: '2' },
    { id: 'bad" onclick="run()', text: '  Safe\nreminder  ', done: false, kind: 'unknown', ref: 'https://example.com' },
  ] };
  const cleaned = api.ensurePlan(current);
  assert.equal(cleaned.schema, 1); assert.equal(cleaned.items.length, 3);
  assert.equal(new Set(cleaned.items.map(item => item.id)).size, 3);
  assert(cleaned.items.every(item => /^[a-zA-Z0-9_-]{1,100}$/.test(item.id)));
  assert.deepEqual(cleaned.items.map(item => [item.text, item.done, item.kind, item.ref]), [
    ['Keep me', false, 'manual', ''], ['Keep me too', true, 'quest', '2'], ['Safe reminder', false, 'manual', ''],
  ]);
  assert(cleaned.items.every(item => !('extra' in item)));
  const snapshot = clone(cleaned); api.ensurePlan(current); assert.deepEqual(current.overlayPlan, snapshot);
  current.overlayPlan.items.push(...Array.from({ length: 40 }, (_, index) => ({ text: `Imported ${index}` })));
  assert.equal(api.ensurePlan(current).items.length, 30);
  current.overlayPlan = { items: 'not an array' };
  assert.deepEqual(api.ensurePlan(current).items, []);
});

test('quest suggestions use the chosen language and never infer progress from the reference scenario', async () => {
  const api = await modulePromise, current = profile();
  const view = views(api, current);
  const activeIds = view.ui.suggestions().filter(item => item.kind === 'quest').map(item => item.ref);
  assert.deepEqual(activeIds, ['1']);
  const q1 = questData.quests.find(quest => quest.id === 1);
  assert.equal(view.ui.addQuest(1).item.text, 'Q01 · ' + q1.name_it);
  const q2 = questData.quests.find(quest => quest.id === 2);
  view.language('en');
  assert.equal(view.ui.addQuest(2).item.text, 'Q02 · ' + questEnglish[q2.name_it]);
  assert.equal(view.ui.addQuest(700).reason, 'missing');
  assert.deepEqual(current.quests, { 1: 'active', 2: 'done' });
});

test('last-reading suggestions keep a specific route stage and honour the supplied stage title', async () => {
  const api = await modulePromise, current = profile();
  current.position = { routeId: 'golden', stepId: 'golden-marie', chapterId: 'sample' };
  const view = views(api, current, { readingTitle: () => 'Prima tappa', language: 'en' });
  const item = view.ui.suggestions().find(entry => entry.kind === 'route');
  assert.equal(item.ref, 'golden@golden-marie'); assert.equal(item.text, 'First stage');
  assert.equal(view.ui.addSuggestion('route', item.ref).ok, true);
  current.position.stepId = 'golden-02_gennaio';
  assert.equal(view.ui.addSuggestion('route', 'golden@golden-02_gennaio').ok, true);
  assert.equal(current.overlayPlan.items.length, 2);
  assert.equal(view.ui.addSuggestion('route', 'golden@missing').reason, 'missing');
  delete current.position.stepId;
  assert.equal(view.ui.suggestions().find(entry => entry.kind === 'route').ref, 'golden');
});

test('personal text is escaped in both views and cannot break out of a textarea, label or branch title', async () => {
  const api = await modulePromise, current = profile();
  current.name = 'My "branch" <img src=x onerror=run()> & notes';
  api.addPlanItem(current, '</textarea><img src=x onerror=run()> & "go"');
  const view = views(api, current);
  for (const html of [view.ui.planView(), view.ui.compactView()]) {
    assert(!html.includes('<img src=x'));
    assert(!html.includes('</textarea><img'));
    assert(html.includes('&lt;/textarea&gt;&lt;img src=x onerror=run()&gt; &amp; &quot;go&quot;'));
  }
  assert(view.ui.compactView().includes('My &quot;branch&quot; &lt;img src=x onerror=run()&gt; &amp; notes'));
});

test('switching UI language leaves saved personal text and branch names unchanged', async () => {
  const api = await modulePromise, current = profile();
  current.name = 'La tua sessione';
  api.addPlanItem(current, 'La tua sessione');
  const view = views(api, current), snapshot = clone(current.overlayPlan);
  view.ui.planView(); view.language('en');
  const english = view.ui.compactView();
  assert(english.includes('<h1>Your play session</h1>'));
  assert(english.includes('data-no-translate>La tua sessione</span>'));
  assert(english.includes('title="La tua sessione">La tua sessione</span>'));
  assert(view.ui.planView().includes('<span class="plan-sr-only" data-no-translate>La tua sessione</span>'),
    'The accessible checkbox text must also be excluded from the DOM translator');
  view.language('it'); view.ui.planView();
  assert.deepEqual(current.overlayPlan, snapshot);
  assert.equal(current.name, 'La tua sessione');
});

test('checkboxes expose the individual goal as their accessible name in both views', async () => {
  const api = await modulePromise, current = profile();
  api.addPlanItem(current, 'Collect Golden Chains');
  api.addPlanItem(current, 'Save before the next choice');
  const view = views(api, current, { language: 'en' });
  for (const html of [view.ui.planView(), view.ui.compactView()]) {
    const labels = [...html.matchAll(/<label class="plan-check">([\s\S]*?)<\/label>/g)].map(match => match[1]);
    assert.equal(labels.length, 2);
    assert(labels[0].includes('Collect Golden Chains'));
    assert(labels[1].includes('Save before the next choice'));
    for (const label of labels) {
      assert(!/<input[^>]*aria-label=/.test(label), 'A generic aria-label must not override the goal text');
      assert(label.includes('data-no-translate'));
    }
  }
});

test('passive mode shows the unlock shortcut and does not alter the session plan', async () => {
  const api = await modulePromise, current = profile();
  api.addPlanItem(current, 'Read next step');
  const view = views(api, current, { language: 'en' });
  const before = clone(current.overlayPlan);
  assert(!view.ui.compactView().includes('Ctrl + Shift + I'));
  view.context.windowMode.mousePassthrough = true;
  const passive = view.ui.compactView();
  assert(passive.includes('Ctrl + Shift + I'));
  assert(passive.includes('Passive · clicks go to the game'));
  assert.deepEqual(current.overlayPlan, before);
});

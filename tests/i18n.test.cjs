// Localization regressions. Read-only: no Steam saves or user diary are loaded.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const APP = path.resolve(__dirname, '..');
const json = relative => JSON.parse(fs.readFileSync(path.join(APP, relative), 'utf8'));
const source = fs.readFileSync(path.join(APP, 'src/i18n.js'), 'utf8');
const localeFiles = fs.readdirSync(path.join(APP, 'src/locales'))
  .filter(name => name.endsWith('.en.json')).sort();
const dictionaries = Object.fromEntries(localeFiles.map(name => [name, json(`src/locales/${name}`)]));
const dictionary = Object.assign({}, ...Object.values(dictionaries));
const guide = json('content/data/guide_content.json');
const quests = json('content/data/quests.json').quests;
const margaret = json('content/Margaret_Fusioni/data/guide_content.json');
const endings = json('content/data/endings_research.json');
const fusion = json('content/Margaret_Fusioni/data/fusion_data.json');

// A minimal DOM boundary tests the real module without adding a browser dependency.
function environment() {
  const document = {
    documentElement: { lang: 'it' },
    body: null,
    createTreeWalker(root) {
      let index = 0;
      return { nextNode: () => root.nodes[index++] || null };
    },
  };
  const context = vm.createContext({
    document,
    NodeFilter: { SHOW_TEXT: 4 },
    queueMicrotask,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() {}
      disconnect() {}
    },
  });
  assert.match(source, /export function createI18n\(/);
  vm.runInContext(source.replace('export function createI18n', 'function createI18n') +
    '\nglobalThis.makeI18n = createI18n;', context, { filename: 'src/i18n.js' });
  const i18n = context.makeI18n();
  i18n.setDictionary(dictionary);
  return { i18n, document };
}

function mockElement(attributes = {}, excluded = false) {
  return {
    attributes: { ...attributes },
    closest: () => excluded ? {} : null,
    getAttribute(name) { return this.attributes[name] ?? null; },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
}
const mockText = (value, excluded = false) => ({
  nodeValue: value, parentElement: mockElement({}, excluded),
});
const mockRoot = (nodes, elements = []) => ({ nodes, querySelectorAll: () => elements });

function sectionFields(sections) {
  const fields = [];
  for (const section of sections) {
    for (const key of ['title', 'kicker']) {
      if (section[key]) fields.push([`${section.id}.${key}`, section[key]]);
    }
    section.blocks.forEach((block, index) => {
      for (const key of ['label', 'text', 'it']) {
        if (block[key]) fields.push([`${section.id}.blocks[${index}].${key}`, block[key]]);
      }
    });
  }
  return fields;
}

function assertCoverage(fields) {
  const { i18n } = environment();
  i18n.setLanguage('en');
  const missing = fields.filter(([, value]) => !i18n.has(value));
  assert.deepEqual(missing, [], 'Every displayed field needs an explicit English dictionary entry');
  for (const [where, value] of fields) {
    const translated = i18n.t(value);
    assert.equal(typeof translated, 'string', where);
    assert.ok(translated.trim(), `${where}: empty translation`);
    assert.ok(!translated.includes('\uFFFD'), `${where}: damaged Unicode`);
  }
}

function numericTokens(text) {
  // Italian 5.000 and English 5,000 denote the same amount; keep date components.
  const canonical = text.replace(/(?<=\d)[.,](?=\d{3}\b)/g, '');
  return (canonical.match(/\d+/g) || []).sort((a, b) => Number(a) - Number(b));
}

test('Italian is the default and preserves original wording, spaces and line breaks', () => {
  const { i18n, document } = environment();
  assert.equal(i18n.getLanguage(), 'it');
  const input = '  Rango 3\nMatador + Mahama  ';
  assert.equal(i18n.t(input), input);
  assert.equal(i18n.t('Salvataggi'), 'Salvataggi');
  i18n.setLanguage('unsupported-language');
  assert.equal(i18n.getLanguage(), 'it');
  assert.equal(document.documentElement.lang, 'it');
});

test('exact English lookup tolerates typographic apostrophes and whitespace differences', () => {
  const { i18n, document } = environment();
  i18n.setDictionary({ 'L’abilità richiesta\nè presente.': 'The required skill is present.' });
  i18n.setLanguage('en');
  assert.equal(i18n.t("  L'abilità   richiesta\r\nè presente. "), 'The required skill is present.');
  assert.ok(i18n.has("L'abilità richiesta è presente."));
  assert.equal(document.documentElement.lang, 'en');
});

test('unknown strings, game names, numbers and empty values are preserved safely', () => {
  const { i18n } = environment();
  i18n.setLanguage('en');
  for (const value of ['Anzu', 'Auto-Sukukaja', 'My own journal note', '  22/05  ', '', '\n ']) {
    assert.equal(i18n.t(value), value, value);
  }
  assert.equal(i18n.t(null), '');
  assert.equal(i18n.t(undefined), '');
  assert.equal(i18n.t(67), '67');
});

test('essential navigation, instructions and accessibility labels have English translations', () => {
  const { i18n } = environment();
  i18n.setLanguage('en');
  const expected = {
    'Finali e percorsi': 'Endings and routes',
    'Quest secondarie': 'Side quests',
    'Salvataggi': 'Saves',
    'Ramo del diario': 'Journal branch',
    'Passo passo': 'Step by step',
    'Prima di iniziare questo percorso': 'Before starting this route',
    'Cerca nella guida e premi Invio': 'Search the guide and press Enter',
    'Apri il pannello compatto': 'Open the compact panel',
    'Come funziona il diario': 'How the journal works',
    'Preferisci ingredienti che apprendono l’abilità richiesta': 'Prefer ingredients that learn the required skill',
    'Nessuna voce trovata': 'No options found',
  };
  for (const [original, translated] of Object.entries(expected)) {
    assert.equal(i18n.t(original).trim(), translated, original);
  }
});

test('dynamic reader, rank, result-count and recipe strings retain their values in English', () => {
  const { i18n } = environment();
  i18n.setLanguage('en');
  const samples = [
    ['Passo 5 di 22', 'Step 5 of 22'],
    ['Rango 10', 'Rank 10'],
    ['✓ Rango 2', '✓ Rank 2'],
    ['14/69 completate nel ramo', '14/69 completed in this diary branch'],
    ['69 richieste · Nessuno stato è ricavato automaticamente dal salvataggio del gioco.', '69 requests · Quest status is not read automatically from your game save.'],
    ['4 capitoli trovati', '4 chapters found'],
    ['6 ricette filtrate su 73 totali · Matador livello base 24. Controlla risultato e abilità nella preview del gioco.', '6 filtered recipes out of 73 total · Matador base level 24. Check the result and skill in the game preview.'],
    ['Come creo Black Frost?', 'How do I fuse Black Frost?'],
    ['Rango 4 · Gdon con Rampage', 'Rank 4 · Gdon with Rampage'],
    ['Queen Mab · livello base 25', 'Queen Mab · base level 25'],
    ['SPECIALE · 6', 'SPECIAL · 6'],
    ['NORMALE · 2', 'NORMAL · 2'],
    ['TRIANGOLARE · 3', 'TRIANGLE · 3'],
    ['Mahama: Anzu al livello 19 · controlla che la conservi', 'Mahama: Anzu at level 19 · check that the skill is still present'],
    ['Mind Charge: Taotie al livello 38 · da allenare', 'Mind Charge: Taotie at level 38 · training required'],
    ['Richiede la skill già trasmessa a un ingrediente o una carta Bufula. Segui la catena guidata del rango.', 'Requires the skill on an ingredient or a Bufula Skill Card. Follow the guided recipe for this rank.'],
    ['Spunte del ramo: My Golden notes', 'Diary branch: My Golden notes'],
    ['Salvataggio fallito: ENOSPC', 'Could not save: ENOSPC'],
    ['Dal 16/01', 'Available from 16/01'],
    ['Termine: 16/11 · leggi le note della scheda', 'Target date: 16/11 · read the quest notes'],
  ];
  for (const [original, translated] of samples) {
    assert.equal(i18n.t(original), translated, original);
    assert.deepEqual(numericTokens(i18n.t(original)), numericTokens(original), original);
  }
});

test('all 69 quest sheets have complete English titles, labels and instructions', () => {
  const sections = guide.filter(section => /^quest_\d+$/.test(section.id));
  assert.equal(sections.length, 69);
  assert.deepEqual(sections.map(s => Number(s.id.slice(6))).sort((a, b) => a - b),
    Array.from({ length: 69 }, (_, i) => i + 1));
  assertCoverage(sectionFields(sections));
});

test('all structured quest gameplay fields and notes have explicit English coverage', () => {
  const fields = ['name_it', 'availability_note', 'npc', 'location', 'objective',
    'item', 'enemy', 'dungeon', 'floors', 'deadline_note', 'reward', 'recoverability', 'notes'];
  const entries = [];
  assert.equal(quests.length, 69);
  for (const quest of quests) {
    for (const field of fields) {
      const values = Array.isArray(quest[field]) ? quest[field] : [quest[field]];
      values.forEach((value, index) => {
        if (typeof value === 'string' && value) entries.push([`Q${quest.id}.${field}[${index}]`, value]);
      });
    }
  }
  assertCoverage(entries);
});

test('all nine Margaret ranks and supporting sections have complete English text', () => {
  const ranks = margaret.filter(section => /^rango_\d+$/.test(section.id));
  assert.deepEqual(ranks.map(section => Number(section.id.slice(6))), [2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(margaret.length, 16);
  const fields = sectionFields(margaret);
  assert.equal(new Set(fields.map(([, value]) => value)).size, 248);
  assertCoverage(fields);
});

test('quest and Margaret translations preserve every numeric amount and slash-formatted date', () => {
  for (const name of ['quests.en.json', 'margaret.en.json']) {
    assert.ok(dictionaries[name], `${name}: dictionary missing`);
    for (const [original, translated] of Object.entries(dictionaries[name])) {
      assert.deepEqual(numericTokens(translated), numericTokens(original), `${name}: ${original}`);
      const dates = s => (s.match(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g) || []).sort();
      assert.deepEqual(dates(translated), dates(original), `${name}: changed date in ${original}`);
    }
  }
});

test('Margaret translations preserve exact Persona and skill names, including repeated mentions', () => {
  const skills = ['Sukukaja', 'Auto-Sukukaja', 'Mahama', 'Mahamaon', 'Hama', 'Rampage',
    'Bufula', 'Megido', 'Megidola', 'Megidolaon', 'Mediarama', 'Media', 'Diarama',
    'Mediarahan', 'Tetrakarn', 'Makarakarn', 'Tetra Break', 'Mind Charge', 'Power Charge', 'Auto-Masuku'];
  const names = [...Object.keys(fusion.demons), ...skills];
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'g');
    for (const [original, translated] of Object.entries(dictionaries['margaret.en.json'])) {
      assert.equal((translated.match(pattern) || []).length, (original.match(pattern) || []).length,
        `${name}: name changed in ${original}`);
    }
  }
});

test('original English game dialogue remains byte-for-byte unchanged in both languages', () => {
  const quotes = new Set();
  const collect = object => {
    if (!object || typeof object !== 'object') return;
    for (const [key, value] of Object.entries(object)) {
      if (key === 'en' && typeof value === 'string' && value) quotes.add(value);
      else if (value && typeof value === 'object') collect(value);
    }
  };
  collect(guide); collect(margaret); collect(endings);
  assert.ok(quotes.size >= 20, 'The fixture must cover the actual game choices');
  const { i18n } = environment();
  for (const language of ['en', 'it']) {
    i18n.setLanguage(language);
    for (const quote of quotes) assert.equal(i18n.t(quote), quote, `${language}: ${quote}`);
  }
});

test('DOM translation restores Italian text and never changes excluded notes or profile names', () => {
  const { i18n, document } = environment();
  const instruction = mockText('Salvataggi');
  const profileName = mockText('Salvataggi', true);
  const note = mockText('Rango 3', true);
  const root = mockRoot([instruction, profileName, note]);
  document.body = root;
  i18n.setLanguage('en');
  i18n.translateDOM(root);
  assert.equal(instruction.nodeValue, 'Saves');
  assert.equal(profileName.nodeValue, 'Salvataggi');
  assert.equal(note.nodeValue, 'Rango 3');
  i18n.translateDOM(root);
  assert.equal(instruction.nodeValue, 'Saves', 'Repeated translation must be idempotent');
  i18n.setLanguage('it');
  i18n.translateDOM(root);
  assert.equal(instruction.nodeValue, 'Salvataggi');
  assert.equal(document.documentElement.lang, 'it');
});

test('placeholders, tooltips and accessibility labels translate without changing excluded user fields', () => {
  const { i18n } = environment();
  const search = mockElement({ placeholder: 'Cerca nella guida e premi Invio', 'aria-label': 'Cerca nella guida' });
  const overlay = mockElement({ title: 'Apri il pannello compatto' });
  const userField = mockElement({ placeholder: 'Salvataggi', title: 'Rango 3' }, true);
  const root = mockRoot([], [search, overlay, userField]);
  i18n.setLanguage('en');
  i18n.translateDOM(root);
  assert.equal(search.attributes.placeholder, 'Search the guide and press Enter');
  assert.equal(search.attributes['aria-label'], 'Search the guide');
  assert.equal(overlay.attributes.title, 'Open the compact panel');
  assert.equal(userField.attributes.placeholder, 'Salvataggi');
  assert.equal(userField.attributes.title, 'Rango 3');
});

test('switching the same DOM back to Italian also restores translated attributes', () => {
  const { i18n } = environment();
  const input = mockElement({ placeholder: 'Cerca nella guida', 'aria-label': 'Come funziona il diario', title: 'Sempre in primo piano' });
  const original = { ...input.attributes };
  const root = mockRoot([], [input]);
  i18n.setLanguage('en');
  i18n.translateDOM(root);
  i18n.setLanguage('it');
  i18n.translateDOM(root);
  assert.deepEqual(input.attributes, original, 'Persistent controls must not retain English after switching back');
});

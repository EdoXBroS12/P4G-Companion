// Real template tests: no native window, profile or game-save access.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const ROOT = path.resolve(__dirname, '..');
const template = import(pathToFileURL(path.join(ROOT, 'src/dialog-ui.js')).href);
const english = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/dialogs.en.json'), 'utf8'));
const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
async function render(profileName = 'Golden', language = 'it', keys = []) {
  const { createBranchDialog } = await template;
  return createBranchDialog({
    profileName, rawEsc: escape,
    e: text => { keys.push(text); return escape(language === 'en' ? english[text] || text : text); },
  });
}

test('the source branch name is escaped as user text and never treated as markup or translation', async () => {
  const unsafe = '</strong><img src=x onerror=run()> "Golden" & notes';
  for (const language of ['it', 'en']) {
    const html = await render(unsafe, language);
    assert(!html.includes('<img src=x'));
    assert(html.includes('&lt;/strong&gt;&lt;img src=x onerror=run()&gt; &quot;Golden&quot; &amp; notes'));
    assert.match(html, /<strong[^>]*data-no-translate[^>]*>/);
  }
  const keys = [];
  const html = await render('Appunti', 'en', keys);
  assert.match(html, /data-no-translate>Appunti<\/strong>/);
  assert.equal(keys.filter(key => key === 'Appunti').length, 1, 'Only the fixed summary label can reach the translator');
  assert(html.includes('<li>Notes</li>'));
});

test('the field has its own associated label, a blank full-width input and accessible inline validation', async () => {
  const html = await render();
  const form = html.match(/<form\b[^>]*>/)?.[0] || '';
  assert.match(form, /id="branch-form"/);
  assert.match(form, /novalidate/);
  assert.match(html, /<label\b[^>]*for="new-profile-name"[^>]*>[^<]+<\/label>\s*<input\b/,
    'The name input must sit after the label, not inline inside it');
  const input = html.match(/<input\b[^>]*id="new-profile-name"[^>]*>/)?.[0] || '';
  assert.match(input, /type="text"/);
  assert.match(input, /maxlength="70"/);
  assert.match(input, /\brequired\b/);
  assert(!/\bvalue=/.test(input), 'A new name must not be prefilled with the copied branch name');
  assert.match(input, /aria-describedby="branch-name-help branch-name-error"/);
  assert.match(input, /aria-invalid="false"/);
  assert.match(html, /id="branch-name-error"[^>]*aria-live="polite"[^>]*><\/p>/);
  const css = fs.readFileSync(path.join(ROOT, 'src/dialog-ui.css'), 'utf8');
  assert.match(css, /\.dialog-field\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.dialog-field\s*>\s*input\s*\{[^}]*width:\s*100%/);
});

test('submitting and cancelling are distinct actions; help stays optional', async () => {
  const html = await render();
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(match => match[0]);
  assert.equal(buttons.length, 2);
  assert(buttons.some(tag => /type="submit"/.test(tag) && /form="branch-form"/.test(tag) && /data-action="create-profile"/.test(tag)));
  assert(buttons.some(tag => /type="button"/.test(tag) && /data-action="close-modal"/.test(tag)));
  assert.match(html, /<details\b(?![^>]*\bopen\b)[^>]*>\s*<summary>/);
  assert.match(html, /<details class="dialog-copy-summary"><summary>/, 'The copy summary starts collapsed');
  assert(html.indexOf('class="dialog-source-card"') < html.indexOf('class="dialog-field"'));
  assert(html.indexOf('class="dialog-field"') < html.indexOf('class="dialog-copy-summary"'), 'The name field appears before supporting detail');
  assert(html.indexOf('class="dialog-copy-summary"') < html.indexOf('class="dialog-game-note"'));
  assert(html.indexOf('</form>') < html.indexOf('class="dialog-actions"'), 'Actions must remain outside the scrolling form');
  assert(!html.includes('<h2'), 'The root modal owns the single dialog title');
});

test('the explanation accounts for copied data, shared endings and unchanged game saves in both languages', async () => {
  const italian = await render();
  const en = await render('Golden', 'en');
  for (const text of ['Stato delle quest', 'Spunte delle guide', 'Appunti', 'Lista di oggi', 'Livelli delle Persona']) {
    assert(italian.includes(`<li>${text}</li>`));
    assert(en.includes(`<li>${english[text]}</li>`));
  }
  assert(italian.includes('nessun salvataggio viene creato o caricato'));
  assert(en.includes('no game save is created or loaded'));
  assert(italian.includes('I finali già visti restano comuni a tutti i rami.'));
  assert(en.includes('shared across all branches'));
});

test('all template-owned labels have English entries and missing source names have a clear fallback', async () => {
  const keys = [];
  await render('', 'en', keys);
  assert.deepEqual([...new Set(keys)].filter(key => !Object.hasOwn(english, key)), []);
  assert((await render(null, 'en')).includes('Current branch'));
  assert((await render('   ', 'it')).includes('Ramo attuale'));
  assert.equal(english['Crea un ramo del diario'], 'Create a journal branch');
});

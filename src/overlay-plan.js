/** A session checklist belongs to one diary branch; it never changes game/quest status. */
export const MAX_PLAN_ITEMS = 30;
export const MAX_PLAN_TEXT = 140;

const PLAN_ROUTES = new Set(['bad1', 'bad2', 'bad3', 'complice', 'normal', 'true', 'golden']);
const cleanText = value => (typeof value === 'string' ? value : '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_PLAN_TEXT).replace(/[\uD800-\uDBFF]$/, '').trimEnd();
const newId = () => 'plan-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
const kindAndRef = (kind, ref) => {
  const value = String(ref ?? '');
  if (kind === 'quest' && /^(?:[1-9]|[1-6][0-9])$/.test(value)) return { kind: 'quest', ref: value };
  const route = value.split('@');
  if (kind === 'route' && PLAN_ROUTES.has(route[0]) && (route.length === 1 ||
      route.length === 2 && /^[a-zA-Z0-9_-]{1,100}$/.test(route[1]))) return { kind: 'route', ref: value };
  return { kind: 'manual', ref: '' };
};

export function ensurePlan(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new TypeError('A diary profile is required');
  const source = profile.overlayPlan && typeof profile.overlayPlan === 'object' && !Array.isArray(profile.overlayPlan)
    ? profile.overlayPlan : {};
  const used = new Set();
  const items = [];
  for (const raw of Array.isArray(source.items) ? source.items : []) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const text = cleanText(raw.text);
    if (!text) continue;
    let id = typeof raw.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(raw.id) ? raw.id : newId();
    if (used.has(id)) id = newId();
    used.add(id);
    items.push({ id, text, done: raw.done === true, ...kindAndRef(raw.kind, raw.ref) });
    if (items.length === MAX_PLAN_ITEMS) break;
  }
  profile.overlayPlan = { schema: 1, items };
  return profile.overlayPlan;
}

export function addPlanItem(profile, value) {
  const plan = ensurePlan(profile);
  const item = typeof value === 'string' ? { text: value } : value || {};
  const text = cleanText(item.text);
  if (!text) return { ok: false, reason: 'empty' };
  const link = kindAndRef(item.kind, item.ref);
  const duplicate = link.kind !== 'manual' && plan.items.find(entry => entry.kind === link.kind && entry.ref === link.ref);
  if (duplicate) return { ok: false, reason: 'duplicate', item: duplicate };
  if (plan.items.length >= MAX_PLAN_ITEMS) return { ok: false, reason: 'limit' };
  const next = { id: newId(), text, done: false, ...link };
  plan.items.push(next);
  return { ok: true, item: next };
}

export function updatePlanItem(profile, id, patch) {
  const item = ensurePlan(profile).items.find(entry => entry.id === id);
  if (!item) return { ok: false, reason: 'missing' };
  if (Object.prototype.hasOwnProperty.call(patch || {}, 'text')) {
    const text = cleanText(patch.text);
    if (!text) return { ok: false, reason: 'empty' };
    item.text = text;
  }
  if (typeof patch?.done === 'boolean') item.done = patch.done;
  return { ok: true, item };
}

export function removePlanItem(profile, id) {
  const plan = ensurePlan(profile);
  const index = plan.items.findIndex(entry => entry.id === id);
  if (index < 0) return { ok: false, reason: 'missing' };
  const [item] = plan.items.splice(index, 1);
  return { ok: true, item };
}

export function movePlanItem(profile, id, direction) {
  const plan = ensurePlan(profile);
  const index = plan.items.findIndex(entry => entry.id === id);
  if (index < 0) return { ok: false, reason: 'missing' };
  const offset = direction === 'up' || direction === -1 ? -1 : direction === 'down' || direction === 1 ? 1 : 0;
  const target = index + offset;
  if (!offset || target < 0 || target >= plan.items.length) return { ok: false, reason: 'boundary' };
  [plan.items[index], plan.items[target]] = [plan.items[target], plan.items[index]];
  return { ok: true, item: plan.items[target] };
}

export function clearCompletedPlan(profile) {
  const plan = ensurePlan(profile);
  const removed = plan.items.filter(item => item.done).length;
  plan.items = plan.items.filter(item => !item.done);
  return { ok: true, removed };
}

/**
 * Context: { e, rawEsc, asset, profile, D, byId, t?, readingTitle?, get windowMode() }.
 * All mutations are explicit helper calls. The caller persists and rerenders afterwards.
 * UI actions: plan-add/remove/up/down/clear-done/suggest/open/main, compact,
 * overlay-lock and overlay-hide. The root owns native window actions.
 * Text edits: [data-plan-text]; checks: input[data-plan-check].
 */
export function createOverlayPlan(c) {
  const { e, rawEsc, asset, profile, D, byId } = c;
  const translate = c.t || (text => text);
  const questRows = () => Array.isArray(D?.quests?.quests) ? D.quests.quests : [];
  const questItem = id => {
    const quest = questRows().find(item => String(item.id) === String(id));
    return quest ? { kind: 'quest', ref: String(quest.id), text: cleanText('Q' + String(quest.id).padStart(2, '0') + ' · ' + translate(quest.name_it || quest.name_en)) } : null;
  };
  const readingItem = () => {
    const position = profile().position;
    if (!position || !PLAN_ROUTES.has(position.routeId)) return null;
    const section = byId?.[position.chapterId];
    const title = c.readingTitle?.(position) || section?.title;
    const ref = position.routeId + (/^[a-zA-Z0-9_-]{1,100}$/.test(position.stepId || '') ? '@' + position.stepId : '');
    return title ? { kind: 'route', ref, text: cleanText(translate(title)) } : null;
  };
  function suggestions() {
    const reading = readingItem();
    const quests = questRows().filter(quest => profile().quests?.[quest.id] === 'active').map(quest => questItem(quest.id));
    return [...(reading ? [reading] : []), ...quests];
  }
  function addQuest(id) {
    const item = questItem(id);
    return item ? addPlanItem(profile(), item) : { ok: false, reason: 'missing' };
  }
  function addSuggestion(kind, ref) {
    if (kind === 'quest') return addQuest(ref);
    const reading = readingItem();
    return reading && kind === 'route' && reading.ref === String(ref)
      ? addPlanItem(profile(), reading) : { ok: false, reason: 'missing' };
  }
  const typeLabel = item => item.kind === 'quest' ? 'Quest' : item.kind === 'route' ? 'Percorso della guida' : 'Promemoria';
  const action = (name, label, extra = '', icon = '', disabled = false) => `<button type="button" class="plan-button ${icon ? 'plan-icon-button' : ''}" data-action="${name}" ${extra} ${disabled ? 'disabled' : ''} aria-label="${e(label)}" title="${e(label)}">${icon ? `<span aria-hidden="true">${icon}</span>` : e(label)}</button>`;
  const linked = item => item.kind !== 'manual' ? action('plan-open', 'Apri guida', `data-plan-id="${rawEsc(item.id)}" data-plan-kind="${item.kind}" data-plan-ref="${rawEsc(item.ref)}"`, '↗') : '';
  const count = items => `<span class="plan-progress-count"><strong>${items.filter(item => item.done).length}/${items.length}</strong><span>${e('completati')}</span></span>`;
  const progress = items => `<div class="plan-progress-bar" role="progressbar" aria-label="${e('Obiettivi della sessione completati')}" aria-valuemin="0" aria-valuemax="${Math.max(1, items.length)}" aria-valuenow="${items.filter(item => item.done).length}"><span style="width:${items.length ? items.filter(item => item.done).length / items.length * 100 : 0}%"></span></div>`;

  function row(item, index, length, compact) {
    const id = rawEsc(item.id);
    return `<li class="plan-item ${item.done ? 'is-done' : ''}">
      <label class="plan-check"><input type="checkbox" data-plan-check="${id}" ${item.done ? 'checked' : ''}><span class="plan-check-glyph" aria-hidden="true"></span>${compact ? `<span class="plan-item-text" data-no-translate>${rawEsc(item.text)}</span>` : `<span class="plan-sr-only" data-no-translate>${rawEsc(item.text)}</span>`}</label>
      ${compact ? '' : `<div class="plan-item-body"><textarea class="plan-item-edit" data-plan-text="${id}" rows="2" maxlength="${MAX_PLAN_TEXT}" aria-label="${e('Modifica obiettivo')}" data-no-translate>${rawEsc(item.text)}</textarea><span class="plan-kind">${e(typeLabel(item))}</span></div>`}
      <div class="plan-item-actions">${linked(item)}${compact ? '' : `${action('plan-up', 'Sposta prima', `data-plan-id="${id}"`, '↑', index === 0)}${action('plan-down', 'Sposta dopo', `data-plan-id="${id}"`, '↓', index === length - 1)}${action('plan-remove', 'Rimuovi obiettivo', `data-plan-id="${id}"`, '×')}`}</div>
    </li>`;
  }

  function suggestionRow(item, items) {
    const present = items.some(entry => entry.kind === item.kind && entry.ref === item.ref);
    return `<li class="plan-suggestion"><div><span class="plan-kind">${e(item.kind === 'route' ? 'Ultima lettura' : 'Quest in corso nel diario')}</span><p data-no-translate>${rawEsc(item.text)}</p></div>${action('plan-suggest', present ? 'Già nella lista' : 'Aggiungi alla sessione', `data-plan-kind="${item.kind}" data-plan-ref="${rawEsc(item.ref)}"`, present ? '✓' : '+', present || items.length >= MAX_PLAN_ITEMS)}</li>`;
  }

  function questButton(id) {
    const item = questItem(id);
    if (!item) return '';
    const items = ensurePlan(profile()).items;
    const present = items.some(entry => entry.kind === 'quest' && entry.ref === item.ref);
    return `<button type="button" class="btn plan-quest-button" data-action="plan-suggest" data-plan-kind="quest" data-plan-ref="${rawEsc(item.ref)}" ${present || items.length >= MAX_PLAN_ITEMS ? 'disabled' : ''}>${e(present ? 'Già nella lista della sessione' : '+ Aggiungi alla sessione')}</button>`;
  }

  function planView() {
    const items = ensurePlan(profile()).items;
    const offered = suggestions();
    return `<section class="plan-page">
      <header class="plan-page-header"><div><p class="plan-kicker">${e('PRIMA DI GIOCARE')}</p><h1>${e('La tua sessione')}</h1><p>${e('Scegli pochi obiettivi, mettili in ordine e porta la lista con te mentre giochi.')}</p></div><img src="${asset('teddie.png')}" alt="Teddie"></header>
      <div class="plan-layout"><div class="plan-main">
        <section class="plan-compose" aria-labelledby="plan-compose-title"><h2 id="plan-compose-title">${e('Che cosa vuoi fare oggi?')}</h2><div class="plan-compose-row"><input type="text" id="plan-text" maxlength="${MAX_PLAN_TEXT}" placeholder="${e('Es. recuperare 3 Golden Chains')}" aria-label="${e('Nuovo obiettivo della sessione')}" ${items.length >= MAX_PLAN_ITEMS ? 'disabled' : ''}>${action('plan-add', 'Aggiungi', '', '', items.length >= MAX_PLAN_ITEMS)}</div><p class="plan-help">${e('Fino a 30 obiettivi, 140 caratteri ciascuno. Puoi modificare il testo direttamente nella lista.')}</p></section>
        <section class="plan-list-panel" aria-labelledby="plan-list-title"><div class="plan-list-heading"><h2 id="plan-list-title">${e('Nell’ordine che scegli tu')}</h2><span class="plan-capacity">${items.length}/${MAX_PLAN_ITEMS}</span></div>
        ${items.length ? `<ol class="plan-list">${items.map((item, index) => row(item, index, items.length, false)).join('')}</ol>` : `<div class="plan-empty"><span aria-hidden="true">＋</span><h3>${e('La lista è pronta per i tuoi obiettivi.')}</h3><p>${e('Scrivi un promemoria oppure aggiungi una quest dai suggerimenti.')}</p></div>`}
        <div class="plan-list-footer">${count(items)}${action('plan-clear-done', 'Rimuovi i completati', '', '', !items.some(item => item.done))}</div>${progress(items)}</section>
        <div class="plan-launch"><div><h2>${e('Pronto a giocare?')}</h2><p>${e('L’overlay mostra soltanto questa lista e i collegamenti alle guide.')}</p></div><button type="button" class="btn primary" data-action="compact">${e('Apri lista in overlay')} <span aria-hidden="true">↗</span></button></div>
        <p class="plan-scope">${e('La lista appartiene al ramo del diario selezionato. Spuntare un obiettivo aggiorna soltanto questa lista; conferma le quest nel registro del gioco e nel diario.')}</p>
      </div><aside class="plan-suggestions"><h2>${e('Aggiungi dal diario')}</h2><p class="plan-help">${e('Qui trovi le quest che hai segnato In corso e l’ultima pagina del percorso che hai letto.')}</p>${offered.length ? `<ul>${offered.map(item => suggestionRow(item, items)).join('')}</ul>` : `<p class="plan-suggestions-empty">${e('Segna una quest In corso o apri un percorso per ritrovarlo qui.')}</p>`}<button type="button" class="plan-browse" data-nav="quests">${e('Scegli dalle 69 quest')} <span aria-hidden="true">→</span></button></aside></div>
    </section>`;
  }

  function compactView() {
    const items = ensurePlan(profile()).items;
    const complete = items.length > 0 && items.every(item => item.done);
    const passive = c.windowMode?.mousePassthrough === true;
    return `<section class="overlay-widget plan-widget ${passive ? 'is-passive' : ''}" aria-label="${e('Lista della sessione')}">
      <header class="plan-widget-header"><img src="${asset('teddie.png')}" alt="Teddie"><div><p class="plan-kicker">P4G COMPANION</p><h1>${e('La tua sessione')}</h1></div><div class="plan-widget-controls">${action('compact', 'Torna all’app', '', '↗')}${action('overlay-lock', passive ? 'Riattiva i clic sull’overlay' : 'Passa i clic al gioco', `aria-pressed="${passive}"`, passive ? '◈' : '◇')}${action('overlay-hide', 'Nascondi overlay', '', '—')}</div></header>
      <div class="plan-widget-progress">${count(items)}<span class="plan-widget-branch" data-no-translate title="${rawEsc(profile().name)}">${rawEsc(profile().name)}</span></div>${progress(items)}
      <div class="plan-widget-body">${items.length ? `<ol class="plan-list">${items.map((item, index) => row(item, index, items.length, true)).join('')}</ol>` : `<div class="plan-empty"><h2>${e('Scegli gli obiettivi prima di partire.')}</h2><p>${e('Prepara la lista nella guida, poi torna qui mentre giochi.')}</p>${action('plan-main', 'Prepara la sessione')}</div>`}${complete ? `<p class="plan-all-done"><span aria-hidden="true">✓</span> ${e('Tutti gli obiettivi della lista sono spuntati.')}</p>` : ''}</div>
      <footer class="plan-widget-footer"><div class="plan-shortcuts"><span><kbd>${e('Ctrl + Shift + Spazio')}</kbd> ${e('mostra / nascondi')}</span>${passive ? `<strong>${e('Passivo · clic al gioco')}</strong><span><kbd>Ctrl + Shift + I</kbd> ${e('riattiva i clic')}</span>` : `<span>${e('Lista del diario · spunte manuali')}</span>`}</div>${action('plan-main', 'Modifica lista')}</footer>
    </section>`;
  }

  return { planView, compactView, suggestions, addSuggestion, addQuest, questButton };
}

/** Custom single-select presentation. The original select remains the data API. */
const installations = new WeakMap();
let nextId = 0;
const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it');
const LONG_LIST = 12;

export function installSelectControls(root = document) {
  if (installations.has(root)) return installations.get(root);
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const view = doc.defaultView;
  const controls = new Map();
  let opened = null, destroyed = false, refreshQueued = false;
  const contains = node => node && (root === doc ? doc.documentElement.contains(node) : root.contains(node));
  const eligible = select => !select.multiple && select.size <= 1 && !select.hasAttribute('data-native-select');
  const make = (tag, className) => { const node = doc.createElement(tag); node.className = className; return node; };

  function labelFor(select) {
    const explicit = select.getAttribute('aria-label');
    if (explicit) return explicit;
    const referenced = select.getAttribute('aria-labelledby');
    if (referenced) {
      const text = referenced.split(/\s+/).map(id => doc.getElementById(id)?.textContent || '').join(' ').trim();
      if (text) return text;
    }
    const labels = [...(select.labels || [])].map(label => {
      const copy = label.cloneNode(true);
      copy.querySelectorAll('select,.p4g-select').forEach(node => node.remove());
      return copy.textContent.trim();
    }).filter(Boolean);
    return labels.join(' ') || select.title || select.name || (select.id === 'profile' ? 'Ramo del diario' : 'Seleziona una voce');
  }

  function rowsFor(select) {
    return [...select.options].map((option, index) => ({
      index, text: option.label || option.textContent || '', value: option.value,
      disabled: option.disabled || (option.parentElement?.tagName === 'OPTGROUP' && option.parentElement.disabled),
      hidden: option.hidden || option.parentElement?.hidden,
      group: option.parentElement?.tagName === 'OPTGROUP' ? option.parentElement.label : '',
    }));
  }

  function update(control) {
    const { select, trigger, value, wrapper } = control;
    control.rows = rowsFor(select);
    control.label = labelFor(select);
    value.textContent = control.rows[select.selectedIndex]?.text || 'Seleziona…';
    trigger.disabled = select.disabled;
    trigger.setAttribute('aria-label', `${control.label}: ${value.textContent}`);
    trigger.setAttribute('aria-required', String(select.required));
    if (select.getAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    else trigger.removeAttribute('aria-describedby');
    trigger.title = value.textContent;
    wrapper.hidden = select.hidden;
    const classes = ['p4g-select', ...[...select.classList].filter(name => name !== 'p4g-select-native')].join(' ');
    if (wrapper.className !== classes) wrapper.className = classes;
    wrapper.toggleAttribute('data-disabled', select.disabled);
    if (opened?.control === control) {
      if (select.disabled || select.hidden) close();
      else { opened.activeIndex = select.selectedIndex; renderOptions(); positionPopup(); }
    }
  }

  function upgrade(select) {
    if (controls.has(select) || !eligible(select)) return;
    const id = `p4g-select-${++nextId}`;
    const wrapper = make('span', 'p4g-select');
    const trigger = make('button', 'p4g-select-trigger');
    const value = make('span', 'p4g-select-value');
    const arrow = make('span', 'p4g-select-arrow');
    trigger.type = 'button';
    trigger.id = `${id}-trigger`;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `${id}-list`);
    arrow.setAttribute('aria-hidden', 'true');
    trigger.append(value, arrow);
    const control = { select, wrapper, trigger, value, id,
      originalTabIndex: select.getAttribute('tabindex'), originalAriaHidden: select.getAttribute('aria-hidden') };
    select.parentNode.insertBefore(wrapper, select);
    wrapper.append(select, trigger);
    select.classList.add('p4g-select-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    controls.set(select, control);
    trigger.addEventListener('click', () => opened?.control === control ? close(true) : open(control));
    trigger.addEventListener('keydown', event => keydown(event, control));
    control.redirectFocus = () => { if (!select.disabled) trigger.focus(); };
    select.addEventListener('focus', control.redirectFocus);
    update(control);
  }

  function release(control, unwrap = true) {
    if (opened?.control === control) close();
    const { select, wrapper } = control;
    select.removeEventListener('focus', control.redirectFocus);
    select.classList.remove('p4g-select-native');
    for (const [name, original] of [['tabindex', control.originalTabIndex], ['aria-hidden', control.originalAriaHidden]]) {
      if (original === null) select.removeAttribute(name); else select.setAttribute(name, original);
    }
    if (unwrap && wrapper.parentNode) { wrapper.parentNode.insertBefore(select, wrapper); wrapper.remove(); }
    controls.delete(select);
  }

  function refresh() {
    if (destroyed) return;
    for (const control of controls.values()) {
      if (!contains(control.select)) release(control, false);
      else if (!eligible(control.select)) release(control);
    }
    const selects = [...root.querySelectorAll('select')];
    if (root.matches?.('select')) selects.unshift(root);
    for (const select of selects) if (eligible(select)) {
      if (controls.has(select)) update(controls.get(select)); else upgrade(select);
    }
  }

  function scheduleRefresh() {
    if (refreshQueued || destroyed) return;
    refreshQueued = true;
    queueMicrotask(() => { refreshQueued = false; refresh(); });
  }

  function close(restoreFocus = false) {
    if (!opened) return;
    const { control, popup } = opened;
    opened = null;
    control.trigger.setAttribute('aria-expanded', 'false');
    control.trigger.removeAttribute('aria-activedescendant');
    popup.remove();
    if (restoreFocus && control.trigger.isConnected) control.trigger.focus({ preventScroll: true });
  }

  function open(control, initialQuery = '') {
    if (control.select.disabled || !control.trigger.getClientRects().length) return;
    close();
    update(control);
    const popup = make('div', 'p4g-select-popup');
    const list = make('div', 'p4g-select-list');
    const status = make('p', 'p4g-select-status');
    list.id = `${control.id}-list`;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', control.label);
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    let search = null;
    if (control.rows.filter(row => !row.hidden).length > LONG_LIST) {
      const searchBox = make('div', 'p4g-select-searchbox');
      search = make('input', 'p4g-select-search');
      search.type = 'search';
      search.placeholder = 'Cerca una voce…';
      search.autocomplete = 'off';
      search.spellcheck = false;
      search.setAttribute('aria-label', `Cerca in ${control.label}`);
      search.setAttribute('role', 'combobox');
      search.setAttribute('aria-autocomplete', 'list');
      search.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-controls', list.id);
      search.value = initialQuery;
      search.addEventListener('input', () => { if (opened) { opened.query = search.value; opened.activeIndex = -1; renderOptions(); } });
      search.addEventListener('keydown', event => keydown(event, control));
      searchBox.append(search);
      popup.append(searchBox);
    }
    popup.append(list, status);
    doc.body.append(popup);
    const scrollPositions = new Map([[doc, [view.scrollX, view.scrollY]]]);
    for (let ancestor = control.trigger.parentElement; ancestor; ancestor = ancestor.parentElement) scrollPositions.set(ancestor, [ancestor.scrollLeft, ancestor.scrollTop]);
    opened = { control, popup, list, status, search, query: initialQuery, activeIndex: control.select.selectedIndex, visibleRows: [], typeBuffer: '', typedAt: 0, scrollPositions };
    control.trigger.setAttribute('aria-expanded', 'true');
    list.addEventListener('pointerdown', event => { if (event.target.closest('[data-option-index]')) event.preventDefault(); });
    list.addEventListener('click', event => {
      const option = event.target.closest('[data-option-index]');
      if (option && option.getAttribute('aria-disabled') !== 'true') choose(Number(option.dataset.optionIndex));
    });
    renderOptions();
    positionPopup();
    if (search) search.focus({ preventScroll: true });
    else control.trigger.focus({ preventScroll: true });
  }

  function renderOptions() {
    if (!opened) return;
    const state = opened, query = normalize(state.query.trim());
    state.visibleRows = state.control.rows.filter(row => !row.hidden && (!query || normalize(row.text).includes(query)));
    if (!state.visibleRows.some(row => row.index === state.activeIndex && !row.disabled)) state.activeIndex = state.visibleRows.find(row => !row.disabled)?.index ?? -1;
    const fragment = doc.createDocumentFragment();
    let lastGroup = null;
    for (const row of state.visibleRows) {
      if (row.group && row.group !== lastGroup) {
        const group = make('div', 'p4g-select-group'); group.textContent = row.group; group.setAttribute('role', 'presentation'); fragment.append(group);
      }
      lastGroup = row.group;
      const option = make('div', 'p4g-select-option');
      option.id = `${state.control.id}-option-${row.index}`;
      option.dataset.optionIndex = row.index;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(row.index === state.control.select.selectedIndex));
      option.setAttribute('aria-disabled', String(row.disabled));
      option.textContent = row.text;
      fragment.append(option);
    }
    state.list.replaceChildren(fragment);
    state.status.textContent = state.visibleRows.length ? (state.search ? `${state.visibleRows.length} ${state.visibleRows.length === 1 ? 'voce' : 'voci'} · Invio per scegliere` : '↑ ↓ per spostarti · Invio per scegliere') : 'Nessuna voce trovata';
    highlightActive();
  }

  function highlightActive() {
    if (!opened) return;
    const { control, list, activeIndex, search } = opened;
    for (const node of list.children) node.toggleAttribute('data-active', Number(node.dataset.optionIndex) === activeIndex && node.hasAttribute('data-option-index'));
    const active = activeIndex < 0 ? null : doc.getElementById(`${control.id}-option-${activeIndex}`);
    for (const owner of [control.trigger, search].filter(Boolean)) {
      if (active) owner.setAttribute('aria-activedescendant', active.id); else owner.removeAttribute('aria-activedescendant');
    }
    // Scroll only this list. scrollIntoView() may also scroll an ancestor and
    // incorrectly trigger the deliberate "close on page scroll" behaviour.
    if (active) {
      const optionRect = active.getBoundingClientRect(), listRect = list.getBoundingClientRect();
      if (optionRect.top < listRect.top) list.scrollTop -= listRect.top - optionRect.top;
      else if (optionRect.bottom > listRect.bottom) list.scrollTop += optionRect.bottom - listRect.bottom;
    }
  }

  function move(direction) {
    if (!opened) return;
    const options = opened.visibleRows.filter(row => !row.disabled);
    if (!options.length) return;
    const current = options.findIndex(row => row.index === opened.activeIndex);
    const position = direction === 'first' ? 0 : direction === 'last' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, current + direction));
    opened.activeIndex = options[position].index;
    highlightActive();
  }

  function choose(index) {
    if (!opened) return;
    const { control } = opened, { select } = control;
    const option = control.rows[index];
    if (!option || option.disabled || option.hidden || select.disabled) return;
    const changed = select.selectedIndex !== index;
    const identity = { id: select.id, quest: select.getAttribute('data-quest-state') };
    select.selectedIndex = index;
    close(true);
    update(control);
    if (changed) select.dispatchEvent(new view.Event('change', { bubbles: true }));
    // The app may replace the entire view during its synchronous change handler.
    refresh();
    const replacement = select.isConnected ? select : identity.id ? doc.getElementById(identity.id) : identity.quest ? [...root.querySelectorAll('select[data-quest-state]')].find(node => node.getAttribute('data-quest-state') === identity.quest) : null;
    controls.get(replacement)?.trigger.focus({ preventScroll: true });
  }

  function tabAway(backward) {
    const trigger = opened.control.trigger;
    const nodes = [...doc.querySelectorAll('button,a[href],input,textarea,select,[tabindex]')].filter(node => node.tabIndex >= 0 && !node.disabled && !node.classList.contains('p4g-select-native') && !opened.popup.contains(node) && node.getClientRects().length && view.getComputedStyle(node).visibility !== 'hidden');
    const next = nodes[nodes.indexOf(trigger) + (backward ? -1 : 1)];
    close();
    (next || trigger).focus();
  }

  function keydown(event, control) {
    if (event.isComposing || control.select.disabled) return;
    const current = opened?.control === control;
    if (event.key === 'Escape' && current) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === 'Tab' && current) { event.preventDefault(); tabAway(event.shiftKey); return; }
    if (event.key === 'Enter' || (event.key === ' ' && event.target === control.trigger)) {
      event.preventDefault(); if (current) choose(opened.activeIndex); else open(control); return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!current) open(control);
      if (event.key === 'Home') move('first'); else if (event.key === 'End') move('last');
      else if (current) move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.target === control.trigger && event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      if (!current) open(control, control.rows.length > LONG_LIST ? event.key : '');
      if (!opened) return;
      if (opened.search) {
        if (current) { opened.search.value += event.key; opened.query = opened.search.value; renderOptions(); }
        opened.search.focus();
      } else {
        const now = Date.now();
        opened.typeBuffer = now - opened.typedAt > 700 ? event.key : opened.typeBuffer + event.key;
        opened.typedAt = now;
        const typed = normalize(opened.typeBuffer);
        const target = opened.visibleRows.find(row => !row.disabled && normalize(row.text).startsWith(typed));
        if (target) { opened.activeIndex = target.index; highlightActive(); }
      }
    }
  }

  function positionPopup() {
    if (!opened) return;
    const rect = opened.control.trigger.getBoundingClientRect();
    const margin = 8, gap = 6, width = Math.min(view.innerWidth - margin * 2, Math.max(rect.width, 230));
    const below = view.innerHeight - rect.bottom - margin - gap, above = rect.top - margin - gap;
    const upwards = below < 240 && above > below;
    const maxHeight = Math.max(80, Math.min(420, upwards ? above : below));
    const popup = opened.popup;
    popup.style.setProperty('--p4g-popup-width', `${width}px`);
    popup.style.setProperty('--p4g-popup-max-height', `${maxHeight}px`);
    popup.style.setProperty('--p4g-popup-left', `${Math.max(margin, Math.min(rect.left, view.innerWidth - width - margin))}px`);
    const height = popup.getBoundingClientRect().height;
    popup.style.setProperty('--p4g-popup-top', `${upwards ? Math.max(margin, rect.top - gap - height) : rect.bottom + gap}px`);
  }

  const nativeChange = event => { const control = controls.get(event.target); if (control) update(control); };
  const outside = event => { if (opened && !opened.popup.contains(event.target) && !opened.control.wrapper.contains(event.target)) close(); };
  const scroll = event => {
    if (!opened || opened.popup.contains(event.target)) return;
    // A click that first brings a field into view can leave a queued scroll
    // event. It predates the popup: close only if that container moved since
    // opening, rather than immediately dismissing the newly opened menu.
    const before = opened.scrollPositions.get(event.target);
    const current = event.target === doc ? [view.scrollX, view.scrollY] : [event.target.scrollLeft, event.target.scrollTop];
    if (!before || before[0] !== current[0] || before[1] !== current[1]) close();
  };
  const resize = () => close();
  const reset = () => queueMicrotask(refresh);
  doc.addEventListener('change', nativeChange, true);
  doc.addEventListener('input', nativeChange, true);
  doc.addEventListener('pointerdown', outside, true);
  doc.addEventListener('scroll', scroll, true);
  doc.addEventListener('reset', reset, true);
  view.addEventListener('resize', resize);
  view.addEventListener('blur', resize);
  const observer = new view.MutationObserver(records => {
    if (destroyed) return;
    for (const record of records) {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (target?.closest('select')) { scheduleRefresh(); return; }
      if (record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.matches('select') || node.querySelector('select')))) { scheduleRefresh(); return; }
    }
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ['disabled', 'selected', 'label', 'value', 'hidden', 'class', 'multiple', 'size', 'aria-label', 'aria-labelledby', 'aria-describedby', 'required', 'title'] });
  const api = { refresh, close,
    destroy() {
      if (destroyed) return;
      destroyed = true; observer.disconnect(); close();
      doc.removeEventListener('change', nativeChange, true); doc.removeEventListener('input', nativeChange, true);
      doc.removeEventListener('pointerdown', outside, true); doc.removeEventListener('scroll', scroll, true);
      doc.removeEventListener('reset', reset, true); view.removeEventListener('resize', resize); view.removeEventListener('blur', resize);
      for (const control of [...controls.values()]) release(control);
      installations.delete(root);
    },
  };
  installations.set(root, api);
  refresh();
  return api;
}

export default installSelectControls;

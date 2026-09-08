import { browser } from '../lib/browser.js';
import { REGIONS, regionName, regionShortName } from '../lib/regions.js';
import { SOURCE_NAME, SOURCE_URL, STATUS } from '../lib/source.js';
import {
  DEFAULT_SETTINGS,
  MAX_LABEL_LENGTH,
  MAX_TEMPLATE_LENGTH,
  MAX_WATCHES,
  MAX_INTERVAL_MINUTES,
  MIN_INTERVAL_MINUTES,
  firstUnwatchedRegion,
  newWatchId,
  normalizeSettings,
} from '../lib/settings.js';
import { formatTitle } from '../lib/title.js';
import { t } from '../lib/i18n.js';

const language = document.getElementById('language');
const watchList = document.getElementById('watches');
const addButton = document.getElementById('add');
const interval = document.getElementById('interval');
const preview = document.getElementById('preview');
const statusLine = document.getElementById('status');
const resetButton = document.getElementById('reset');
const sourceNote = document.getElementById('source-note');

const templateFields = {
  [STATUS.ALERT]: document.getElementById('template-alert'),
  [STATUS.CLEAR]: document.getElementById('template-clear'),
  [STATUS.UNKNOWN]: document.getElementById('template-unknown'),
};

/** The last saved settings, so a redraw never has to read storage again. */
let current = DEFAULT_SETTINGS;
let statusTimer = null;

const say = (message) => {
  statusLine.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusLine.textContent = '';
  }, 1500);
};

// ── Rendering ──────────────────────────────────────────────────────────────

const paintInterfaceLanguage = () => {
  const { language: lang } = current;
  document.documentElement.lang = lang;
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(lang, node.dataset.i18n);
  }
  sourceNote.textContent = t(lang, 'sourceNote', { source: SOURCE_NAME });
  addButton.disabled = current.watches.length >= MAX_WATCHES;
};

/** Regions in the alphabetical order of whichever language is on screen. */
const sortedRegions = (lang) =>
  [...REGIONS].sort((a, b) =>
    regionName(a.id, lang).localeCompare(regionName(b.id, lang), lang),
  );

const buildRegionSelect = (watch, lang) => {
  const select = document.createElement('select');
  select.className = 'control region';
  for (const region of sortedRegions(lang)) {
    const option = document.createElement('option');
    option.value = region.id;
    option.textContent = regionName(region.id, lang);
    select.append(option);
  }
  select.value = watch.region;
  return select;
};

const buildWatchRow = (watch) => {
  const { language: lang } = current;
  const item = document.createElement('li');
  item.className = 'watch';
  item.dataset.id = watch.id;

  const select = buildRegionSelect(watch, lang);

  const label = document.createElement('input');
  label.type = 'text';
  label.className = 'control label';
  label.maxLength = MAX_LABEL_LENGTH;
  label.value = watch.label;
  label.placeholder = regionShortName(watch.region, lang);

  // The placeholder is the region's own name, so it follows the region.
  select.addEventListener('change', () => {
    label.placeholder = regionShortName(select.value, lang);
  });

  // The click itself is handled by one listener on the list, further down.
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ghost remove';
  remove.title = t(lang, 'remove');
  remove.setAttribute('aria-label', t(lang, 'remove'));
  remove.textContent = '×';

  item.append(select, label, remove);
  return item;
};

const paintWatches = () => {
  watchList.replaceChildren(...current.watches.map(buildWatchRow));
};

const paintPreview = () => {
  const rows = current.watches.map((watch) => {
    const item = document.createElement('li');
    for (const status of Object.values(STATUS)) {
      const chip = document.createElement('span');
      chip.className = `chip ${status}`;
      chip.textContent = formatTitle(watch, status, current);
      item.append(chip);
    }
    return item;
  });
  preview.replaceChildren(...rows);
};

const paintForm = () => {
  language.value = current.language;
  interval.value = String(current.intervalMinutes);
  interval.min = String(MIN_INTERVAL_MINUTES);
  interval.max = String(MAX_INTERVAL_MINUTES);
  for (const [status, field] of Object.entries(templateFields)) {
    field.maxLength = MAX_TEMPLATE_LENGTH;
    field.value = current.templates[current.language][status];
  }
};

/** Everything but the watch rows, which are rebuilt only when they change. */
const paint = () => {
  paintInterfaceLanguage();
  paintForm();
  paintPreview();
};

// ── Reading the form back ──────────────────────────────────────────────────

const collect = () => {
  const watches = [...watchList.children].map((item) => ({
    id: item.dataset.id,
    region: item.querySelector('.region').value,
    label: item.querySelector('.label').value,
  }));

  // The wording fields hold the language the page is *showing*, which is not
  // the one in the select when it is the select that just changed. Filing
  // them under the new language would overwrite it with the old one's text.
  const shown = current.language;

  return {
    ...current,
    language: language.value,
    intervalMinutes: Number(interval.value),
    watches,
    templates: {
      ...current.templates,
      [shown]: Object.fromEntries(
        Object.entries(templateFields).map(([status, field]) => [
          status,
          field.value,
        ]),
      ),
    },
  };
};

/**
 * Normalizing before saving means a rejected value — an interval out of range,
 * wording left empty — is replaced rather than stored, and repainting means
 * the page shows exactly what the background script will use.
 */
const save = async ({ redraw = false, message } = {}) => {
  const previousLanguage = current.language;
  current = normalizeSettings(collect());
  await browser.storage.local.set({ settings: current });
  paint();
  if (redraw || current.language !== previousLanguage) paintWatches();
  say(message ?? t(current.language, 'saved'));
};

// ── Events ─────────────────────────────────────────────────────────────────

watchList.addEventListener('click', (event) => {
  const button = event.target.closest('.remove');
  if (!button) return;
  button.closest('.watch').remove();
  save({ redraw: true });
});

addButton.addEventListener('click', () => {
  if (current.watches.length >= MAX_WATCHES) {
    say(t(current.language, 'limitReached'));
    return;
  }
  watchList.append(
    buildWatchRow({
      id: newWatchId(),
      region: firstUnwatchedRegion(current.watches),
      label: '',
    }),
  );
  save({ redraw: true });
});

resetButton.addEventListener('click', async () => {
  current = normalizeSettings(structuredClone(DEFAULT_SETTINGS));
  await browser.storage.local.set({ settings: current });
  paint();
  paintWatches();
  say(t(current.language, 'restored'));
});

// `change` rather than `input`: a text field commits on blur, so a redraw
// never yanks the caret out from under someone still typing.
document.addEventListener('change', () => save());

const load = async () => {
  const { settings } = await browser.storage.local.get('settings');
  current = normalizeSettings(settings ?? DEFAULT_SETTINGS);
  paint();
  paintWatches();
};

sourceNote.title = SOURCE_URL;
load();

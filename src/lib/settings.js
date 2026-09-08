/**
 * The settings object, its defaults, and the repair pass every read goes
 * through.
 *
 * Storage is the only channel between the options page and the background
 * script, and a settings object can also be edited by hand, so nothing is
 * trusted on the way in: unknown regions, out-of-range intervals and empty
 * wording are replaced rather than allowed to reach a bookmark title.
 */

import { REGIONS, regionById } from './regions.js';
import { STATUS } from './source.js';

export const LANGUAGES = ['uk', 'en'];

/** `{name}` is replaced with the bookmark's label. */
export const NAME_PLACEHOLDER = '{name}';

export const DEFAULT_TEMPLATES = {
  uk: {
    [STATUS.ALERT]: '{name} — ТРИВОГА',
    [STATUS.CLEAR]: '{name} — тихо',
    [STATUS.UNKNOWN]: '{name} — ?',
  },
  en: {
    [STATUS.ALERT]: '{name} — ALERT',
    [STATUS.CLEAR]: '{name} — clear',
    [STATUS.UNKNOWN]: '{name} — ?',
  },
};

/** One bookmark per watch, and a toolbar has only so much room. */
export const MAX_WATCHES = 10;

export const MAX_LABEL_LENGTH = 40;
export const MAX_TEMPLATE_LENGTH = 60;

export const MIN_INTERVAL_MINUTES = 1;
export const MAX_INTERVAL_MINUTES = 60;

export const DEFAULT_REGION = 'kyiv-city';

export const DEFAULT_SETTINGS = {
  language: 'uk',
  intervalMinutes: 1,
  watches: [{ id: 'kyiv-city-default', region: DEFAULT_REGION, label: '' }],
  templates: DEFAULT_TEMPLATES,
};

export const newWatchId = () => globalThis.crypto.randomUUID();

const text = (value, limit, fallback) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, limit);
  return trimmed || fallback;
};

const clampInt = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
};

const normalizeWatches = (value) => {
  if (!Array.isArray(value)) return structuredClone(DEFAULT_SETTINGS.watches);

  const seen = new Set();
  const watches = [];
  for (const entry of value) {
    if (watches.length === MAX_WATCHES) break;
    if (!regionById(entry?.region)) continue;
    const id =
      typeof entry.id === 'string' && !seen.has(entry.id)
        ? entry.id
        : newWatchId();
    seen.add(id);
    watches.push({
      id,
      region: entry.region,
      // An empty label is not a missing value: it means "use the region's own
      // name", which then follows the chosen language.
      label: text(entry.label, MAX_LABEL_LENGTH, ''),
    });
  }
  return watches;
};

const normalizeTemplates = (value) => {
  const templates = {};
  for (const language of LANGUAGES) {
    const defaults = DEFAULT_TEMPLATES[language];
    const stored = value?.[language];
    templates[language] = {};
    for (const status of Object.values(STATUS)) {
      templates[language][status] = text(
        stored?.[status],
        MAX_TEMPLATE_LENGTH,
        defaults[status],
      );
    }
  }
  return templates;
};

/** Drops unknown keys and out-of-range values read back out of storage. */
export const normalizeSettings = (stored) => {
  const source = stored && typeof stored === 'object' ? stored : {};
  return {
    language: LANGUAGES.includes(source.language)
      ? source.language
      : DEFAULT_SETTINGS.language,
    intervalMinutes: clampInt(
      source.intervalMinutes,
      MIN_INTERVAL_MINUTES,
      MAX_INTERVAL_MINUTES,
      DEFAULT_SETTINGS.intervalMinutes,
    ),
    watches: normalizeWatches(source.watches),
    templates: normalizeTemplates(source.templates),
  };
};

/** The region a freshly added row starts on: the first one not yet watched. */
export const firstUnwatchedRegion = (watches) => {
  const taken = new Set(watches.map((watch) => watch.region));
  const free = REGIONS.find((region) => !taken.has(region.id));
  return (free ?? REGIONS[0]).id;
};

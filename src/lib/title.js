/**
 * Rendering one bookmark title.
 *
 * Kept apart from everything that touches the browser so the wording can be
 * tested with `node --test`, and so the options page can preview exactly what
 * the background script will write.
 */

import { regionShortName } from './regions.js';
import { STATUS, isAlert } from './source.js';
import { ALERT, DEFAULT_TEMPLATES, NAME_PLACEHOLDER } from './settings.js';

/** What the user typed, or the region's own name in the chosen language. */
export const labelOf = (watch, language) =>
  watch.label?.trim() || regionShortName(watch.region, language);

/** Which wording a status is written with: merged levels share one. */
export const wordingOf = (status, settings) =>
  settings.mergeLevels && isAlert(status) ? ALERT : status;

/** Renders one wording as it stands, whatever status it belongs to. */
export const formatWording = (watch, wording, settings) => {
  const language = settings.language;
  const defaults = DEFAULT_TEMPLATES[language] ?? DEFAULT_TEMPLATES.uk;
  const templates = settings.templates?.[language] ?? defaults;
  const template =
    templates[wording] ?? defaults[wording] ?? templates[STATUS.UNKNOWN] ?? '';
  // A function replacement, so a label containing `$&` is inserted literally.
  return template.replaceAll(NAME_PLACEHOLDER, () => labelOf(watch, language));
};

export const formatTitle = (watch, status, settings) =>
  formatWording(watch, wordingOf(status, settings), settings);

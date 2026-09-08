/**
 * Rendering one bookmark title.
 *
 * Kept apart from everything that touches the browser so the wording can be
 * tested with `node --test`, and so the options page can preview exactly what
 * the background script will write.
 */

import { regionShortName } from './regions.js';
import { STATUS } from './source.js';
import { DEFAULT_TEMPLATES, NAME_PLACEHOLDER } from './settings.js';

/** What the user typed, or the region's own name in the chosen language. */
export const labelOf = (watch, language) =>
  watch.label?.trim() || regionShortName(watch.region, language);

export const formatTitle = (watch, status, settings) => {
  const language = settings.language;
  const defaults = DEFAULT_TEMPLATES[language] ?? DEFAULT_TEMPLATES.uk;
  const templates = settings.templates?.[language] ?? defaults;
  const template = templates[status] ?? templates[STATUS.UNKNOWN] ?? '';
  // A function replacement, so a label containing `$&` is inserted literally.
  return template.replaceAll(NAME_PLACEHOLDER, () => labelOf(watch, language));
};

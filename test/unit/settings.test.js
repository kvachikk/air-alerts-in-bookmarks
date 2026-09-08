import test from 'node:test';
import assert from 'node:assert/strict';

import { REGIONS } from '../../src/lib/regions.js';
import {
  DEFAULT_SETTINGS,
  DEFAULT_TEMPLATES,
  MAX_WATCHES,
  firstUnwatchedRegion,
  normalizeSettings,
} from '../../src/lib/settings.js';

test('an absent or unusable settings object becomes the defaults', () => {
  assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
  assert.deepEqual(normalizeSettings('nonsense'), DEFAULT_SETTINGS);
  assert.deepEqual(normalizeSettings({}), DEFAULT_SETTINGS);
});

test('the interval is clamped into the range the alarm accepts', () => {
  assert.equal(normalizeSettings({ intervalMinutes: 0 }).intervalMinutes, 1);
  assert.equal(normalizeSettings({ intervalMinutes: 900 }).intervalMinutes, 60);
  assert.equal(
    normalizeSettings({ intervalMinutes: '15' }).intervalMinutes,
    15,
  );
  assert.equal(normalizeSettings({ intervalMinutes: 'x' }).intervalMinutes, 1);
});

test('an unknown language falls back to Ukrainian', () => {
  assert.equal(normalizeSettings({ language: 'en' }).language, 'en');
  assert.equal(normalizeSettings({ language: 'de' }).language, 'uk');
});

test('watches on a region this build does not know are dropped', () => {
  const { watches } = normalizeSettings({
    watches: [
      { id: 'a', region: 'lviv', label: '' },
      { id: 'b', region: 'atlantis', label: '' },
    ],
  });
  assert.deepEqual(watches, [{ id: 'a', region: 'lviv', label: '' }]);
});

test('watches sharing an id are given distinct ones', () => {
  const { watches } = normalizeSettings({
    watches: [
      { id: 'same', region: 'lviv' },
      { id: 'same', region: 'odesa' },
    ],
  });
  assert.equal(watches.length, 2);
  assert.notEqual(watches[0].id, watches[1].id);
});

test('a watch without an id is given one', () => {
  const { watches } = normalizeSettings({ watches: [{ region: 'lviv' }] });
  assert.equal(typeof watches[0].id, 'string');
  assert.ok(watches[0].id.length > 0);
});

test('labels are trimmed, and the list is capped', () => {
  const { watches } = normalizeSettings({
    watches: [
      { id: 'a', region: 'lviv', label: '  Дім  ' },
      ...REGIONS.map((region) => ({ id: region.id, region: region.id })),
    ],
  });
  assert.equal(watches[0].label, 'Дім');
  assert.equal(watches.length, MAX_WATCHES);
});

test('a label longer than the limit is cut rather than refused', () => {
  const long = 'я'.repeat(200);
  const { watches } = normalizeSettings({
    watches: [{ id: 'a', region: 'lviv', label: long }],
  });
  assert.equal(watches[0].label.length, 40);
});

test('empty wording falls back to the default for that language', () => {
  const { templates } = normalizeSettings({
    templates: { uk: { alert: '   ', clear: 'тихо' } },
  });
  assert.equal(templates.uk.alert, DEFAULT_TEMPLATES.uk.alert);
  assert.equal(templates.uk.clear, 'тихо');
  assert.deepEqual(templates.en, DEFAULT_TEMPLATES.en);
});

test('firstUnwatchedRegion skips what is already on the list', () => {
  const first = REGIONS[0].id;
  assert.equal(firstUnwatchedRegion([]), first);
  assert.equal(firstUnwatchedRegion([{ region: first }]), REGIONS[1].id);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { STATUS } from '../../src/lib/source.js';
import { DEFAULT_SETTINGS, normalizeSettings } from '../../src/lib/settings.js';
import { formatTitle, labelOf } from '../../src/lib/title.js';

const settings = (overrides) =>
  normalizeSettings({ ...DEFAULT_SETTINGS, ...overrides });

const kyiv = { id: 'w1', region: 'kyiv-city', label: '' };
const volyn = { id: 'w2', region: 'volyn', label: '' };

test('an empty label falls back to the region name', () => {
  assert.equal(labelOf(volyn, 'uk'), 'Луцьк');
  assert.equal(labelOf(volyn, 'en'), 'Lutsk');
});

test('a label the user typed wins over the region name', () => {
  const watch = { ...volyn, label: 'Дім' };
  assert.equal(labelOf(watch, 'uk'), 'Дім');
  assert.equal(labelOf(watch, 'en'), 'Дім');
});

test('merged by default, either level reads as a plain alert', () => {
  const config = settings({ language: 'uk' });
  assert.equal(formatTitle(kyiv, STATUS.RED, config), 'Київ — ТРИВОГА');
  assert.equal(formatTitle(kyiv, STATUS.YELLOW, config), 'Київ — ТРИВОГА');
  assert.equal(formatTitle(kyiv, STATUS.CLEAR, config), 'Київ — тихо');
  assert.equal(formatTitle(kyiv, STATUS.UNKNOWN, config), 'Київ — ?');
});

test('split, yellow and red read differently', () => {
  const uk = settings({ language: 'uk', mergeLevels: false });
  assert.equal(formatTitle(kyiv, STATUS.RED, uk), 'Київ — ЧЕРВОНА');
  assert.equal(formatTitle(kyiv, STATUS.YELLOW, uk), 'Київ — ЖОВТА');
  assert.equal(formatTitle(kyiv, STATUS.CLEAR, uk), 'Київ — тихо');

  const en = settings({ language: 'en', mergeLevels: false });
  assert.equal(formatTitle(kyiv, STATUS.RED, en), 'Kyiv — RED');
  assert.equal(formatTitle(kyiv, STATUS.YELLOW, en), 'Kyiv — YELLOW');
});

test('switching language switches both the name and the wording', () => {
  const config = settings({ language: 'en' });
  assert.equal(formatTitle(kyiv, STATUS.RED, config), 'Kyiv — ALERT');
  assert.equal(formatTitle(volyn, STATUS.CLEAR, config), 'Lutsk — clear');
});

test('wording edited in one language leaves the other alone', () => {
  const config = settings({
    language: 'uk',
    templates: { uk: { alert: '{name}: тривожно!' } },
  });
  assert.equal(formatTitle(kyiv, STATUS.RED, config), 'Київ: тривожно!');
  assert.equal(formatTitle(kyiv, STATUS.CLEAR, config), 'Київ — тихо');
  assert.equal(
    formatTitle(kyiv, STATUS.RED, { ...config, language: 'en' }),
    'Kyiv — ALERT',
  );
});

test('the placeholder may be used more than once, or not at all', () => {
  const twice = settings({ templates: { uk: { alert: '{name} {name}' } } });
  assert.equal(formatTitle(kyiv, STATUS.RED, twice), 'Київ Київ');

  const none = settings({ templates: { uk: { clear: 'все спокійно' } } });
  assert.equal(formatTitle(kyiv, STATUS.CLEAR, none), 'все спокійно');
});

test('a label containing $& is inserted literally', () => {
  const watch = { ...kyiv, label: 'a$&b' };
  assert.equal(formatTitle(watch, STATUS.RED, settings()), 'a$&b — ТРИВОГА');
});

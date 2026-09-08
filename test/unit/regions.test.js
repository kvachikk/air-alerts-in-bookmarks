import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REGIONS,
  regionById,
  regionName,
  regionShortName,
} from '../../src/lib/regions.js';

test('every region has an id, a wire key and both languages', () => {
  for (const region of REGIONS) {
    assert.ok(region.id, 'id');
    assert.ok(region.key, `key for ${region.id}`);
    for (const language of ['uk', 'en']) {
      assert.ok(region[language].name, `${language} name for ${region.id}`);
      assert.ok(region[language].short, `${language} short for ${region.id}`);
    }
  }
});

test('ids and wire keys are unique', () => {
  const ids = new Set(REGIONS.map((region) => region.id));
  const keys = new Set(REGIONS.map((region) => region.key));
  assert.equal(ids.size, REGIONS.length);
  assert.equal(keys.size, REGIONS.length);
});

test('the whole country is covered: 24 oblasts, Kyiv and Sevastopol', () => {
  assert.equal(REGIONS.length, 26);
});

test('lookups answer, and answer emptily for an id that is not there', () => {
  assert.equal(regionById('lviv').key, 'Львівська область');
  assert.equal(regionById('atlantis'), null);
  assert.equal(regionName('lviv', 'en'), 'Lviv oblast');
  assert.equal(regionShortName('lviv', 'uk'), 'Львів');
  assert.equal(regionName('atlantis', 'uk'), '');
  assert.equal(regionShortName('atlantis', 'uk'), '');
});

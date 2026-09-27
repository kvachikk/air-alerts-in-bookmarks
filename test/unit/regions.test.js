import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REGIONS,
  regionById,
  regionName,
  regionShortName,
} from '../../src/lib/regions.js';
import { SUBREGIONS } from '../../src/lib/subregions.js';

test('every region has an id, a source id and both languages', () => {
  for (const region of REGIONS) {
    assert.ok(region.id, 'id');
    assert.ok(region.sourceId, `source id for ${region.id}`);
    for (const language of ['uk', 'en']) {
      assert.ok(region[language].name, `${language} name for ${region.id}`);
      assert.ok(region[language].short, `${language} short for ${region.id}`);
    }
  }
});

test('ids and source ids are unique', () => {
  const ids = new Set(REGIONS.map((region) => region.id));
  const keys = new Set(REGIONS.map((region) => region.sourceId));
  assert.equal(ids.size, REGIONS.length);
  assert.equal(keys.size, REGIONS.length);
});

test('the whole country is covered: 24 oblasts, Kyiv and Sevastopol', () => {
  assert.equal(REGIONS.length, 26);
});

test('lookups answer, and answer emptily for an id that is not there', () => {
  assert.equal(regionById('lviv').sourceId, '27');
  assert.equal(regionById('atlantis'), null);
  assert.equal(regionName('lviv', 'en'), 'Lviv oblast');
  assert.equal(regionShortName('lviv', 'uk'), 'Львів');
  assert.equal(regionName('atlantis', 'uk'), '');
  assert.equal(regionShortName('atlantis', 'uk'), '');
});

test('no district or community is claimed by two regions', () => {
  const seen = new Map();
  for (const region of REGIONS) {
    for (const id of [Number(region.sourceId), ...SUBREGIONS[region.id]]) {
      assert.ok(!seen.has(id), `${id} in ${region.id} and ${seen.get(id)}`);
      seen.set(id, region.id);
    }
  }
});

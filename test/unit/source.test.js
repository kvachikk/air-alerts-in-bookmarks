import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STATUS,
  fetchSnapshot,
  parseSnapshot,
  statusOf,
} from '../../src/lib/source.js';

/** Trimmed to three regions; the shape is what the live feed returns. */
const payload = {
  source: 'test',
  states: {
    'м. Київ': { alertnow: true, changed: '2026-09-08 15:33:27' },
    'Волинська область': { alertnow: false, changed: '1970-01-01 03:00:00' },
    'Ніде така область': { alertnow: true, changed: '1970-01-01 03:00:00' },
  },
};

const ok = (body) => async () => ({
  ok: true,
  status: 200,
  json: async () => body,
});

test('parseSnapshot keeps the regions this build knows', () => {
  const alerts = parseSnapshot(payload);
  assert.deepEqual(alerts, { 'kyiv-city': true, volyn: false });
});

test('parseSnapshot rejects a payload with no states', () => {
  assert.throws(() => parseSnapshot({}), /no regions/);
  assert.throws(() => parseSnapshot(null), /no regions/);
});

test('parseSnapshot rejects a payload of regions it cannot place', () => {
  const foreign = { states: { Atlantis: { alertnow: true } } };
  assert.throws(() => parseSnapshot(foreign), /no region this build knows/);
});

test('parseSnapshot skips a flag that is not a boolean', () => {
  const mixed = {
    states: {
      'м. Київ': { alertnow: 'yes' },
      'Волинська область': { alertnow: true },
    },
  };
  assert.deepEqual(parseSnapshot(mixed), { volyn: true });
});

test('statusOf maps the flag, and an absence, to a status', () => {
  const alerts = parseSnapshot(payload);
  assert.equal(statusOf(alerts, 'kyiv-city'), STATUS.ALERT);
  assert.equal(statusOf(alerts, 'volyn'), STATUS.CLEAR);
  assert.equal(statusOf(alerts, 'lviv'), STATUS.UNKNOWN);
  assert.equal(statusOf(null, 'kyiv-city'), STATUS.UNKNOWN);
});

test('fetchSnapshot asks once and sends no credentials', async () => {
  const calls = [];
  const request = (url, options) => {
    calls.push({ url, options });
    return ok(payload)();
  };

  const alerts = await fetchSnapshot(request);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.credentials, 'omit');
  assert.deepEqual(alerts, { 'kyiv-city': true, volyn: false });
});

test('fetchSnapshot reports the status code it was refused with', async () => {
  const request = async () => ({ ok: false, status: 429 });
  await assert.rejects(() => fetchSnapshot(request), /HTTP 429/);
});

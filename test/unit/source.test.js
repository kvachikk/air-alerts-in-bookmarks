import test from 'node:test';
import assert from 'node:assert/strict';

import {
  STATUS,
  fetchSnapshot,
  isAlert,
  parseSnapshot,
  statusOf,
} from '../../src/lib/source.js';

/** Builds one feed entry the way the live feed shapes it. */
const entry = (regionId, alerts) => ({
  regionId,
  regionType: 'State',
  activeAlerts: alerts.map(([type, ...levels]) => ({
    regionId,
    type,
    activeAlertLevels: levels.map((alertLevel) => ({ alertLevel })),
  })),
});

/** Kyiv on yellow, Lviv red through Lviv district, nowhere else. */
const payload = [
  entry('31', [['AIR', 'Yellow']]),
  entry('90', [['AIR', 'Red']]),
];

const ok = (body) => async () => ({
  ok: true,
  status: 200,
  json: async () => body,
});

test('parseSnapshot reads both levels, and silence as clear', () => {
  const alerts = parseSnapshot(payload);
  assert.equal(alerts['kyiv-city'], STATUS.YELLOW);
  assert.equal(alerts.lviv, STATUS.RED);
  assert.equal(alerts.volyn, STATUS.CLEAR);
});

test('a district or community counts towards its oblast', () => {
  // 761 is the city of Kropyvnytskyi, inside Kirovohrad oblast.
  assert.equal(
    parseSnapshot([entry('761', [['AIR', 'Yellow']])]).kirovohrad,
    STATUS.YELLOW,
  );
  // Kharkiv city sits beside its oblast in the source, not inside it.
  assert.equal(
    parseSnapshot([entry('1293', [['AIR', 'Red']])]).kharkiv,
    STATUS.RED,
  );
});

test('the strongest level anywhere in the region wins', () => {
  const alerts = parseSnapshot([
    entry('14', [['AIR', 'Yellow']]),
    entry('73', [['AIR', 'Yellow', 'Red']]),
  ]);
  assert.equal(alerts['kyiv-oblast'], STATUS.RED);
});

test('only air raids count', () => {
  const alerts = parseSnapshot([entry('22', [['ARTILLERY', 'Red']])]);
  assert.equal(alerts.kharkiv, STATUS.CLEAR);
});

test('an air raid with no level, or an unknown one, reads as red', () => {
  assert.equal(
    parseSnapshot([entry('31', [['AIR']])])['kyiv-city'],
    STATUS.RED,
  );
  assert.equal(
    parseSnapshot([entry('31', [['AIR', 'Purple']])])['kyiv-city'],
    STATUS.RED,
  );
});

test('places this build cannot place are ignored', () => {
  const alerts = parseSnapshot([entry('0', [['AIR', 'Red']])]);
  assert.ok(Object.values(alerts).every((status) => status === STATUS.CLEAR));
});

test('parseSnapshot rejects a payload it cannot read', () => {
  assert.throws(() => parseSnapshot({}), /no regions/);
  assert.throws(() => parseSnapshot(null), /no regions/);
  assert.throws(() => parseSnapshot([{ regionId: '31' }]), /cannot read/);
});

test('statusOf maps the level, and an absence, to a status', () => {
  const alerts = parseSnapshot(payload);
  assert.equal(statusOf(alerts, 'kyiv-city'), STATUS.YELLOW);
  assert.equal(statusOf(alerts, 'lviv'), STATUS.RED);
  assert.equal(statusOf(alerts, 'volyn'), STATUS.CLEAR);
  assert.equal(statusOf(alerts, 'atlantis'), STATUS.UNKNOWN);
  assert.equal(statusOf(null, 'kyiv-city'), STATUS.UNKNOWN);
  // A snapshot stored by the previous version held booleans.
  assert.equal(statusOf({ 'kyiv-city': true }, 'kyiv-city'), STATUS.UNKNOWN);
});

test('both levels are alerts, and nothing else is', () => {
  assert.ok(isAlert(STATUS.RED));
  assert.ok(isAlert(STATUS.YELLOW));
  assert.ok(!isAlert(STATUS.CLEAR));
  assert.ok(!isAlert(STATUS.UNKNOWN));
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
  assert.equal(alerts['kyiv-city'], STATUS.YELLOW);
});

test('fetchSnapshot reports the status code it was refused with', async () => {
  const request = async () => ({ ok: false, status: 429 });
  await assert.rejects(() => fetchSnapshot(request), /HTTP 429/);
});

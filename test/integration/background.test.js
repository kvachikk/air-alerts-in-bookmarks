/**
 * Runs the real background script against a fake WebExtension API.
 *
 * What this is here to prove is the thing the extension is built around: one
 * request per tick, no matter how many bookmarks the user keeps.
 *
 * The fake is shared and reset between tests rather than rebuilt, because
 * `background.js` reads the API namespace once when it is imported and Node
 * imports a module only once.
 */

import test, { before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createFakeBrowser } from './fake-browser.js';

const FEED = {
  states: {
    'м. Київ': { alertnow: true },
    'Волинська область': { alertnow: false },
    'Львівська область': { alertnow: false },
  },
};

const WATCHES = [
  { id: 'w1', region: 'kyiv-city', label: '' },
  { id: 'w2', region: 'volyn', label: 'Луцьк' },
  { id: 'w3', region: 'lviv', label: '' },
];

const fake = createFakeBrowser();
let requests = [];
let respond = null;

const ok = async () => ({ ok: true, status: 200, json: async () => FEED });

globalThis.browser = fake.api;
globalThis.fetch = async (url, options) => {
  requests.push({ url, options });
  return respond(requests.length);
};

before(() => import('../../src/background.js'));

beforeEach(() => {
  fake.reset();
  requests = [];
  respond = ok;
});

/** Installs settings and runs one poll, the way an alarm would. */
const run = async (settings) => {
  if (settings) fake.seed('settings', settings);
  await fake.tick();
};

test('one tick makes one request, however many bookmarks', async () => {
  await run({ language: 'uk', intervalMinutes: 1, watches: WATCHES });

  assert.equal(requests.length, 1);
  assert.equal(fake.count(), 3);
  assert.deepEqual(fake.titles(), [
    'Київ — ТРИВОГА',
    'Луцьк — тихо',
    'Львів — тихо',
  ]);
});

test('the request carries no credentials', async () => {
  await run();
  assert.equal(requests[0].options.credentials, 'omit');
});

test('every bookmark opens the same map', async () => {
  await run({ watches: WATCHES.slice(0, 2) });
  assert.deepEqual(fake.urls(), [
    'https://alerts.in.ua/',
    'https://alerts.in.ua/',
  ]);
});

test('a second tick reuses the answer rather than asking again', async () => {
  await run({ watches: WATCHES });
  await fake.tick();
  assert.equal(requests.length, 1);
});

test('a bookmark the user deleted comes back on the next tick', async () => {
  await run({ watches: WATCHES });
  fake.dropBookmark(1);
  assert.equal(fake.count(), 2);

  await fake.tick();
  assert.equal(fake.count(), 3);
  assert.ok(fake.titles().includes('Луцьк — тихо'));
});

test('dropping a region takes its bookmark with it', async () => {
  await run({ watches: WATCHES });
  fake.seed('settings', { watches: [WATCHES[0]] });
  await fake.tick();

  assert.equal(fake.count(), 1);
  assert.deepEqual(fake.titles(), ['Київ — ТРИВОГА']);
});

test('a failed fetch shows no status rather than a stale one', async () => {
  await run({ watches: WATCHES });

  // Age the stored answer past the point where it may still stand in.
  fake.seed('state', { ...fake.storage.state, fetchedAt: 0 });
  respond = () => {
    throw new Error('network down');
  };
  await fake.tick();

  assert.deepEqual(fake.titles(), ['Київ — ?', 'Луцьк — ?', 'Львів — ?']);
  assert.equal(fake.badge.text, '!');
});

test('the badge counts the regions currently under alert', async () => {
  await run({ watches: WATCHES });
  assert.equal(fake.badge.text, '1');
  assert.match(fake.badge.title, /Київ/);
});

test('the badge is empty when nothing watched is alerting', async () => {
  await run({ watches: [WATCHES[1]] });
  assert.equal(fake.badge.text, '');
  assert.equal(fake.badge.title, 'All clear');
});

test('English renders both the name and the wording', async () => {
  await run({
    language: 'en',
    watches: [{ id: 'w1', region: 'kyiv-city', label: '' }],
  });
  assert.deepEqual(fake.titles(), ['Kyiv — ALERT']);
});

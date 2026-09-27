/**
 * Air Alerts in Bookmarks
 *
 * Polls one public alert feed and writes each watched region's status into the
 * title of a bookmark on the bookmarks toolbar, which the extension creates
 * and owns.
 *
 * One request serves every bookmark. The feed answers for the whole country
 * at once, so a tick fetches it once and renders every watched region out of
 * that single answer; adding a second city costs the source nothing.
 *
 * Runs as a Firefox event page loaded as an ES module. Every listener is
 * registered at the top level, which is what lets a page that has been shut
 * down come back on the next alarm.
 */

import { browser } from './lib/browser.js';
import { bookmarksBarId } from './lib/bookmarks-bar.js';
import { fetchSnapshot, isAlert, statusOf, STATUS } from './lib/source.js';
import { DEFAULT_SETTINGS, normalizeSettings } from './lib/settings.js';
import { formatTitle, labelOf } from './lib/title.js';

/** Where a bookmark takes you when clicked: a live map of the whole country. */
const MAP_URL = 'https://alerts.in.ua/';

const ALARM_NAME = 'poll';

/**
 * How long a snapshot may stand in for a failed fetch. Past this the titles
 * turn to the unknown wording, because a stale "clear" is the one answer this
 * extension must never leave on screen.
 */
const STALE_AFTER_MS = 10 * 60000;

/**
 * Two refreshes closer together than this share one answer. The feed caches
 * for about a minute anyway, so a second request would return the same bytes
 * and only spend the source's rate limit.
 */
const MIN_FETCH_GAP_MS = 15000;

const BADGE_ALERT = '#c0392b';
const BADGE_YELLOW = '#d4a017';
const BADGE_CLEAR = '#2d6a4f';
const BADGE_UNKNOWN = '#7f8c8d';

const log = (...args) => console.warn('[air-alerts]', ...args);

// ── Storage ────────────────────────────────────────────────────────────────

// `settings` belongs to the options page, `state` to this script. Keeping them
// apart means neither can overwrite the other's writes.

const readSettings = async () => {
  const { settings } = await browser.storage.local.get('settings');
  return normalizeSettings(settings ?? DEFAULT_SETTINGS);
};

const readState = async () => {
  const { state } = await browser.storage.local.get('state');
  return { bookmarks: {}, alerts: null, fetchedAt: 0, ...state };
};

const writeState = (state) => browser.storage.local.set({ state });

// ── Bookmarks ──────────────────────────────────────────────────────────────

/** The node behind a remembered id, or null once the user has deleted it. */
const getBookmark = async (id) => {
  if (!id) return null;
  try {
    const [node] = await browser.bookmarks.get(id);
    return node ?? null;
  } catch {
    return null;
  }
};

/**
 * Brings the toolbar in line with the watch list: one bookmark per watch,
 * created if the user deleted it, retitled only when the title actually
 * changed, and removed once its watch is gone.
 *
 * New bookmarks land at the end of the toolbar and are never moved again, so
 * dragging them into the order you like is yours to keep.
 */
const syncBookmarks = async (settings, alerts) => {
  const state = await readState();
  const parentId = await bookmarksBarId();
  const bookmarks = {};

  for (const watch of settings.watches) {
    const title = formatTitle(watch, statusOf(alerts, watch.region), settings);
    const node = await getBookmark(state.bookmarks[watch.id]);

    if (node) {
      if (node.title !== title) {
        await browser.bookmarks.update(node.id, { title });
      }
      bookmarks[watch.id] = node.id;
    } else {
      const created = await browser.bookmarks.create({
        parentId,
        title,
        url: MAP_URL,
      });
      bookmarks[watch.id] = created.id;
    }
  }

  for (const [watchId, id] of Object.entries(state.bookmarks)) {
    if (bookmarks[watchId]) continue;
    try {
      await browser.bookmarks.remove(id);
    } catch {
      // Already gone — nothing to clean up.
    }
  }

  await writeState({ ...state, bookmarks });
};

// ── Toolbar icon ───────────────────────────────────────────────────────────

const setBadge = (text, color, title) => {
  browser.action.setBadgeText({ text });
  browser.action.setBadgeBackgroundColor({ color });
  browser.action.setTitle({ title });
};

const paintBadge = (settings, alerts, error) => {
  if (settings.watches.length === 0) {
    setBadge('', BADGE_UNKNOWN, 'Air alerts: no regions chosen yet');
    return;
  }

  const statuses = settings.watches.map((watch) => ({
    label: labelOf(watch, settings.language),
    status: statusOf(alerts, watch.region),
  }));

  const alerting = statuses.filter((entry) => isAlert(entry.status));
  const unknown = statuses.some((entry) => entry.status === STATUS.UNKNOWN);

  if (error && unknown) {
    setBadge('!', BADGE_UNKNOWN, `Air alerts: ${error.message}`);
    return;
  }

  const stale = error ? ' (last known)' : '';
  const namesAt = (status) =>
    alerting
      .filter((entry) => entry.status === status)
      .map((entry) => entry.label)
      .join(', ');

  // Merged, the badge says only "alert", the same as the bookmarks do.
  const summary = settings.mergeLevels
    ? `Alert: ${alerting.map((entry) => entry.label).join(', ')}`
    : [
        ['Red', namesAt(STATUS.RED)],
        ['Yellow', namesAt(STATUS.YELLOW)],
      ]
        .filter(([, names]) => names)
        .map(([level, names]) => `${level}: ${names}`)
        .join('; ');
  const anyRed = alerting.some((entry) => entry.status === STATUS.RED);
  const color = settings.mergeLevels || anyRed ? BADGE_ALERT : BADGE_YELLOW;

  if (alerting.length) {
    setBadge(String(alerting.length), color, summary + stale);
  } else {
    setBadge('', BADGE_CLEAR, `All clear${stale}`);
  }
};

// ── Refresh ────────────────────────────────────────────────────────────────

const currentAlerts = async () => {
  const state = await readState();
  const age = Date.now() - state.fetchedAt;

  if (state.alerts && age < MIN_FETCH_GAP_MS) return { alerts: state.alerts };

  try {
    const alerts = await fetchSnapshot();
    await writeState({ ...state, alerts, fetchedAt: Date.now() });
    return { alerts };
  } catch (error) {
    log(error);
    const fresh = state.alerts && age < STALE_AFTER_MS;
    return { alerts: fresh ? state.alerts : null, error };
  }
};

const runRefresh = async () => {
  try {
    const settings = await readSettings();
    const { alerts, error } = await currentAlerts();
    await syncBookmarks(settings, alerts);
    paintBadge(settings, alerts, error);
  } catch (error) {
    log(error);
    setBadge('!', BADGE_UNKNOWN, `Air alerts: ${error.message}`);
  }
};

/**
 * Refreshes run one at a time. Without this, an alarm landing on top of a
 * click could create a second bookmark for the same watch.
 */
let queue = Promise.resolve();

const refresh = () => {
  queue = queue.then(runRefresh, runRefresh);
  return queue;
};

/** (Re)arms the poll timer. Browsers clamp periods below one minute. */
const scheduleAlarm = async () => {
  const { intervalMinutes } = await readSettings();
  await browser.alarms.clear(ALARM_NAME);
  browser.alarms.create(ALARM_NAME, {
    periodInMinutes: intervalMinutes,
    when: Date.now() + 500,
  });
};

// Changing the interval has to rebuild the alarm. Every other setting only
// changes what the next tick writes, so a refresh is enough — and an immediate
// one, so adding a city shows up on the toolbar at once.
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.settings) return;
  const before = changes.settings.oldValue?.intervalMinutes;
  const after = changes.settings.newValue?.intervalMinutes;
  if (before !== after) scheduleAlarm();
  else refresh();
});

browser.alarms.onAlarm.addListener(refresh);
browser.runtime.onInstalled.addListener(scheduleAlarm);
browser.runtime.onStartup.addListener(scheduleAlarm);
browser.action.onClicked.addListener(refresh);

scheduleAlarm();

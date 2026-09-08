/**
 * The alert source: one request, every region.
 *
 * Whatever number of bookmarks the user keeps, the extension asks the source
 * for the whole country exactly once per tick and reads every bookmark's
 * status out of that one answer. Ten bookmarks cost the source no more than
 * one does — which is the point, because the source is a free service run for
 * everyone.
 *
 * The endpoint is a public JSON feed with no key and no account. It is
 * unofficial: if it changes shape or goes away, `parseSnapshot` throws and the
 * bookmarks fall back to the unknown wording rather than showing a stale
 * "clear" that somebody might trust.
 */

import { REGIONS } from './regions.js';

export const SOURCE_URL = 'https://ubilling.net.ua/aerialalerts/';

export const SOURCE_NAME = 'Ubilling Aerial Alerts';

export const STATUS = {
  ALERT: 'alert',
  CLEAR: 'clear',
  UNKNOWN: 'unknown',
};

/**
 * Turns the source payload into `{ regionId: boolean }`.
 *
 * Regions the table does not know are dropped, and a region whose flag is not
 * a boolean is left out rather than guessed at, so it reads as unknown.
 *
 * The payload also carries a `changed` timestamp per region. It is not used:
 * most regions report the Unix epoch there, so it cannot be shown as "how
 * long the alert has lasted" without being wrong most of the time.
 */
export const parseSnapshot = (payload) => {
  const states = payload?.states;
  if (!states || typeof states !== 'object') {
    throw new Error('Alert source returned no regions');
  }

  const alerts = {};
  for (const region of REGIONS) {
    const state = states[region.key];
    if (typeof state?.alertnow === 'boolean') {
      alerts[region.id] = state.alertnow;
    }
  }

  if (Object.keys(alerts).length === 0) {
    throw new Error('Alert source returned no region this build knows');
  }
  return alerts;
};

/**
 * `credentials: 'omit'` is deliberate: the source never needs to know who is
 * asking, so no cookie is attached even if the user happens to have one.
 */
export const fetchSnapshot = async (request = fetch) => {
  const response = await request(SOURCE_URL, {
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`alerts → HTTP ${response.status}`);
  return parseSnapshot(await response.json());
};

export const statusOf = (alerts, regionId) => {
  const value = alerts?.[regionId];
  if (typeof value !== 'boolean') return STATUS.UNKNOWN;
  return value ? STATUS.ALERT : STATUS.CLEAR;
};

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
import { SUBREGIONS } from './subregions.js';

export const SOURCE_URL = 'https://siren.pp.ua/api/v3/alerts';

export const SOURCE_NAME = 'UA Siren';

export const STATUS = {
  RED: 'red',
  YELLOW: 'yellow',
  CLEAR: 'clear',
  UNKNOWN: 'unknown',
};

/** The source's own names for the two alert levels, weakest first. */
const LEVELS = { Yellow: STATUS.YELLOW, Red: STATUS.RED };

const RANK = [STATUS.CLEAR, STATUS.YELLOW, STATUS.RED];

const stronger = (a, b) => (RANK.indexOf(a) >= RANK.indexOf(b) ? a : b);

/** The region each source id — oblast, district or community — lies in. */
const OWNER = new Map(
  REGIONS.flatMap((region) => {
    const ids = [Number(region.sourceId), ...SUBREGIONS[region.id]];
    return ids.map((id) => [id, region.id]);
  }),
);

/**
 * Turns the source payload into `{ regionId: 'red' | 'yellow' | 'clear' }`.
 *
 * The feed lists only the places under alert, each as its own entry: an
 * oblast as a whole, or just a district or a community inside it. A region
 * takes the strongest air-raid level found anywhere inside it, and a region
 * that nothing mentions is clear. Artillery and street-fighting warnings are
 * not air raids and are left out.
 */
export const parseSnapshot = (payload) => {
  if (!Array.isArray(payload)) {
    throw new Error('Alert source returned no regions');
  }

  const alerts = Object.fromEntries(
    REGIONS.map((region) => [region.id, STATUS.CLEAR]),
  );
  for (const entry of payload) {
    if (!Array.isArray(entry?.activeAlerts)) {
      throw new Error('Alert source returned an entry it cannot read');
    }
    const owner = OWNER.get(Number(entry.regionId));
    if (!owner) continue;
    for (const alert of entry.activeAlerts) {
      if (alert?.type !== 'AIR') continue;
      // An air raid with no level, or one this build does not know, is still
      // an air raid, and red is the reading that errs on the safe side.
      const levels = (alert.activeAlertLevels ?? []).map(
        (entry) => LEVELS[entry?.alertLevel] ?? STATUS.RED,
      );
      for (const level of levels.length ? levels : [STATUS.RED]) {
        alerts[owner] = stronger(alerts[owner], level);
      }
    }
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
  return RANK.includes(value) ? value : STATUS.UNKNOWN;
};

export const isAlert = (status) =>
  status === STATUS.RED || status === STATUS.YELLOW;

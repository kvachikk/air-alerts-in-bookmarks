<img width="912" height="402" alt="202" src="https://github.com/user-attachments/assets/ab7e7274-90ca-4206-9003-8c829c1bd9b6" />

## Install

https://addons.mozilla.org/en-US/firefox/addon/air-alerts-in-bookmarks/

# Air Alerts in Bookmarks

Ukrainian air raid alerts, on your bookmarks toolbar.

```
Київ — ТРИВОГА
```

One bookmark per region, renamed in the background. No tab to keep open, no
map to check — the answer is already on screen.

Firefox, desktop only.

## Using it

On first run it adds one bookmark for Kyiv.

If you cannot see it, the bookmarks toolbar is probably hidden — Firefox shows
it only on new tabs by default. Right-click the toolbar area → _Bookmarks
Toolbar_ → _Always Show_.

Open the options page — `about:addons` → this extension → _Preferences_ — to
change what it watches:

- **Regions.** Up to ten, each its own bookmark. Alerts are announced by
  region, so pick the region your city is in.
- **The name on each bookmark.** Empty means the region's own name; type
  anything you like instead — `Луцьк` rather than `Волинська область`.
- **Yellow and red, merged or apart.** Merged by default: either level reads
  `ТРИВОГА`. Switch it off and the bookmark says `ЖОВТА` for a yellow alert —
  a threat, such as drones heading that way — and `ЧЕРВОНА` for a red one.
- **The wording.** `{name} — ТРИВОГА`, `{name} — тихо`, `{name} — ?` by
  default, plus `{name} — ЖОВТА` and `{name} — ЧЕРВОНА` when the levels are
  apart. Write your own: `{name} — тривожно`, `{name}: 🔴`, whatever reads
  fastest to you.
- **Language**, Ukrainian or English. It switches the options page, the
  default region names, and the default wording. Wording you edited yourself
  is kept per language, so switching back and forth loses nothing.
- **How often it refreshes**, one to sixty minutes.

Clicking a bookmark opens [alerts.in.ua](https://alerts.in.ua/), the full map.
Clicking the toolbar icon refreshes immediately; its badge counts how many of
your regions are under alert.

Bookmarks are created at the end of the toolbar and never moved again, so drag
them wherever you like. Delete one and it comes back on the next tick — to be
rid of it, remove the region in the options page.

## One request, however many bookmarks

The feed answers for the whole country in a single response, so a tick fetches
it once and renders every bookmark from that one answer. Ten regions cost the
source exactly what one does. Two refreshes closer together than fifteen
seconds share an answer as well, which is what keeps a burst of icon clicks
from spending the source's rate limit.

## Where the data comes from

`GET https://siren.pp.ua/api/v3/alerts` — a free public JSON feed with no key
and no account, run by [UA Siren](https://siren.pp.ua/) on top of the official
ukrainealarm data. It lists every oblast, district and community currently
under alert, with the alert's level: yellow or red.

A bookmark takes the strongest air-raid level anywhere in its region, so one
district on red makes its whole oblast read red. Which oblast each district
and community lies in ships with the extension in `src/lib/subregions.js`,
generated from the source's region tree by `node tools/subregions.mjs`, so a
tick still costs the source one request. Sevastopol follows Crimea, which is
how the source reports it.

The request is sent with `credentials: 'omit'`, so no cookie goes with it and
the source cannot tell one user from another.

The feed is **unofficial**. If it changes shape or goes away, bookmarks fall
back to the unknown wording — `Київ — ?` — rather than showing a stale
"no alert" that somebody might act on. The same applies if a fetch simply
fails: the last answer stands in for up to ten minutes, and after that the
bookmarks say they do not know.

Bookmarks are per region, not per city, even though the feed itself is finer.

**This is not a warning system.** It is a convenience. Use the official
channels — sirens, the Air Alert app, your local administration — to decide
whether to take cover.

## How it works

An `alarms` timer drives the refresh. The background script is a Firefox event
page loaded as an ES module, with every listener registered at the top level,
which is what lets a page that has been shut down come back on the next alarm.

Bookmark ids live in `storage.local`, keyed by region, so the extension renames
only the bookmarks it created and never touches one of yours.

### Why there is a build step

`src/` holds plain ES modules that the browser loads as they are — nothing is
bundled, transpiled or minified. The build copies the sources verbatim and
drops the manifest in beside them, so the code you read here is the code that
ships.

## Privacy

Nothing is collected and nothing is transmitted anywhere except the alert feed
itself, without credentials. See [PRIVACY.md](PRIVACY.md), which CI enforces on
every commit through `npm run lint:privacy`.

## Development

```bash
npm ci
npm run lint && npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

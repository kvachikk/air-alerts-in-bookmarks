# Privacy Policy

**Air Alerts in Bookmarks collects nothing and transmits nothing.**

That is the entire policy. The rest of this document explains how you can check
that claim yourself rather than taking it on trust.

## What is collected

Nothing. No personal data, no usage data, no crash reports, no identifiers, no
analytics, no advertising, no "anonymous statistics". The extension has no
server, no account, and no operator to send anything to.

## What leaves your device

One request, on the interval you chose, whatever number of bookmarks you keep:

| Request                                 | Why                                              |
| --------------------------------------- | ------------------------------------------------ |
| `GET https://siren.pp.ua/api/v3/alerts` | Read the alert status of every Ukrainian region. |

It is sent with `credentials: 'omit'`, so no cookie, token or header
identifying you goes with it. The request body is empty; nothing about you,
your bookmarks or your settings is sent. Which regions you watch never leaves
the device, because the feed is asked for all of them at once regardless.

No other host is ever contacted — the extension holds a host permission for
`https://siren.pp.ua/*` and nothing else, so it is not technically able to
reach one.

## What is stored

On your device, through the WebExtension `storage.local` API:

- Your settings — regions, names, wording, whether yellow and red alerts are
  merged, language and refresh interval.
- The id of each bookmark the extension created, so it renames those and never
  touches another.
- The last answer from the feed, so a failed refresh does not immediately blank
  every bookmark.

The extension deliberately does **not** use `storage.sync`, because that would
copy the above through a Mozilla account. Uninstalling removes everything it
stored.

## Permissions

| Permission              | Why                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `bookmarks`             | Create and rename its own bookmarks. No bookmark it did not create is read or changed.    |
| `alarms`                | Wake up on the interval you chose. Firefox event pages cannot hold a timer any other way. |
| `storage`               | Remember the settings and ids above, on your device.                                      |
| `https://siren.pp.ua/*` | Read the alert feed. This is the only host the extension may contact.                     |

There is no content script, so the extension runs on no web page at all.

The bookmarks it creates point at `https://alerts.in.ua/`, which is opened only
when you click one — the same as any other bookmark. That host is deliberately
absent from the permissions above, so the extension itself cannot contact it.

## How to verify this

1. **Read the manifest.** `src/manifest.firefox.json` is under fifty lines and
   lists every permission the extension can ever have.
2. **Run the privacy check.** `npm run lint:privacy` scans the source for
   `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `eval`,
   `storage.sync`, device-sensor APIs, analytics SDK names, and any URL
   pointing anywhere other than the feed. It fails if the manifest grows a
   permission, a content script, or a data-collection declaration — and it
   fails if the one request stops omitting credentials. It runs in CI on every
   commit.
3. **Read the shipped code.** There is no bundler and no minifier. The
   JavaScript inside the add-on is byte for byte the JavaScript in `src/`.
4. **Watch the network.** Open `about:debugging`, inspect the extension, and
   look at the Network tab. One request per tick, to one host.

## Third parties

The alert feed is operated by [UA Siren](https://siren.pp.ua/), who see
what any web server sees of an anonymous request: an IP address and the time.
Nothing is sent that identifies you or says which regions you watch.

There are no SDKs, no CDNs, no fonts and no remote resources of any kind. All
dependencies are development-time only and never reach your browser.

## Changes

Any change to this policy will appear in [CHANGELOG.md](CHANGELOG.md) and in
the Git history of this file.

## Contact

Open an issue at
<https://github.com/kvachikk/air-alerts-in-bookmarks/issues>.

# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased][unreleased]

### Added

- Yellow and red alerts. A switch on the options page, on by default, merges
  them into one `ТРИВОГА`; switched off, a bookmark reads `ЖОВТА` or
  `ЧЕРВОНА`, each with wording of its own, and a toolbar badge covering only
  yellow alerts turns yellow.

### Changed

- The alert feed is now [UA Siren](https://siren.pp.ua/) (`siren.pp.ua`)
  rather than Ubilling, whose feed has no alert levels and read a yellow alert
  as no alert at all. It is still one keyless request per tick, and still the
  only host the extension may contact.
- A district or community under alert now counts towards its oblast, which
  takes the strongest level found anywhere inside it.

## [1.0.0][] - 2026-09-08

First release. Firefox only.

### Added

- A bookmark per watched region on the bookmarks toolbar, renamed on a timer
  with that region's air raid alert status.
- Up to ten regions at once, chosen on the options page, each with a name of
  the user's own — `Луцьк` rather than `Волинська область`.
- Editable wording for all three states, with `{name}` standing in for the
  bookmark's name, so `Київ — ТРИВОГА` can just as well read `Київ — 🔴`.
- Ukrainian and English, switchable in the extension rather than taken from the
  browser. Wording edited by hand is kept per language.
- A refresh interval from one to sixty minutes.
- Toolbar badge counting the watched regions currently under alert, and a
  click on the icon to refresh at once.
- Privacy check that fails the build on any network API, dynamic-code API,
  synced storage, sensor API, analytics name, or URL outside the feed, on any
  manifest permission beyond the four the extension declares, and on a feed
  request that stops omitting credentials. It runs in CI on every commit.
- Unit tests for the region table, settings normalization, feed parsing and
  title formatting, plus integration tests that run the real background script
  against a fake WebExtension API.
- Linting with `eslint-config-metarhia` and Prettier, commit-message linting,
  Git hooks, Dependabot, and CI running all of it plus `web-ext lint`.

### Notes

- One tick makes one request no matter how many bookmarks there are: the feed
  answers for the whole country at once, and every bookmark is rendered from
  that single answer. Refreshes closer together than fifteen seconds share one.
- The feed is unofficial and undocumented. If it changes or fails, bookmarks
  fall back to `?` rather than showing a stale "no alert" — the last answer
  stands in for ten minutes first.
- Alerts are per region, not per city. A finer breakdown needs an API key from
  an official provider.
- This is a convenience, not a warning system.

[unreleased]:
  https://github.com/kvachikk/air-alerts-in-bookmarks/compare/v1.0.0...HEAD
[1.0.0]:
  https://github.com/kvachikk/air-alerts-in-bookmarks/releases/tag/v1.0.0

# Contributing

Thanks for taking a look.

## Setup

```bash
npm ci
npm run lint && npm test
```

Git hooks are installed automatically: staged files are linted and formatted,
commit messages are checked, and tests run before a push.

## Rules that are not negotiable

This extension makes one promise — it collects nothing, and it talks to the
alert feed and to nowhere else, without credentials. Any change that adds a
host, a network API, `eval`, `storage.sync`, a content script, or a manifest
permission will fail `npm run lint:privacy` in CI. If you believe a change
genuinely needs one, open an issue first.

One tick makes one request, however many bookmarks the user keeps. The feed is
a free service; a change that asks it once per bookmark is a change that gets
everybody rate-limited.

A failed or stale fetch must never leave "no alert" on screen. Bookmarks fall
back to the unknown wording instead, and `STALE_AFTER_MS` in `background.js` is
how long the last answer may stand in.

There is no build step beyond copying files, and there should not be one: the
JavaScript in the signed add-on is the JavaScript in `src/`, which is what
makes the add-on reviewable by anyone who cares to look. Keep runtime
dependencies out entirely.

## Style

`eslint-config-metarhia` plus Prettier, 80 columns. Prefer code that reads
without comments; comment only what the code cannot say.

Everything in the repository is in English — code, comments, commits, issues.
The two languages the extension itself speaks live in `src/lib/i18n.js` and
`src/lib/regions.js`, and nowhere else.

## Commits

[Conventional Commits](https://www.conventionalcommits.org), lower case, 72
characters max:

```
feat(options): let the bookmark wording be edited
fix(source): fall back to unknown when the feed goes quiet
```

Allowed scopes are listed in `commitlint.config.js`.

## Testing a change

Pure helpers in `src/lib/` get a unit test in `test/unit/`. Anything that
touches bookmarks, alarms or the badge belongs in `test/integration/`, which
runs the real background script against a fake WebExtension API — no browser
and no network.

Tests never touch the live feed. To check it by hand:

```bash
npm start
```

That opens a scratch Firefox with the extension loaded and the bookmarks
toolbar shown.

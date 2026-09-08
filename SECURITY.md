# Security Policy

## Supported versions

The latest release.

## Reporting a vulnerability

Use [GitHub private vulnerability
reporting](https://github.com/kvachikk/air-alerts-in-bookmarks/security/advisories/new).
Please do not open a public issue for a security problem.

Expect a first reply within a week.

## Scope

The extension has no content script and runs on no page, which removes most of
the usual surface. Reports of most interest:

- Anything that lets the extension contact a host other than the alert feed.
- Anything that attaches credentials to the feed request, or leaks anything
  about the user off the device.
- Anything that reads or modifies a bookmark the extension did not create.
- Anything that turns a value in settings, or a value in the feed's response,
  into executed code.

A wrong or missing alert status is a bug, not a vulnerability — the feed is
unofficial and the README says so. Report it as an issue.

`npm audit` findings in development-only dependencies (`web-ext` and its tree)
are out of scope: they never ship to users.

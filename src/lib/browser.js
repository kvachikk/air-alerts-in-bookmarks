/**
 * Firefox exposes the extension APIs as `browser`, Chromium as `chrome`.
 *
 * This release targets Firefox only, but every API the extension touches —
 * storage, bookmarks, alarms, action, runtime — is promise-based under MV3 in
 * both, so aliasing the namespace is all a Chromium build would need. No
 * polyfill is bundled: what you read here is what runs.
 */

export const browser = globalThis.browser ?? globalThis.chrome;

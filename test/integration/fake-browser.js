/**
 * Just enough of the WebExtension API to run `src/background.js` under
 * `node --test`: local storage, the bookmark tree, alarms and the toolbar
 * icon, each backed by a plain object the test can read afterwards.
 */

export const createFakeBrowser = () => {
  const storage = {};
  const bookmarks = new Map();
  const listeners = { storage: [], alarm: [], installed: [], clicked: [] };
  const alarms = new Map();
  const badge = { text: null, color: null, title: null };

  let nextId = 1;

  const toolbar = { id: 'toolbar_____', title: 'Toolbar' };

  const api = {
    storage: {
      local: {
        get: async (key) =>
          key in storage ? { [key]: structuredClone(storage[key]) } : {},
        set: async (values) => {
          const changes = {};
          for (const [key, value] of Object.entries(values)) {
            changes[key] = { oldValue: storage[key], newValue: value };
            storage[key] = structuredClone(value);
          }
          for (const listener of listeners.storage) listener(changes, 'local');
        },
        remove: async (key) => {
          delete storage[key];
        },
      },
      onChanged: { addListener: (fn) => listeners.storage.push(fn) },
    },

    bookmarks: {
      getTree: async () => [{ id: 'root', children: [toolbar] }],
      get: async (id) => {
        if (!bookmarks.has(id)) throw new Error(`No bookmark with id ${id}`);
        return [{ ...bookmarks.get(id) }];
      },
      create: async ({ parentId, title, url }) => {
        const node = { id: `bm-${nextId++}`, parentId, title, url };
        bookmarks.set(node.id, node);
        return { ...node };
      },
      update: async (id, { title }) => {
        const node = bookmarks.get(id);
        if (!node) throw new Error(`No bookmark with id ${id}`);
        node.title = title;
        return { ...node };
      },
      remove: async (id) => {
        if (!bookmarks.delete(id)) throw new Error(`No bookmark with id ${id}`);
      },
    },

    alarms: {
      clear: async (name) => alarms.delete(name),
      create: (name, options) => alarms.set(name, options),
      onAlarm: { addListener: (fn) => listeners.alarm.push(fn) },
    },

    action: {
      setBadgeText: ({ text }) => {
        badge.text = text;
      },
      setBadgeBackgroundColor: ({ color }) => {
        badge.color = color;
      },
      setTitle: ({ title }) => {
        badge.title = title;
      },
      onClicked: { addListener: (fn) => listeners.clicked.push(fn) },
    },

    runtime: {
      onInstalled: { addListener: (fn) => listeners.installed.push(fn) },
      onStartup: { addListener: () => {} },
    },
  };

  return {
    api,
    badge,
    storage,
    alarms,
    /**
     * Back to a fresh profile. Writes here raise no change events, because
     * `background.js` refreshes on one and a test would then be racing a
     * refresh it never asked for.
     */
    reset: () => {
      for (const key of Object.keys(storage)) delete storage[key];
      bookmarks.clear();
      badge.text = null;
      badge.color = null;
      badge.title = null;
    },
    seed: (key, value) => {
      storage[key] = structuredClone(value);
    },
    /** Every bookmark on the toolbar, in creation order. */
    titles: () => [...bookmarks.values()].map((node) => node.title),
    urls: () => [...bookmarks.values()].map((node) => node.url),
    count: () => bookmarks.size,
    /** Stands in for the user deleting a bookmark by hand. */
    dropBookmark: (index) => {
      const [node] = [...bookmarks.values()].slice(index, index + 1);
      bookmarks.delete(node.id);
    },
    /** One tick of the poll alarm, awaited to completion. */
    tick: () => Promise.all(listeners.alarm.map((fn) => fn())),
  };
};

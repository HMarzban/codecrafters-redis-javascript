export default function IPC(cluster) {
  const dataStore = new Map();
  function get(key) {
    const entry = dataStore.get(key);
    if (entry?.expiresAt !== null && entry?.expiresAt <= Date.now()) {
      dataStore.delete(key);
      return undefined;
    }
    return entry;
  }
  // Each operation is synchronous in the primary, including conditional SET.
  const handlers = {
    get: ({ key }) => get(key)?.value ?? null,
    set: ({ key, value, options }) => {
      const previous = get(key);
      if ((options.condition === "nx" && previous) || (options.condition === "xx" && !previous)) {
        return { applied: false, previous: previous?.value ?? null };
      }
      const expiresAt = options.keepTTL ? previous?.expiresAt ?? null : options.expiresAt;
      dataStore.set(key, { value, expiresAt });
      return { applied: true, previous: previous?.value ?? null };
    },
    delete: ({ keys }) => keys.reduce((count, key) => {
      return get(key) && dataStore.delete(key) ? count + 1 : count;
    }, 0),
    ttl: ({ key }) => {
      const entry = get(key);
      if (!entry) return -2;
      if (entry.expiresAt === null) return -1;
      return Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000));
    },
  };
  cluster.on("message", (worker, message) => {
    const handler = handlers[message.command];
    if (!handler) return;
    const result = handler(message);
    if (worker.isConnected()) worker.send({ id: message.id, result }, () => {});
  });
}

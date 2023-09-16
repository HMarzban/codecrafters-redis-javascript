const IPC = (cluster) => {
  const dataStore = new Map();

  const commandHandlers = {
    set: (message, worker) => {
      dataStore.set(message.key, message.value);
      worker.send({ status: "ok" });
    },

    has: (message, worker) => {
      const hasKey = dataStore.has(message.key);
      worker.send({ exists: hasKey });
    },

    get: (message, worker) => {
      const value = dataStore.get(message.key);
      worker.send({ value: value });
    },

    delete: (message, worker) => {
      if (dataStore.has(message.key)) {
        dataStore.delete(message.key);
        worker.send({ status: "ok" });
      } else {
        worker.send({ status: "not_found" });
      }
    },
  };

  cluster.on("message", (worker, message) => {
    const handler = commandHandlers[message.command];
    if (handler) {
      handler(message, worker);
    }
  });
};

export default IPC;

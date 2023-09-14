const IPC = (cluster) => {
  // The shared data store
  const dataStore = new Map();

  // Handle messages from worker
  cluster.on("message", (worker, message) => {
    if (message.command === "set") {
      dataStore.set(message.key, message.value);
      worker.send({ status: "ok" });
    } else if (message.command === "has") {
      const hasKey = dataStore.has(message.key);
      worker.send({ exists: hasKey });
    } else if (message.command === "get") {
      const value = dataStore.get(message.key);
      worker.send({ value: value });
    } else if (message.command === "delete") {
      if (dataStore.has(message.key)) {
        dataStore.delete(message.key);
        worker.send({ status: "ok" });
      } else {
        worker.send({ status: "not_found" });
      }
    }
  });
};
module.exports = IPC;

// Correlation IDs keep concurrent clients from consuming each other's IPC replies.
let sequence = 0;
const pending = new Map();
process.on("message", (message) => {
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  if (message.error) waiter.reject(new Error(message.error));
  else waiter.resolve(message.result);
});

function request(command, data) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    process.send({ id, command, ...data }, (error) => {
      if (!error) return;
      pending.delete(id);
      reject(error);
    });
  });
}
const keyId = (key) => key.toString("base64");
export default {
  get: (key) => request("get", { key: keyId(key) }),
  set: (key, value, options) => request("set", { key: keyId(key), value, options }),
  delete: (keys) => request("delete", { keys: keys.map(keyId) }),
  ttl: (key) => request("ttl", { key: keyId(key) }),
};

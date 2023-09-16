/**
 * Sends an IPC command and waits for a message in response.
 *
 * @param {object} payload - The data to send to the master process.
 * @returns {Promise} - A promise that resolves with the message from the master process.
 */
function sendCommand(payload) {
  return new Promise((resolve, reject) => {
    process.send(payload, (error) => {
      if (error) {
        reject(error);
      } else {
        process.once("message", resolve);
      }
    });
  });
}

async function set(key, value) {
  const response = await sendCommand({ command: "set", key, value });
  if (response.status !== "ok") {
    throw new Error("Failed to set value in master.");
  }
}

async function get(key) {
  const response = await sendCommand({ command: "get", key });
  return response.value || null;
}

async function deletekey(key) {
  const response = await sendCommand({ command: "delete", key });
  switch (response.status) {
    case "ok":
      break;
    case "not_found":
      throw new Error("Key not found in master.");
    default:
      throw new Error("Failed to delete key from master.");
  }
}

async function has(key) {
  const response = await sendCommand({ command: "has", key });
  return response.exists || false;
}

export default {
  set,
  get,
  delete: deletekey,
  has,
};

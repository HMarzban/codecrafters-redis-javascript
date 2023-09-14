function set(key, value) {
  return new Promise((resolve, reject) => {
    process.send({ command: "set", key, value }, (error) => {
      if (error) {
        reject(error);
      } else {
        process.once("message", (message) => {
          if (message.status === "ok") {
            resolve();
          } else {
            reject(new Error("Failed to set value in master."));
          }
        });
      }
    });
  });
}

function get(key) {
  return new Promise((resolve, reject) => {
    process.send({ command: "get", key }, (error) => {
      if (error) {
        reject(error);
      } else {
        process.once("message", (message) => {
          if (message.hasOwnProperty("value")) {
            resolve(message.value);
          } else {
            resolve(null);
          }
        });
      }
    });
  });
}

function deletekey(key) {
  return new Promise((resolve, reject) => {
    process.send({ command: "delete", key }, (error) => {
      if (error) {
        reject(error);
      } else {
        process.once("message", (message) => {
          if (message.status === "ok") {
            resolve();
          } else if (message.status === "not_found") {
            reject(new Error("Key not found in master."));
          } else {
            reject(new Error("Failed to delete key from master."));
          }
        });
      }
    });
  });
}

function has(key) {
  return new Promise((resolve, reject) => {
    process.send({ command: "has", key }, (error) => {
      if (error) {
        reject(error);
      } else {
        process.once("message", (message) => {
          if (message.hasOwnProperty("exists")) {
            resolve(message.exists);
          } else {
            resolve(false);
          }
        });
      }
    });
  });
}

module.exports = {
  set,
  get,
  delete: deletekey,
  has,
};

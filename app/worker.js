const net = require("net");

const isCommand = (message) => {
  const normalized = message.at(0).toLowerCase();

  if (normalized === "echo") {
    return true;
  }
  if (normalized === "ping") {
    return true;
  }
  if (normalized === "set") {
    return true;
  }
  if (normalized === "get") {
    return true;
  }
  return false;
};

const getCommand = (req) => {
  const [length, ...data] = req;
  const dataNoLengths = data.filter((x) => x.charAt(0) !== "$");

  console.log(dataNoLengths, isCommand(dataNoLengths));
  if (isCommand(dataNoLengths)) {
    return {
      command: dataNoLengths[0],
      data: dataNoLengths.slice(1),
    };
  }
  return {
    command: "error",
    data: "error",
  };
};

const server = net.createServer({ keepAlive: true }, (connection) => {
  // Handle connection
  console.log("client connected, PID:", process.pid);

  const dataStore = new Map();

  connection.on("data", (req) => {
    const requestCleansed = req
      .toString()
      .trim()
      .toLocaleLowerCase()
      .split("\r\n");

    const { command, data } = getCommand(requestCleansed);

    if (command === "ping") {
      connection.write("+PONG\r\n");
    } else if (command === "echo") {
      connection.write(`+${data.join(" ")}\r\n`);
    } else if (command === "set") {
      const key = data.at(0);
      // value must be select from index 1 to the second last index
      const value = data.slice(1, -2).join(" ");
      const expiryType = data.at(-2);
      const time = data.at(-1);

      if (expiryType && time) setTimeout(() => dataStore.delete(key), time);

      dataStore.set(key, {
        value,
        expiryType,
        time,
      });

      connection.write("+OK\r\n");
    } else if (command === "get") {
      const key = data.at(0);
      const result = dataStore.get(key);
      if (result) onnection.write(`+${result}\r\n`);
      else connection.write("-1\r\n");
    }

    if (req.toString().includes("exit")) {
      connection.write(`You will be disconnected, PID: ${process.pid}\r\n`);
      connection.end();
    }
  });

  connection.on("end", () => {
    console.log("client disconnected, PID:", process.pid);
  });
});

module.exports = server;

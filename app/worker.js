const net = require("net");

const isCommand = (message) => {
  const normalized = message.at(0).toLowerCase();
  console.log(normalized, "normalized");

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

const normalizedReq = (req) => req.toLowerCase().split("\r\n");

const getCommand = (req) => {
  const dataNoLengths = req.filter((x) => x.charAt(0) !== "$");
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
      .replace("\r\n", "")
      .replace("\\r\\n", "")
      .split(/(\s+)/)
      .filter((e) => e.trim().length > 0);

    const { command, data } = getCommand(requestCleansed);

    if (command === "ping") {
      connection.write("+PONG\r\n");
    } else if (command === "echo") {
      connection.write(`+${data.join(" ")}\r\n`);
    } else if (command === "set") {
      dataStore.set(data.ata(0), data.at(1));
      connection.write("+OK\r\n");
    } else if (command === "get") {
      connection.write(`+${dataStore.get(data.at(0))}\r\n`);
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

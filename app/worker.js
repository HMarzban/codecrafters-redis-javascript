const net = require("net");

// *2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n

const isCommand = (message) => {
  const normalized = message.trim().toLowerCase();
  if (normalized === "echo") {
    return true;
  }
  if (normalized === "ping") {
    return true;
  }
  return false;
};

const getCommand = (req) => {
  const [length, ...data] = req;
  const dataNoLengths = data.filter((x) => x.charAt(0) !== "$");
  return dataNoLengths.reduce(
    (acc, curr) => {
      if (isCommand(curr)) {
        acc.command = curr; // Fixed assignment
        return acc;
      }
      acc.data.push(curr);
      return acc;
    },
    {
      command: "",
      data: [],
    }
  );
};

const server = net.createServer({ keepAlive: true }, (connection) => {
  // Handle connection
  console.log("client connected, PID:", process.pid);

  connection.on("data", (req) => {
    const requestCleansed = req
      .toString()
      .trim()
      .toLocaleLowerCase()
      .split("\\r\\n");
    const { command, data } = getCommand(requestCleansed);
    console.log({
      command,
      data,
    });

    if (command === "ping") {
      connection.write("+PONG\r\n");
    } else if (command === "echo") {
      connection.write(`+${data.join(" ")}\r\n`);
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

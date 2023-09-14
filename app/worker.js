const net = require("net");
const commands = require("./commands/index.js");
const { getCommand } = require("./helper.js");

const server = () => {
  const server = net.createServer({ keepAlive: true }, (connection) => {
    console.info("client connected, PID:", process.pid);

    connection.on("data", (req) => {
      const requestCleansed = req.toString().trim().split("\r\n");

      const { command, data } = getCommand(requestCleansed);

      try {
        commands(command, data, connection);
      } catch (error) {
        console.error("commands:", error);
      }
    });

    connection.on("end", () => {
      console.info("client disconnected, PID:", process.pid);
    });
  });

  return server;
};

module.exports = server;

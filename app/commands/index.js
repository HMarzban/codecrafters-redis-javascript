const SET = require("./set.js");
const GET = require("./get.js");
const ECHO = require("./echo.js");

const commands = async (command, data, connection) => {
  if (command === "ping") {
    connection.write("+PONG\r\n");
  } else if (command === "echo") {
    return ECHO(data, connection);
  } else if (command === "set") {
    return SET(data, connection);
  } else if (command === "get") {
    return GET(data, connection);
  }

  if (command === "exit") {
    connection.write(`You will be disconnected, PID: ${process.pid}\r\n`);
    connection.end();
  }
};

module.exports = commands;

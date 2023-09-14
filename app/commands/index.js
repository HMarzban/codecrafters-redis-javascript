const SET = require("./set.js");
const GET = require("./get.js");
const ECHO = require("./echo.js");
const DEL = require("./del.js");
const TTL = require("./ttl.js");

const commands = (command, data, connection) => {
  if (command === "ping") {
    connection.write("+PONG\r\n");
  } else if (command === "echo") {
    return ECHO(connection, data);
  } else if (command === "set") {
    return SET(connection, data);
  } else if (command === "get") {
    return GET(connection, data);
  } else if (command === "del") {
    return DEL(connection, data);
  } else if (command === "ttl") {
    return TTL(connection, data);
  }

  if (command === "exit") {
    connection.write(`You will be disconnected, PID: ${process.pid}\r\n`);
    connection.end();
  }
};

module.exports = commands;

import SET from "./set.js";
import GET from "./get.js";
import ECHO from "./echo.js";
import DEL from "./del.js";
import TTL from "./ttl.js";

// Mapping commands to their corresponding action functions
const commandMap = {
  ping: (connection) => connection.write("+PONG\r\n"),
  echo: (connection, data) => ECHO(connection, data),
  set: (connection, data) => SET(connection, data),
  get: (connection, data) => GET(connection, data),
  del: (connection, data) => DEL(connection, data),
  ttl: (connection, data) => TTL(connection, data),
  exit: (connection) => {
    connection.write(`You will be disconnected, PID: ${process.pid}\r\n`);
    connection.end();
  },
};

/**
 * Executes the given command with the provided data.
 *
 * @param {string} command - The command to be executed.
 * @param {array} data - The data associated with the command.
 * @param {object} connection - The connection object.
 */
const commands = (command, data, connection) => {
  const action = commandMap[command];
  if (action) {
    return action(connection, data);
  } else {
    connection.write("-Error: Unknown command\r\n");
  }
};

export default commands;

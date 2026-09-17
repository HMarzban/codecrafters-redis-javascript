import SET from "./set.js";
import GET from "./get.js";
import ECHO from "./echo.js";
import DEL from "./del.js";
import TTL from "./ttl.js";
import { bulk } from "../resp.js";
const commandMap = {
  ping: [0, 1, (connection, args) => connection.write(args.length ? bulk(args[0]) : "+PONG\r\n")],
  echo: [1, 1, ECHO], set: [2, Infinity, SET], get: [1, 1, GET],
  del: [1, Infinity, DEL], ttl: [1, 1, TTL],
  exit: [0, 0, (connection) => connection.end("+OK\r\n")],
};
export default function commands(command, args, connection) {
  const action = commandMap[command];
  if (!Object.hasOwn(commandMap, command)) return connection.write("-ERR unknown command\r\n");
  const [minimum, maximum, execute] = action;
  if (args.length < minimum || args.length > maximum) {
    return connection.write("-ERR wrong number of arguments\r\n");
  }
  return execute(connection, args);
}

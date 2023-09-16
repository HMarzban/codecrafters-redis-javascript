import net from "node:net";
import { getCommand } from "./helper.js";
import commands from "./commands/index.js";

const handleData = (connection) => (req) => {
  const requestCleansed = req.toString().trim().split("\r\n");
  const { command, data } = getCommand(requestCleansed);
  try {
    commands(command, data, connection);
  } catch (error) {
    console.error("commands:", error);
  }
};

const handleEnd = () => {
  console.info("client disconnected, PID:", process.pid);
};

const createServer = () => {
  const server = net.createServer({ keepAlive: true }, (connection) => {
    console.info("client connected, PID:", process.pid);

    connection.on("data", handleData(connection));
    connection.on("end", handleEnd);
  });

  server.listen(6379, () => {
    console.info(`server is listening, PID: ${process.pid}`);
  });
};

export default createServer;

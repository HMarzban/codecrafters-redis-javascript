import net from "node:net";
import { MAX_REQUEST_BYTES, parseRequest } from "./resp.js";
import commands from "./commands/index.js";

export default function createServer() {
  const server = net.createServer({ keepAlive: true }, (connection) => {
    let buffer = Buffer.alloc(0);
    let processing = false;
    let failed = false;

    async function drain() {
      if (processing || failed) return;
      processing = true;
      try {
        while (buffer.length && !connection.destroyed) {
          const request = parseRequest(buffer);
          if (!request) break;
          buffer = buffer.subarray(request.bytes);
          const [command, ...args] = request.args;
          await commands(command.toString("utf8").toLowerCase(), args, connection);
          if (connection.writableEnded) break;
        }
      } catch (error) {
        failed = true;
        connection.end("-ERR protocol or command processing error\r\n");
      } finally {
        processing = false;
      }
    }

    connection.on("data", (chunk) => {
      if (failed) return;
      if (buffer.length + chunk.length > MAX_REQUEST_BYTES) {
        failed = true;
        connection.end("-ERR request buffer limit exceeded\r\n");
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      void drain();
    });
    connection.on("error", () => connection.destroy());
  });
  server.listen(Number(process.env.PORT || 6379), process.env.HOST || "127.0.0.1", () => {
    console.info(`server listening on ${server.address().port}, PID: ${process.pid}`);
  });
  return server;
}

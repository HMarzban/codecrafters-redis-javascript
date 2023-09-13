const net = require("net");
const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  // Code for the master process
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  const numWorkers = os.cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Handle worker events
  cluster.on("fork", (worker) => {
    console.log(`Worker ${worker.process.pid} is forked`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    console.log("Forking a new worker...");
    cluster.fork();
  });
} else {
  // Code for worker processes
  const server = net.createServer({ keepAlive: true }, (connection) => {
    // Handle connection
    console.log("client connected, PID:", process.pid);

    connection.on("data", (data) => {
      connection.write("+PONG\r\n");
      if (data.toString().includes("exit")) {
        connection.write("You will be disconnected\r\n");
        connection.end();
      }
    });

    connection.on("end", () => {
      console.log("client disconnected, PID:", process.pid);
    });
  });

  server.listen(6379, () => {
    console.log(`server is listening, PID: ${process.pid}`);
  });
}

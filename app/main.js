const os = require("os");
const cluster = require("cluster");
const worker = require("./worker");
const IPC = require("./ipc");

if (cluster.isMaster) {
  // Code for the master process
  console.info(`Master ${process.pid} is running`);

  // Inter-process communication (IPC)
  IPC(cluster);

  // Fork workers
  const numWorkers = os.cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Handle worker events
  cluster.on("fork", (worker) => {
    console.info(`Worker ${worker.process.pid} is forked`);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.info(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    console.info("Forking a new worker...");
    cluster.fork();
  });
} else {
  worker();
}

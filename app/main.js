const os = require("os");
const cluster = require("cluster");
const server = require("./worker")();

if (cluster.isMaster) {
  // Code for the master process
  console.log(`Master ${process.pid} is running`);

  // The shared data store
  const dataStore = new Map();

  // Handle messages from worker
  cluster.on("message", (worker, message) => {
    if (message.command === "set") {
      dataStore.set(message.key, message.value);
      worker.send({ status: "ok" });
    } else if (message.command === "get") {
      const value = dataStore.get(message.key);
      worker.send({ value: value });
    } else if (message.command === "delete") {
      if (dataStore.has(message.key)) {
        dataStore.delete(message.key);
        worker.send({ status: "ok" });
      } else {
        worker.send({ status: "not_found" });
      }
    }
  });

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
  server.listen(6379, () => {
    console.log(`server is listening, PID: ${process.pid}`);
  });
}

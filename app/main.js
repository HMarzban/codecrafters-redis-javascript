const os = require("os");
const cluster = require("cluster");
const server = require("./worker")();

if (cluster.isMaster) {
  // Code for the master process
  console.info(`Master ${process.pid} is running`);

  // The shared data store
  const dataStore = new Map();

  // Handle messages from worker
  cluster.on("message", (worker, message) => {
    console.log("message worker =>>", { message });
    if (message.command === "set") {
      dataStore.set(message.key, message.value);
      console.log("set");
      worker.send({ status: "ok" });
    } else if (message.command === "has") {
      const hasKey = dataStore.has(message.key);
      worker.send({ exists: hasKey });
    } else if (message.command === "get") {
      console.log("get");
      const value = dataStore.get(message.key);
      console.log("workersend data =>", { value: value, message });
      worker.send({ value: value });
    } else if (message.command === "delete") {
      if (dataStore.has(message.key)) {
        dataStore.delete(message.key);
        console.log("delete");
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
  server.listen(6379, () => {
    console.info(`server is listening, PID: ${process.pid}`);
  });
}

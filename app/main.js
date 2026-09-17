import cluster from "node:cluster";
import startWorkerProcess from "./worker.js";
import IPC from "./ipc.js";

function startMasterProcess() {
  console.info(`Master ${process.pid} is running`);

  // Inter-process communication (IPC)
  IPC(cluster);

  cluster.setupPrimary({ serialization: "advanced" });

  // Fork workers
  const defaultNumWorkers = 1;
  const numWorkers = process.env.WORKER_COUNT || defaultNumWorkers;

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  let shuttingDown = false;
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      shuttingDown = true;
      for (const worker of Object.values(cluster.workers)) worker.kill(signal);
    });
  }

  // Handle worker events
  cluster.on("fork", (workerInstance) => {
    console.info(`Worker ${workerInstance.process.pid} is forked`);
  });

  cluster.on("exit", (workerInstance, code, signal) => {
    console.info(
      `Worker ${workerInstance.process.pid} died with code ${code} and signal ${signal}`
    );
    console.info("Forking a new worker...");
    if (!shuttingDown) cluster.fork();
  });
}

cluster.isPrimary ? startMasterProcess() : startWorkerProcess();

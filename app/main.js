import os from "node:os";
import cluster from "node:cluster";
import startWorkerProcess from "./worker.js";
import IPC from "./ipc.js";

function startMasterProcess() {
  console.info(`Master ${process.pid} is running`);

  // Inter-process communication (IPC)
  IPC(cluster);

  // Fork workers
  const defaultNumWorkers = os.cpus().length;
  const numWorkers = process.env.WORKER_COUNT || defaultNumWorkers;

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
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
    cluster.fork();
  });
}

cluster.isPrimary ? startMasterProcess() : startWorkerProcess();

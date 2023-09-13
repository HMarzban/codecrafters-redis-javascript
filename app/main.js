const cluster = require("cluster");
const os = require("os");
const server = require("./worker");

// if (cluster.isMaster) {
//   // Code for the master process
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers
//   const numWorkers = os.cpus().length;
//   for (let i = 0; i < numWorkers; i++) {
//     cluster.fork();
//   }

//   // Handle worker events
//   cluster.on("fork", (worker) => {
//     console.log(`Worker ${worker.process.pid} is forked`);
//   });

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(
//       `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
//     );
//     console.log("Forking a new worker...");
//     cluster.fork();
//   });
// } else {
server.listen(6379, () => {
  console.log(`server is listening, PID: ${process.pid}`);
});
// }

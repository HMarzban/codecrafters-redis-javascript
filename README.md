[![progress-banner](https://backend.codecrafters.io/progress/redis/b26b2620-8a48-4af9-b624-3729b82c74a7)](https://app.codecrafters.io/users/HMarzban?r=2qF)

This is a 
["Build Your Own Redis" Challenge](https://codecrafters.io/challenges/redis).### About CodeCrafters Challenge

This is a part of the "Build Your Own Redis" challenge by CodeCrafters. The goal of the challenge is to understand the underlying concepts of Redis by building a basic version from scratch.

Welcome to my solution for the [codecrafters](https://app.codecrafters.io/) Redis challenge! In this repository, I've created a toy Redis clone that not only handles the basic commands like PING, GET, and SET but also includes an extended set of features that was not in the challenge. With benchmarking tools and extensive testing, this repository is meant to be both an educational resource and a fun exploration into the world of Redis.

## Features

- Implementation of basic Redis commands: PING, GET, SET.
- Extended command set including: DEL, ECHO, TTL.
- Comprehensive testing with the `test.sh` script to test various command combinations.
- Benchmarking capabilities with the `benchmark.sh` script to measure performance.
- Scalable worker processes with environment-variable-based control for parallel processing. _(nodejs, singel thread give you the best perfomance)_



## Getting Started

1. Clone the repository

3. Make sure you have [nodejs](https://nodejs.org/) and [redis-cli](https://redis.io/docs/ui/cli/) installed on your machine.

2. Start the application:

```sh
npm start
```

For custom worker counts, use the provided npm scripts:

- `npm run start:worker4`: Start with 4 worker processes.
- `npm run start:worker2`: Start with 2 worker processes.
- `npm run start:worker1`: Start with a single worker process.

## Testing

Execute the test script to test the implemented commands:

```sh
npm run test
```

## Benchmarking

To evaluate the performance, you can use the benchmarking script:

```sh
npm run benchmark
```

> Note: in order to run the benchmark and test scripts, node app must be running in the background.

# Codecrafters Redis in JavaScript

[![Codecrafters Challenge Progress](https://backend.codecrafters.io/progress/redis/b26b2620-8a48-4af9-b624-3729b82c74a7)](https://app.codecrafters.io/users/HMarzban?r=2qF)

Welcome! This is my take on the [Codecrafters Redis Challenge](https://codecrafters.io/challenges/redis) Redis Challenge. I've delved deep into the heart of Redis and ended up crafting my own little version in JavaScript. Dive in and check it out!

## Introduction

Welcome to my solution for the [Codecrafters](https://codecrafters.io/challenges/redis) Redis challenge! In this repository, I've created a toy Redis clone that not only handles the basic commands like `PING`, `GET`, and `SET` but also includes an extended `SET` of features <u>that was not in the challenge</u>. With benchmarking tools and extensive testing, this repository is meant to be both an educational resource and a fun exploration into the world of Redis.

## Features

### SET Command

Syntax

```sh
SET key value [NX | XX] [GET] [EX seconds | PX milliseconds |
  EXAT unix-time-seconds | PXAT unix-time-milliseconds | KEEPTTL]
```

Supportet Options:

- `EX` seconds -- Set the specified expire time, in seconds.
- `PX` milliseconds -- Set the specified expire time, in milliseconds.
- `EXAT` timestamp-seconds -- Set the specified Unix time at which the key will expire, in seconds.
- `PXAT` timestamp-milliseconds -- Set the specified Unix time at which the key will expire, in milliseconds.
- `NX` -- Only set the key if it does not already exist.
- `XX` -- Only set the key if it already exists.
- `KEEPTTL` -- Retain the time to live associated with the key.
- `GET` -- Return the old string stored at key, or nil if key did not exist. An error is returned and SET aborted if the value stored at key is not a string.

### Other Commands

- `DEL`  -- Delete a key
- `ECHO` -- Echo the given string
- `TTL`  -- Get the time to live for a key
- `PING` -- Ping the server
- `EXIT` -- Quit the server

### Additional Features

- **Robust Testing**: Leveraged the `test.sh` script to ensure all command combinations operate as expected.
- **Performance Benchmarking**: Introduced `benchmark.sh` for performance measurement and analysis.
- **Scalable Workers**: Easily scale worker processes using environment variables. (nodejs, singel thread give you the best perfomance)

## Getting Started

### Prerequisites

Ensure [Node.js](https://nodejs.org/) and [redis-cli](https://redis.io/docs/ui/cli/) are installed on your machine.

### Setup & Running

1. **Clone the Repository**:

   ```sh
   git clone https://github.com/HMarzban/codecrafters-redis-javascript.git
   ```

2. **Start the Application:**

   ```sh
   npm start
   ```

To customize the worker count:

- 4 Workers: `npm run start:worker4`
- 2 Workers: `npm run start:worker2`
- Single Worker: `npm run start:worker1`

## Testing

Run the test script to validate the command implementations:

```sh
npm run test
```

## Benchmarking

Analyze the performance of the system with the benchmarking script:

```sh
npm run benchmark
```

> Note: Ensure the node application is hitting in the background before initiating tests or benchmarks.

I hope you find this project insightful and get a deeper understanding of how Redis works in the background. If you're curious like me, dive in and have fun learning!

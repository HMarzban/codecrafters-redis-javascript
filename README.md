# A Redis learning implementation in JavaScript

This started with the [CodeCrafters Redis challenge](https://codecrafters.io/challenges/redis)
and grew into an experiment with RESP framing, TCP streams and a shared store behind
Node.js cluster workers. It is an in-memory learning project, not a Redis replacement.

## Run

Node.js 22+ is required. There are no npm dependencies.

```sh
npm start                         # one worker, 127.0.0.1:6379
WORKER_COUNT=2 PORT=6380 npm start  # shared primary store, two TCP workers
npm test                          # isolated TCP/cluster fixtures; no Redis install
```

`HOST` changes the bind address. There is no authentication; keep the learning server
on loopback. The in-memory store disappears when the primary process exits.

## Implemented scope

| Area | Behavior |
| --- | --- |
| Protocol | RESP2 arrays of bulk strings; fragmented and coalesced TCP requests; binary-safe keys/values and replies. |
| Commands | `PING [message]`, `ECHO`, `GET`, `SET`, `DEL`, `TTL`, and a custom `EXIT`. |
| SET options | `NX`, `XX`, `GET`, `EX`, `PX`, `EXAT`, `PXAT`, `KEEPTTL`; conditional writes are atomic in the primary. |
| Expiry | Checked on access; updating expiry cannot be undone by an older timer. |
| Concurrency | Ordered replies per connection and correlated worker/primary IPC requests. |
| Limits | 1 MiB request/buffer limit and 1,024 command arguments; malformed frames close the connection with an error. |

Not implemented: persistence, replication, Redis Cluster, pub/sub, transactions,
RESP3, inline commands, authentication, eviction or production resource management.
Expired entries that are never read again remain allocated; the store has no memory
limit. Replies do not yet implement socket backpressure. These are deliberate limits
of this learning scope, not guarantees of Redis compatibility.

## Verification

`npm test` exercises byte splits, pipelines, binary/empty values, protocol and command
errors, expiry replacement, conditional options and concurrent clients on two workers.
GitHub Actions runs these fixtures on Node 22 and 24.

The earlier redis-cli shell assertions remain available:

```sh
PORT=6380 npm run test:legacy # requires a separately running server on that port
```

## Benchmark methodology

The original harness is available as `npm run benchmark -- 1000 100`. It starts a new
redis-cli process/connection for each operation, so its mean includes client startup,
shell and network costs. It does **not** measure isolated server latency. The former
package script referenced a nonexistent filename; it now invokes `benchmark.sh`.

For a persistent-client experiment, install the Redis tools and run against a separate
learning server:

```sh
redis-benchmark -h 127.0.0.1 -p 6380 -t set,get -n 10000 -c 20 -d 100 --csv
```

Record the commit, Node version, OS/CPU/RAM, worker count, client count, payload size,
request count, throughput, latency percentiles and errors. Compare the same workload
and environment, repeat runs, and retain raw output. No benchmark results or speedup
claims are supplied by this maintenance pass.

## License

The original package manifest declares MIT, but the repository has no standalone
license file. This maintenance pass does not add or change licensing terms.

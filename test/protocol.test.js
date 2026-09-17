import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { parseRequest, bulk, MAX_REQUEST_BYTES } from '../app/resp.js';

const frame = (...values) => Buffer.concat([
  Buffer.from(`*${values.length}\r\n`), ...values.map(value => bulk(Buffer.isBuffer(value) ? value : String(value))),
]);
let processHandle;
let port;
before(async () => {
  processHandle = spawn(process.execPath, ['app/main.js'], {
    env: { ...process.env, PORT: '0', WORKER_COUNT: '2' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server startup timed out')), 5000);
    processHandle.stdout.on('data', data => {
      const match = String(data).match(/server listening on (\d+)/);
      if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
    });
    processHandle.once('error', error => { clearTimeout(timeout); reject(error); });
    processHandle.once('exit', code => { clearTimeout(timeout); reject(new Error(`server exited: ${code}`)); });
  });
});
after(async () => {
  if (processHandle?.exitCode === null) {
    const exited = once(processHandle, 'exit');
    processHandle.kill('SIGTERM');
    await exited;
  }
});

async function client(t) {
  const socket = net.connect(port, '127.0.0.1');
  await once(socket, 'connect');
  t.after(() => socket.destroy());
  let received = Buffer.alloc(0);
  socket.on('data', data => { received = Buffer.concat([received, data]); });
  return {
    socket,
    async expect(expected) {
      expected = Buffer.isBuffer(expected) ? expected : Buffer.from(expected);
      const started = Date.now();
      while (received.length < expected.length && Date.now() - started < 2500) await delay(5);
      assert.deepEqual(received.subarray(0, expected.length), expected);
      received = received.subarray(expected.length);
    },
  };
}

test('length parser preserves every byte and every possible split', () => {
  const payload = Buffer.from([0, 255, 36, 13, 10, 226, 130, 172]);
  const request = frame('ECHO', payload);
  for (let split = 0; split < request.length; split++) assert.equal(parseRequest(request.subarray(0, split)), null);
  const parsed = parseRequest(Buffer.concat([request, frame('PING')]));
  assert.deepEqual(parsed.args, [Buffer.from('ECHO'), payload]);
  assert.equal(parsed.bytes, request.length);
});

test('invalid RESP lengths and terminators are rejected', () => {
  for (const text of ['*0\r\n', '*-1\r\n', '*1x\r\n', '*1\r\n$-1\r\n', '*1\r\n$1\r\naXX', `*1\r\n$${MAX_REQUEST_BYTES + 1}\r\n`]) {
    assert.throws(() => parseRequest(Buffer.from(text)));
  }
  assert.throws(() => parseRequest(Buffer.from([42, 177, 13, 10])));
});

test('fragmented command and pipelined commands keep reply order', async t => {
  const c = await client(t);
  const request = frame('SET', 'pipe', 'first');
  for (const byte of request) c.socket.write(Buffer.from([byte]));
  c.socket.write(Buffer.concat([frame('GET', 'pipe'), frame('SET', 'pipe', 'second'), frame('GET', 'pipe'), frame('PING')]));
  await c.expect(Buffer.concat([Buffer.from('+OK\r\n'), bulk('first'), Buffer.from('+OK\r\n'), bulk('second'), Buffer.from('+PONG\r\n')]));
});

test('binary keys, values, empty values and CRLF round-trip', async t => {
  const c = await client(t);
  const key = Buffer.from([255, 0, 13, 10]);
  const value = Buffer.from([255, 36, 13, 10, 0, 195, 169]);
  c.socket.write(Buffer.concat([frame('SET', key, value), frame('GET', key), frame('ECHO', value), frame('SET', 'empty', ''), frame('GET', 'empty')]));
  await c.expect(Buffer.concat([Buffer.from('+OK\r\n'), bulk(value), bulk(value), Buffer.from('+OK\r\n'), bulk('')]));
});

test('command errors do not desynchronize a pipeline', async t => {
  const c = await client(t);
  c.socket.write(Buffer.concat([frame('BOGUS'), frame('GET'), frame('SET', 'x', 'y', 'PX', 'NaN'), frame('PING')]));
  await c.expect('-ERR unknown command\r\n-ERR wrong number of arguments\r\n-ERR invalid expire time in \'set\' command\r\n+PONG\r\n');
});

test('malformed requests return an error and close the connection', async t => {
  const c = await client(t);
  const ended = once(c.socket, 'end');
  c.socket.write('*1\r\n$1\r\naXX');
  await c.expect('-ERR protocol or command processing error\r\n');
  await ended;
});

test('expiry replacement, conditional writes, GET and KEEPTTL', async t => {
  const c = await client(t);
  c.socket.write(Buffer.concat([frame('SET', 'expiry', 'old', 'PX', 30), frame('SET', 'expiry', 'new', 'PX', 5000), frame('SET', 'expiry', 'ignored', 'NX'), frame('SET', 'expiry', 'kept', 'KEEPTTL', 'GET'), frame('SET', 'absent', 'no', 'XX')]));
  await c.expect(Buffer.concat([Buffer.from('+OK\r\n+OK\r\n$-1\r\n'), bulk('new'), bulk(null)]));
  await delay(60);
  c.socket.write(Buffer.concat([frame('GET', 'expiry'), frame('TTL', 'expiry'), frame('SET', 'short', 'gone', 'PX', 20)]));
  await c.expect(Buffer.concat([bulk('kept'), Buffer.from(':5\r\n+OK\r\n')]));
  await delay(40);
  c.socket.write(Buffer.concat([frame('GET', 'short'), frame('TTL', 'short'), frame('DEL', 'short'), frame('SET', 'plain', 'x'), frame('TTL', 'plain')]));
  await c.expect('$-1\r\n:-2\r\n:0\r\n+OK\r\n:-1\r\n');
});

test('concurrent clients receive their own IPC responses', async t => {
  await Promise.all(Array.from({ length: 12 }, async (_, id) => {
    const c = await client(t);
    for (let n = 0; n < 10; n++) {
      const value = `${id}:${n}`;
      c.socket.write(Buffer.concat([frame('SET', `client:${id}`, value), frame('GET', `client:${id}`)]));
      await c.expect(Buffer.concat([Buffer.from('+OK\r\n'), bulk(value)]));
    }
  }));
});

// RESP2 command arrays use byte lengths, not JavaScript string lengths.
export const MAX_REQUEST_BYTES = 1024 * 1024;
const CRLF = Buffer.from("\r\n");

export function parseRequest(buffer) {
  let offset = 0;
  function length(prefix, maximum) {
    if (offset >= buffer.length) return null;
    if (buffer[offset] !== prefix.charCodeAt(0)) throw new Error(`expected '${prefix}'`);
    const end = buffer.indexOf(CRLF, offset);
    if (end === -1) return null;
    const text = buffer.toString("latin1", offset + 1, end);
    if (!/^(0|[1-9][0-9]*)$/.test(text)) throw new Error("invalid length");
    const value = Number(text);
    if (!Number.isSafeInteger(value) || value > maximum) throw new Error("request too large");
    offset = end + 2;
    return value;
  }
  const count = length("*", 1024);
  if (count === null) return null;
  if (count === 0) throw new Error("empty command");
  const args = [];
  for (let i = 0; i < count; i++) {
    const size = length("$", MAX_REQUEST_BYTES);
    if (size === null) return null;
    if (offset + size + 2 > MAX_REQUEST_BYTES) throw new Error("request too large");
    if (buffer.length < offset + size + 2) return null;
    if (!buffer.subarray(offset + size, offset + size + 2).equals(CRLF)) {
      throw new Error("invalid bulk string terminator");
    }
    args.push(Buffer.from(buffer.subarray(offset, offset + size)));
    offset += size + 2;
  }
  return { args, bytes: offset };
}

export function bulk(value) {
  if (value === null || value === undefined) return Buffer.from("$-1\r\n");
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return Buffer.concat([Buffer.from(`$${bytes.length}\r\n`), bytes, CRLF]);
}

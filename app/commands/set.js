import db from "../db.js";
import { bulk } from "../resp.js";

export default async function SET(connection, args) {
  const [key, value, ...flags] = args;
  const options = { condition: null, keepTTL: false, expiresAt: null };
  let returnPrevious = false;
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i].toString("ascii").toLowerCase();
    if ((flag === "nx" || flag === "xx") && !options.condition) options.condition = flag;
    else if (flag === "get" && !returnPrevious) returnPrevious = true;
    else if (flag === "keepttl" && options.expiresAt === null && !options.keepTTL) options.keepTTL = true;
    else if (["ex", "px", "exat", "pxat"].includes(flag) && options.expiresAt === null && !options.keepTTL) {
      const raw = flags[++i]?.toString("ascii") ?? "";
      const time = Number(raw);
      const milliseconds = time * (flag === "ex" || flag === "exat" ? 1000 : 1);
      const absolute = flag === "exat" || flag === "pxat";
      if (!/^[0-9]+$/.test(raw) || !Number.isSafeInteger(milliseconds) || time <= 0 ||
          (!absolute && !Number.isSafeInteger(Date.now() + milliseconds))) {
        connection.write("-ERR invalid expire time in 'set' command\r\n");
        return;
      }
      options.expiresAt = absolute ? milliseconds : Date.now() + milliseconds;
    } else {
      connection.write("-ERR syntax error\r\n");
      return;
    }
  }
  const result = await db.set(key, value, options);
  connection.write(returnPrevious ? bulk(result.previous) : result.applied ? "+OK\r\n" : bulk(null));
}

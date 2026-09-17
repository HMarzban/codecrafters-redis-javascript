import db from "../db.js";
export default async (connection, [key]) => connection.write(`:${await db.ttl(key)}\r\n`);

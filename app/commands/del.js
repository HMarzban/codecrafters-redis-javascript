import db from "../db.js";
export default async (connection, keys) => connection.write(`:${await db.delete(keys)}\r\n`);

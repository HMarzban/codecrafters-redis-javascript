import db from "../db.js";
import { bulk } from "../resp.js";
export default async (connection, [key]) => connection.write(bulk(await db.get(key)));

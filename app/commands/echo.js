import { bulk } from "../resp.js";
export default (connection, [value]) => connection.write(bulk(value));
